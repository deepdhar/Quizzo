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

const DEFAULT_GLOBAL_LEADERBOARD = [
  {id: '1', name: 'BrainiacMax', avatar: '👑', xp: 4820, level: 7, streak: 14},
  {id: '2', name: 'TriviaQueen', avatar: '🦄', xp: 4210, level: 6, streak: 11},
  {id: '3', name: 'QuizMaster99', avatar: '⚡', xp: 3650, level: 6, streak: 9},
  {id: '4', name: 'SpeedyThinker', avatar: '🚀', xp: 2980, level: 5, streak: 8},
  {id: '5', name: 'CosmicOwl', avatar: '🦉', xp: 2450, level: 5, streak: 6},
  {id: '6', name: 'CyberPanda', avatar: '🐼', xp: 1980, level: 4, streak: 5},
  {id: '7', name: 'StarGazer', avatar: '🦊', xp: 1620, level: 4, streak: 4},
  {id: '8', name: 'RoboSmart', avatar: '🤖', xp: 1240, level: 4, streak: 3},
  {id: '9', name: 'LionHeart', avatar: '🦁', xp: 950, level: 3, streak: 2},
  {id: '10', name: 'ApexSeeker', avatar: '🐯', xp: 720, level: 3, streak: 2},
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

    // Sync updated profile to cloud
    await syncPlayerToLeaderboard();

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
        // Sync local stats to cloud on fetch
        await syncPlayerToLeaderboard();

        // Query live leaderboard
        let query = supabase
          .from('leaderboard')
          .select('*')
          .order('xp', {ascending: false})
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
            id: item.id || Math.random().toString(),
            name: item.name || 'Anonymous',
            avatar: item.avatar || '🚀',
            xp: item.xp || 0,
            level: item.level || 1,
            streak: item.streak || 0,
            isCurrentUser: item.id === profile.id,
          }));
        }
      } catch (err) {
        // Fall back to local data if cloud request failed
      }
    }

    // Fallback if cloud has no records yet or Supabase isn't configured
    if (cloudPlayers.length === 0) {
      const multiplier = timeframe === 'weekly' ? 0.35 : 1;
      const userEntry = {
        id: profile.id,
        name: profile.name || 'Player One',
        avatar: profile.avatar || '🚀',
        xp: Math.round((stats.totalXP || 0) * multiplier),
        level: stats?.levelInfo?.level || 1,
        streak: stats.streak || 0,
        isCurrentUser: true,
      };

      const others = DEFAULT_GLOBAL_LEADERBOARD.map(p => ({
        ...p,
        xp: Math.round(p.xp * multiplier),
        isCurrentUser: false,
      }));

      cloudPlayers = [...others, userEntry].sort((a, b) => b.xp - a.xp);
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
    return {leaderboard: [], userRankInfo: null, isRealtime: false};
  }
};

/**
 * Subscribes to real-time Postgres changes on the leaderboard table.
 */
export const subscribeToLeaderboardChanges = onChangeCallback => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
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
            onChangeCallback();
          }
        },
      )
      .subscribe();

    return () => {
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
