import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {getPlayerStats, getComputedAchievements} from '../utils/gameStorage';

const {width} = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 32;
const CAROUSEL_HEIGHT = Math.round((CAROUSEL_WIDTH * 9) / 16);

// Days of the week for streak display
const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// High-res AI-generated banners with native overlay content
const CAROUSEL_DATA = [
  {
    id: '1',
    badge: 'DAILY CHALLENGE ⭐',
    heading: 'Can you score\n8/10?',
    sub: 'Test your knowledge today!',
    cta: 'PLAY NOW  ›',
    ctaColor: '#FFC857',
    ctaTextColor: '#25324A',
    badgeBg: 'rgba(255, 255, 255, 0.25)',
    textColor: '#FFFFFF',
    image: require('../assets/banners/gen_banner_daily_challenge.jpg'),
    action: 'quick_play',
  },
  {
    id: '2',
    badge: 'EXPLORE SPACE 🚀',
    heading: 'Discover the\nUniverse!',
    sub: '10 exciting questions about space.',
    cta: 'START QUIZ  ›',
    ctaColor: '#4F7DF3',
    ctaTextColor: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    textColor: '#FFFFFF',
    image: require('../assets/banners/gen_banner_explore_space.jpg'),
    action: 'space_quiz',
  },
  {
    id: '3',
    badge: 'KEEP IT GOING! 🔥',
    heading: '7 Day Streak!',
    sub: 'Keep your streak alive today.',
    cta: 'CONTINUE  ›',
    ctaColor: '#FF8A4C',
    ctaTextColor: '#FFFFFF',
    badgeBg: 'rgba(255, 138, 76, 0.25)',
    textColor: '#25324A',
    image: require('../assets/banners/gen_banner_streak.jpg'),
    action: 'streak',
  },
  {
    id: '4',
    badge: 'NEW TOPICS ADDED 🧪',
    heading: 'Science &\nNature',
    sub: 'Fresh quizzes to power your brain!',
    cta: 'EXPLORE NOW  ›',
    ctaColor: '#63C174',
    ctaTextColor: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    textColor: '#FFFFFF',
    image: require('../assets/banners/gen_banner_science_nature.jpg'),
    action: 'science_quiz',
  },
];

