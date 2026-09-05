import AsyncStorage from '@react-native-async-storage/async-storage';
import {getPlayerStats} from './gameStorage';
import {supabase, isSupabaseConfigured} from './supabaseClient';

const PROFILE_KEY = 'QUIZZO_USER_PROFILE';
const ONBOARDED_KEY = 'QUIZZO_HAS_ONBOARDED';

/**
 * Check if the user has completed onboarding/login
 */
export const checkHasOnboarded = async () => {
  try {
    const val = await AsyncStorage.getItem(ONBOARDED_KEY);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Set user as onboarded
 */
export const setOnboarded = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
  } catch (e) {
    // Ignored
  }
};

/**
 * Clear user onboarded status (on logout)
 */
export const clearOnboarded = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDED_KEY);
  } catch (e) {
    // Ignored
  }
};

export const AVATAR_OPTIONS = [
  '🦁',
  '🚀',
  '👑',
  '🦊',
  '⚡',
  '🤖',
  '🦄',
  '🐼',
  '🦉',
  '🐯',
];

/**
 * Gets or initializes the user profile.
 */
export const getUserProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    const initialProfile = {
      id: 'player_' + Math.random().toString(36).substring(2, 9),
      name: 'Player One',
      avatar: '🚀',
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(initialProfile));
    return initialProfile;
  } catch (e) {
    return {id: 'local_player', name: 'Player One', avatar: '🚀'};
  }
};

/**
 * Resets user profile to default (e.g. on logout)
 */
export const resetUserProfile = async () => {
  try {
    const defaultProfile = {
      id: 'player_' + Math.random().toString(36).substring(2, 9),
      name: 'Player One',
      avatar: '🚀',
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  } catch (e) {
    return {id: 'local_player', name: 'Player One', avatar: '🚀'};
  }
};

/**
 * Updates the user's name and avatar locally and syncs to Supabase.
 */
export const updateUserProfile = async (name, avatar) => {
  try {
    const current = await getUserProfile();
    const updated = {
      ...current,
      name: name?.trim() || 'Player One',
      avatar: avatar || '🚀',
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));

    // Sync updated profile to cloud in the background
    syncPlayerToLeaderboard().catch(() => {});

    return updated;
  } catch (e) {
    return null;
  }
};

/**
 * Syncs the local player's XP and profile to the Supabase leaderboard table.
 */
export const syncPlayerToLeaderboard = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const [profile, stats] = await Promise.all([
      getUserProfile(),
      getPlayerStats(),
    ]);

    const payload = {
      id: profile.id,
      name: profile.name || 'Player One',
      avatar: profile.avatar || '🚀',
      xp: stats.totalXP || 0,
      level: stats?.levelInfo?.level || 1,
      streak: stats.streak || 0,
      updated_at: new Date().toISOString(),
    };

    const {error} = await supabase
      .from('leaderboard')
      .upsert(payload, {onConflict: 'id'});

    if (error) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Fetches real-time leaderboard from Supabase (or fallback if offline/not configured).
 */
export const fetchGlobalLeaderboard = async (timeframe = 'all-time') => {
  try {
    const [profile, stats] = await Promise.all([
      getUserProfile(),
      getPlayerStats(),
    ]);

    let cloudPlayers = [];
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        // Query live leaderboard with deterministic order
        let query = supabase
          .from('leaderboard')
          .select('*')
          .order('xp', {ascending: false})
          .order('streak', {ascending: false})
          .order('name', {ascending: true})
          .limit(50);

        if (timeframe === 'weekly') {
          const oneWeekAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString();
          query = query.gte('updated_at', oneWeekAgo);
        }

        const {data, error} = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          cloudPlayers = data.map(item => ({
            id: item.id || item.name || Math.random().toString(),
            name: item.name || 'Anonymous',
            avatar: item.avatar || '🚀',
            xp: item.xp || 0,
            level: item.level || 1,
            streak: item.streak || 0,
            isCurrentUser: item.id === profile.id,
          }));

          // Deterministic tie-breaking sort so list NEVER jumbles
          cloudPlayers.sort((a, b) => {
            if (b.xp !== a.xp) {
              return b.xp - a.xp;
            }
            if (b.streak !== a.streak) {
              return b.streak - a.streak;
            }
            return (a.name || '').localeCompare(b.name || '');
          });
        }
      } catch (err) {
        // Fall back to local data if cloud request failed
      }
    }

    if (cloudPlayers.length === 0) {
      throw new Error('Leaderboard is currently down or unreachable.');
    }

    // Assign ranking indices
    const ranked = cloudPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
      name: player.isCurrentUser ? `${player.name} (You)` : player.name,
    }));

    const userRankInfo = ranked.find(p => p.isCurrentUser) || null;

    return {
      leaderboard: ranked,
      userRankInfo,
      isRealtime: hasSupabase,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Subscribes to real-time Postgres changes on the leaderboard table with debouncing.
 */
export const subscribeToLeaderboardChanges = onChangeCallback => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    let debounceTimer = null;
    const channel = supabase
      .channel('public:leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard',
        },
        () => {
          if (typeof onChangeCallback === 'function') {
            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
              onChangeCallback();
            }, 1200);
          }
        },
      )
      .subscribe();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // Ignored
      }
    };
  } catch (e) {
    return () => {};
  }
};
