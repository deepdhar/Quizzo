import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOTAL_XP: 'QUIZZO_TOTAL_XP',
  STREAK_COUNT: 'QUIZZO_STREAK_COUNT',
  LAST_PLAYED_DATE: 'QUIZZO_LAST_PLAYED_DATE',
  GAMES_PLAYED: 'QUIZZO_GAMES_PLAYED',
  LIFELINES_5050: 'QUIZZO_LIFELINES_5050',
};

// Player Level Tiers
export const LEVEL_TIERS = [
  {level: 1, title: 'Novice Thinker', icon: '🐣', minXP: 0, maxXP: 100},
  {level: 2, title: 'Curious Scout', icon: '🌱', minXP: 100, maxXP: 250},
  {level: 3, title: 'Brain Explorer', icon: '🧠', minXP: 250, maxXP: 500},
  {level: 4, title: 'Trivia Prodigy', icon: '⚡', minXP: 500, maxXP: 1000},
  {level: 5, title: 'Quiz Master', icon: '🏆', minXP: 1000, maxXP: 2000},
  {level: 6, title: 'Grand Champion', icon: '👑', minXP: 2000, maxXP: 3500},
  {level: 7, title: 'Trivia Deity', icon: '🌌', minXP: 3500, maxXP: 99999},
];

/**
 * Calculates current level information based on total XP.
 */
export const calculateLevelInfo = totalXP => {
  const xp = Math.max(0, parseInt(totalXP, 10) || 0);

  let currentTier = LEVEL_TIERS[0];
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (xp >= LEVEL_TIERS[i].minXP) {
      currentTier = LEVEL_TIERS[i];
    } else {
      break;
    }
  }

  const range = currentTier.maxXP - currentTier.minXP;
  const currentInTier = xp - currentTier.minXP;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentInTier / range) * 100),
  );

  return {
    level: currentTier.level,
    title: currentTier.title,
    icon: currentTier.icon,
    totalXP: xp,
    minXP: currentTier.minXP,
    maxXP: currentTier.maxXP,
    xpToNextLevel: Math.max(0, currentTier.maxXP - xp),
    progressPercent: Math.round(progressPercent),
  };
};

/**
 * Retrieves the stored player statistics and validates the current streak.
 */
export const getPlayerStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [rawXP, rawStreak, lastDate, rawGames, rawLifelines] =
      await Promise.all([
        AsyncStorage.getItem(KEYS.TOTAL_XP),
        AsyncStorage.getItem(KEYS.STREAK_COUNT),
        AsyncStorage.getItem(KEYS.LAST_PLAYED_DATE),
        AsyncStorage.getItem(KEYS.GAMES_PLAYED),
        AsyncStorage.getItem(KEYS.LIFELINES_5050),
      ]);

    const totalXP = parseInt(rawXP || '0', 10);
    let streak = parseInt(rawStreak || '0', 10);
    const gamesPlayed = parseInt(rawGames || '0', 10);
    let lifelines = rawLifelines !== null ? parseInt(rawLifelines, 10) : 3; // Default 3 free lifelines

    // Check streak decay if days were missed
    if (lastDate && lastDate !== today) {
      const todayDate = new Date(today);
      const prevDate = new Date(lastDate);
      const diffTime = Math.abs(todayDate - prevDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Missed more than 1 day: Streak resets to 0 until played today
        streak = 0;
        await AsyncStorage.setItem(KEYS.STREAK_COUNT, '0');
      }
    }

    const levelInfo = calculateLevelInfo(totalXP);

    return {
      totalXP,
      streak,
      gamesPlayed,
      lifelines,
      lastPlayedDate: lastDate || null,
      levelInfo,
    };
  } catch (error) {
    return {
      totalXP: 0,
      streak: 0,
      gamesPlayed: 0,
      lifelines: 3,
      lastPlayedDate: null,
      levelInfo: calculateLevelInfo(0),
    };
  }
};

/**
 * Records a completed quiz session, updates XP, streaks, games count, and checks for level up.
 */
export const recordGameFinished = async earnedXP => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const prevStats = await getPlayerStats();

    const previousLevel = prevStats.levelInfo.level;
    const newTotalXP = prevStats.totalXP + earnedXP;
    const newGamesPlayed = prevStats.gamesPlayed + 1;

    let newStreak = prevStats.streak;
    if (!prevStats.lastPlayedDate) {
      newStreak = 1;
    } else if (prevStats.lastPlayedDate === today) {
      // Already played today: keep current streak
      if (newStreak === 0) {
        newStreak = 1;
      }
    } else {
      const todayDate = new Date(today);
      const prevDate = new Date(prevStats.lastPlayedDate);
      const diffTime = Math.abs(todayDate - prevDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    await Promise.all([
      AsyncStorage.setItem(KEYS.TOTAL_XP, newTotalXP.toString()),
      AsyncStorage.setItem(KEYS.STREAK_COUNT, newStreak.toString()),
      AsyncStorage.setItem(KEYS.LAST_PLAYED_DATE, today),
      AsyncStorage.setItem(KEYS.GAMES_PLAYED, newGamesPlayed.toString()),
    ]);

    const newLevelInfo = calculateLevelInfo(newTotalXP);
    const hasLeveledUp = newLevelInfo.level > previousLevel;

    return {
      totalXP: newTotalXP,
      streak: newStreak,
      gamesPlayed: newGamesPlayed,
      levelInfo: newLevelInfo,
      hasLeveledUp,
      earnedXP,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Deducts a 50:50 lifeline (or costs 30 XP if no free ones left).
 */
export const apply5050Lifeline = async () => {
  try {
    const stats = await getPlayerStats();
    if (stats.lifelines > 0) {
      const remaining = stats.lifelines - 1;
      await AsyncStorage.setItem(KEYS.LIFELINES_5050, remaining.toString());
      return {success: true, remainingLifelines: remaining, spentXP: 0};
    }

    // Spend 30 XP if no free lifelines
    if (stats.totalXP >= 30) {
      const newXP = stats.totalXP - 30;
      await AsyncStorage.setItem(KEYS.TOTAL_XP, newXP.toString());
      return {success: true, remainingLifelines: 0, spentXP: 30};
    }

    return {success: false, reason: 'Not enough XP (Needs 30 XP)'};
  } catch (error) {
    return {success: false, reason: 'Storage error'};
  }
};
