import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOTAL_XP: 'QUIZZO_TOTAL_XP',
  STREAK_COUNT: 'QUIZZO_STREAK_COUNT',
  LAST_PLAYED_DATE: 'QUIZZO_LAST_PLAYED_DATE',
  GAMES_PLAYED: 'QUIZZO_GAMES_PLAYED',
  LIFELINES_5050: 'QUIZZO_LIFELINES_5050',
  BEST_SCORE: 'QUIZZO_BEST_SCORE',
  PLAYED_CATEGORIES: 'QUIZZO_PLAYED_CATEGORIES',
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

// Achievement definitions tracked dynamically
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_quiz',
    icon: '✅',
    label: 'First Quiz',
    sub: 'Complete 1 quiz',
    check: stats => (stats.gamesPlayed || 0) >= 1,
    progress: stats => `${Math.min(stats.gamesPlayed || 0, 1)}/1`,
  },
  {
    id: 'quick_thinker',
    icon: '🧠',
    label: 'Quick Thinker',
    sub: 'Score 8/10 or more',
    check: stats => (stats.bestScore || 0) >= 8,
    progress: stats => `${stats.bestScore || 0}/8`,
  },
  {
    id: 'streak_master',
    icon: '🔥',
    label: 'Streak Master',
    sub: '7 Days in a row',
    check: stats => (stats.streak || 0) >= 7,
    progress: stats => `${Math.min(stats.streak || 0, 7)}/7 d`,
  },
  {
    id: 'explorer',
    icon: '🗺️',
    label: 'Explorer',
    sub: 'Play 5 categories',
    check: stats => (stats.categoriesCount || 0) >= 5,
    progress: stats => `${Math.min(stats.categoriesCount || 0, 5)}/5`,
  },
  {
    id: 'quiz_prodigy',
    icon: '⚡',
    label: 'Trivia Star',
    sub: 'Earn 500 XP',
    check: stats => (stats.totalXP || 0) >= 500,
    progress: stats => `${Math.min(stats.totalXP || 0, 500)}/500`,
  },
  {
    id: 'champion',
    icon: '🏆',
    label: 'Level Leader',
    sub: 'Reach Level 3',
    check: stats => (stats.levelInfo?.level || 1) >= 3,
    progress: stats => `Lvl ${stats.levelInfo?.level || 1}/3`,
  },
];

export const getComputedAchievements = stats => {
  return ACHIEVEMENT_DEFINITIONS.map(ach => ({
    ...ach,
    isUnlocked: ach.check(stats),
    currentProgress: ach.progress(stats),
  }));
};

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

    const [
      rawXP,
      rawStreak,
      lastDate,
      rawGames,
      rawLifelines,
      rawBestScore,
      rawCategories,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.TOTAL_XP),
      AsyncStorage.getItem(KEYS.STREAK_COUNT),
      AsyncStorage.getItem(KEYS.LAST_PLAYED_DATE),
      AsyncStorage.getItem(KEYS.GAMES_PLAYED),
      AsyncStorage.getItem(KEYS.LIFELINES_5050),
      AsyncStorage.getItem(KEYS.BEST_SCORE),
      AsyncStorage.getItem(KEYS.PLAYED_CATEGORIES),
    ]);

    const totalXP = parseInt(rawXP || '0', 10);
    let streak = parseInt(rawStreak || '0', 10);
    const gamesPlayed = parseInt(rawGames || '0', 10);
    let lifelines = rawLifelines !== null ? parseInt(rawLifelines, 10) : 3;
    const bestScore = parseInt(rawBestScore || '0', 10);
    let categoriesPlayed = [];
    try {
      if (rawCategories) {
        categoriesPlayed = JSON.parse(rawCategories);
      }
    } catch (e) {
      categoriesPlayed = [];
    }

    // Check streak decay if days were missed
    if (lastDate && lastDate !== today) {
      const todayDate = new Date(today);
      const prevDate = new Date(lastDate);
      const diffTime = Math.abs(todayDate - prevDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
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
      bestScore,
      categoriesPlayed,
      categoriesCount: categoriesPlayed.length,
      lastPlayedDate: lastDate || null,
      levelInfo,
    };
  } catch (error) {
    return {
      totalXP: 0,
      streak: 0,
      gamesPlayed: 0,
      lifelines: 3,
      bestScore: 0,
      categoriesPlayed: [],
      categoriesCount: 0,
      lastPlayedDate: null,
      levelInfo: calculateLevelInfo(0),
    };
  }
};

/**
 * Records a completed quiz session, updates XP, streaks, games count, best score, categories, and level up.
 */
export const recordGameFinished = async (
  earnedXP,
  categoryName = null,
  correctCount = null,
) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const prevStats = await getPlayerStats();

    const previousLevel = prevStats.levelInfo.level;
    const newTotalXP = prevStats.totalXP + earnedXP;
    const newGamesPlayed = prevStats.gamesPlayed + 1;

    // Track best score
    const currentScoreCount =
      correctCount !== null ? correctCount : Math.round(earnedXP / 10);
    const newBestScore = Math.max(prevStats.bestScore || 0, currentScoreCount);

    // Track categories played
    let newCategories = Array.isArray(prevStats.categoriesPlayed)
      ? [...prevStats.categoriesPlayed]
      : [];
    if (categoryName && !newCategories.includes(categoryName)) {
      newCategories.push(categoryName);
    }

    let newStreak = prevStats.streak;
    if (!prevStats.lastPlayedDate) {
      newStreak = 1;
    } else if (prevStats.lastPlayedDate === today) {
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
      AsyncStorage.setItem(KEYS.BEST_SCORE, newBestScore.toString()),
      AsyncStorage.setItem(
        KEYS.PLAYED_CATEGORIES,
        JSON.stringify(newCategories),
      ),
    ]);

    const newLevelInfo = calculateLevelInfo(newTotalXP);
    const hasLeveledUp = newLevelInfo.level > previousLevel;

    return {
      totalXP: newTotalXP,
      streak: newStreak,
      gamesPlayed: newGamesPlayed,
      bestScore: newBestScore,
      categoriesPlayed: newCategories,
      categoriesCount: newCategories.length,
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