const Home = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    totalXP: 0,
    streak: 0,
    lifelines: 3,
    levelInfo: {
      level: 1,
      title: 'Novice Thinker',
      icon: '🐣',
      progressPercent: 0,
      maxXP: 100,
      xpToNextLevel: 100,
    },
  });

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scrolling carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % CAROUSEL_DATA.length;
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    }, 2500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleCarouselScroll = event => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH,
    );
    setCurrentIndex(index);
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getPlayerStats().then(loadedStats => {
        if (isActive && loadedStats) setStats(loadedStats);
      });
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleQuickPlay = () => {
    const quickCategories = [18, 22, 21, 23, 27, 20];
    const randomCategory =
      quickCategories[Math.floor(Math.random() * quickCategories.length)];
    const url = `https://opentdb.com/api.php?amount=10&category=${randomCategory}&difficulty=easy&type=multiple&encode=url3986`;
    navigation.navigate('Quiz', {
      url,
      categoryName: 'Quick Play',
      categoryIcon: '⚡',
      difficulty: 'easy',
    });
  };

  // Build array of active streak days (Mon-Sun)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const playedToday = stats.lastPlayedDate === todayDateStr;
  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun

  const streakDays = WEEK_DAYS.map((day, i) => {
    // If streak is 0, no day is completed
    if (!stats.streak || stats.streak === 0) {
      return {
        day,
        isCompleted: false,
        isToday: i === currentDayOfWeek,
      };
    }

    // If streak is >= 7, all 7 days of the week are completed
    if (stats.streak >= 7) {
      return {
        day,
        isCompleted: true,
        isToday: i === currentDayOfWeek,
      };
    }

    // If played today, streak covers today and (streak - 1) preceding days
    // If not played today yet, streak covers (streak) days ending yesterday
    const lastActiveDayIndex = playedToday
      ? currentDayOfWeek
      : currentDayOfWeek - 1;
    const firstActiveDayIndex = lastActiveDayIndex - stats.streak + 1;

    const isCompleted = i >= firstActiveDayIndex && i <= lastActiveDayIndex;

    return {
      day,
      isCompleted,
      isToday: i === currentDayOfWeek,
    };
  });

  const handleBannerPress = item => {
    if (item.action === 'space_quiz') {
      navigation.navigate('Quiz', {
        url: 'https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple&encode=url3986',
        categoryName: 'Space & Science',
        categoryIcon: '🚀',
        difficulty: 'easy',
      });
    } else if (item.action === 'science_quiz') {
      navigation.navigate('Quiz', {
        url: 'https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple&encode=url3986',
        categoryName: 'Science & Nature',
        categoryIcon: '🧪',
        difficulty: 'easy',
      });
    } else {
      handleQuickPlay();
    }
  };

  const renderCarouselItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
      style={styles.bannerTouchable}>
      <Image
        source={item.image}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <View style={[styles.bannerBadge, {backgroundColor: item.badgeBg}]}>
          <Text style={[styles.bannerBadgeText, {color: item.textColor}]}>
            {item.badge}
          </Text>
        </View>
        <Text style={[styles.bannerHeading, {color: item.textColor}]}>
          {item.heading}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.bannerSub, {color: item.textColor}]}>
          {item.sub}
        </Text>
        <View style={[styles.bannerCtaBtn, {backgroundColor: item.ctaColor}]}>
          <Text style={[styles.bannerCtaText, {color: item.ctaTextColor}]}>
            {item.cta}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const achievementsList = getComputedAchievements(stats);
  const unlockedCount = achievementsList.filter(a => a.isUnlocked).length;

  const renderAchievement = ({item}) => (
    <View
      style={[
        styles.achievementBadge,
        !item.isUnlocked && styles.achievementBadgeLocked,
      ]}>
      <View
        style={[
          styles.achievementIcon,
          item.isUnlocked
            ? styles.achievementIconUnlocked
            : styles.achievementIconLocked,
        ]}>
        <Text style={styles.achievementEmoji}>{item.icon}</Text>
        {item.isUnlocked ? (
          <View style={styles.badgeCheckPill}>
            <Text style={styles.badgeCheckText}>✓</Text>
          </View>
        ) : (
          <View style={styles.badgeLockPill}>
            <Text style={styles.badgeLockText}>🔒</Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.achievementLabel,
          !item.isUnlocked && styles.achievementLabelLocked,
        ]}>
        {item.label}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.achievementSub,
          item.isUnlocked && styles.achievementSubUnlocked,
        ]}>
        {item.isUnlocked ? 'Unlocked' : item.currentProgress}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100,
          },
        ]}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.appName}>Quizzo</Text>
          <View style={styles.hudRow}>
            <View style={[styles.hudPill, styles.streakPill, {marginRight:10}]}>
              <Text style={styles.hudPillIcon}>🔥</Text>
              <Text style={styles.hudPillText}>
                {stats.streak} day{stats.streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
            <View style={[styles.hudPill, styles.xpPill]}>
              <Text style={styles.hudPillIcon}>⭐</Text>
              <Text style={[styles.hudPillText, {color: '#E6AC00'}]}>
                {stats.totalXP} XP
              </Text>
            </View>
          </View>
        </View>

        {/* ── CAROUSEL ── */}
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={CAROUSEL_DATA}
            renderItem={renderCarouselItem}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          />
          <View style={styles.dotRow}>
            {CAROUSEL_DATA.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── LEVEL PROGRESS ── */}
        <View style={styles.levelCard}>
          <View style={styles.levelLeft}>
            <Text style={styles.levelCharacter}>{stats.levelInfo.icon}</Text>
            <View style={styles.levelDetails}>
              <Text style={styles.levelLabel}>
                LEVEL {stats.levelInfo.level}
              </Text>
              <Text style={styles.levelTitle}>{stats.levelInfo.title}</Text>
              <View style={styles.levelTrack}>
                <View
                  style={[
                    styles.levelFill,
                    {width: `${stats.levelInfo.progressPercent}%`},
                  ]}
                />
              </View>
              <Text style={styles.levelNext}>
                ↑{' '}
                {stats.levelInfo.xpToNextLevel > 0
                  ? `${stats.levelInfo.xpToNextLevel} XP to Level ${
                      stats.levelInfo.level + 1
                    }`
                  : 'Max Level Reached! 🌟'}
              </Text>
            </View>
          </View>
          <View style={styles.levelXPBadge}>
            <Text style={styles.levelXPCurrent}>{stats.totalXP}</Text>
            <Text style={styles.levelXPMax}>/ {stats.levelInfo.maxXP} XP</Text>
          </View>
        </View>

        {/* ── CHOOSE CATEGORY ── */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SelectQuiz')}>
          <View style={[styles.actionIconBg, {backgroundColor: '#EEF3FF'}]}>
            <Text style={styles.actionEmoji}>📚</Text>
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitle}>Choose Category</Text>
            <Text style={styles.actionSub}>Explore quizzes by topic</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* ── QUICK PLAY ── */}
        <TouchableOpacity
          style={[styles.actionCard, styles.quickCard]}
          activeOpacity={0.85}
          onPress={handleQuickPlay}>
          <View style={[styles.actionIconBg, {backgroundColor: '#FFFBE6'}]}>
            <Text style={styles.actionEmoji}>⚡</Text>
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitle}>Quick Play</Text>
            <Text style={styles.actionSub}>10 random questions</Text>
          </View>
          <TouchableOpacity
            style={styles.playNowBtn}
            onPress={handleQuickPlay}
            activeOpacity={0.8}>
            <Text style={styles.playNowText}>PLAY NOW ›</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── STREAK TRACKER ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionIcon}>🔥</Text>
            <View>
              <Text style={styles.sectionTitle}>{stats.streak} Day Streak</Text>
              <Text style={styles.sectionSub}>
                {stats.streak > 0
                  ? 'Keep it going! Come back tomorrow.'
                  : 'Play today to start your streak!'}
              </Text>
            </View>
          </View>
          <View style={styles.streakDots}>
            {streakDays.map((d, i) => (
              <View key={i} style={styles.streakDay}>
                <View
                  style={[
                    styles.streakDot,
                    d.isCompleted
                      ? styles.streakDotActive
                      : styles.streakDotInactive,
                    d.isToday && !d.isCompleted && styles.streakDotToday,
                  ]}>
                  {d.isCompleted ? (
                    <Text style={styles.streakCheck}>✓</Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.streakDayLabel,
                    d.isToday && styles.streakDayLabelToday,
                  ]}>
                  {d.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ACHIEVEMENTS ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionIcon}>🏆</Text>
            <View style={styles.achievementsHeaderContent}>
              <View style={styles.achievementsTitleRow}>
                <Text style={styles.sectionTitle}>Your Achievements</Text>
                <View style={styles.unlockedCounterPill}>
                  <Text style={styles.unlockedCounterText}>
                    {unlockedCount}/{achievementsList.length} Unlocked
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSub}>
                {unlockedCount === achievementsList.length
                  ? 'All badges unlocked! You are a Trivia Legend! 🌟'
                  : 'Earn badges as you test your trivia mastery!'}
              </Text>
            </View>
          </View>
          <FlatList
            data={achievementsList}
            renderItem={renderAchievement}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4F7DF3',
    letterSpacing: 0.5,
  },
  hudRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  streakPill: {
    backgroundColor: '#FFF4EE',
    borderColor: '#FFD9C0',
  },
  xpPill: {
    backgroundColor: '#FFFBE6',
    borderColor: '#FFE8A0',
  },
  hudPillIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  hudPillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF8A4C',
  },

  // ── CAROUSEL ──
  carouselWrapper: {
    marginBottom: 16,
  },
  bannerTouchable: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F7DF3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 18,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '58%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  bannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bannerHeading: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
    marginVertical: 2,
  },
  bannerSub: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 4,
  },
  bannerCtaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerCtaText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#4F7DF3',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D9E6',
  },

  // ── LEVEL CARD ──
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    shadowColor: '#4F7DF3',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelCharacter: {
    fontSize: 44,
    marginRight: 14,
  },
  levelDetails: {
    flex: 1,
  },
  levelLabel: {
    color: '#4F7DF3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  levelTitle: {
    color: '#25324A',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  levelTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#63C174',
    borderRadius: 4,
  },
  levelNext: {
    color: '#63C174',
    fontSize: 11,
    fontWeight: 'bold',
  },
  levelXPBadge: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  levelXPCurrent: {
    color: '#25324A',
    fontSize: 22,
    fontWeight: '900',
  },
  levelXPMax: {
    color: '#7A8B99',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── ACTION CARDS ──
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickCard: {
    borderColor: '#FFF0CC',
    backgroundColor: '#FFFDF5',
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionEmoji: {
    fontSize: 26,
  },
  actionTextBlock: {
    flex: 1,
  },
  actionTitle: {
    color: '#25324A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  actionSub: {
    color: '#7A8B99',
    fontSize: 13,
  },
  actionArrow: {
    color: '#4F7DF3',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playNowBtn: {
    backgroundColor: '#FF8A4C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  playNowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ── STREAK TRACKER ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  sectionTitle: {
    color: '#25324A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSub: {
    color: '#7A8B99',
    fontSize: 12,
  },
  streakDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  streakDay: {
    alignItems: 'center',
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  streakDotActive: {
    backgroundColor: '#63C174',
  },
  streakDotInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  streakDotToday: {
    borderColor: '#FF8A4C',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 138, 76, 0.08)',
  },
  streakCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  streakDayLabel: {
    color: '#7A8B99',
    fontSize: 11,
    fontWeight: '600',
  },
  streakDayLabelToday: {
    color: '#FF8A4C',
    fontWeight: 'bold',
  },

  // ── ACHIEVEMENTS ──
  achievementsHeaderContent: {
    flex: 1,
  },
  achievementsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  unlockedCounterPill: {
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0DCFF',
  },
  unlockedCounterText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4F7DF3',
  },
  achievementsList: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  achievementBadge: {
    alignItems: 'center',
    marginRight: 14,
    width: 78,
  },
  achievementBadgeLocked: {
    opacity: 0.72,
  },
  achievementIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    position: 'relative',
  },
  achievementIconUnlocked: {
    backgroundColor: '#EAF8ED',
    borderColor: '#63C174',
    shadowColor: '#63C174',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIconLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  badgeCheckPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#63C174',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeCheckText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeLockPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeLockText: {
    fontSize: 9,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementLabel: {
    color: '#25324A',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  achievementLabelLocked: {
    color: '#7A8B99',
  },
  achievementSub: {
    color: '#7A8B99',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  achievementSubUnlocked: {
    color: '#63C174',
    fontWeight: 'bold',
  },
});
