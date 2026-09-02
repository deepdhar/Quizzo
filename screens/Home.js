import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Title from '../components/Title';
import Button3D from '../components/Button3D';
import {getPlayerStats} from '../utils/gameStorage';

const Home = () => {
  const navigation = useNavigation();
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

  // Reload stats whenever Home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getPlayerStats().then(loadedStats => {
        if (isActive && loadedStats) {
          setStats(loadedStats);
        }
      });
      return () => {
        isActive = false;
      };
    }, []),
  );

  // Floating animation for mascot/hero
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [floatAnim]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Player HUD */}
        <View style={styles.headerHUD}>
          <View style={styles.hudBadge}>
            <Text style={styles.hudIcon}>🔥</Text>
            <Text style={styles.hudText}>
              {stats.streak} {stats.streak === 1 ? 'DAY' : 'DAYS'}
            </Text>
          </View>

          <View style={[styles.hudBadge, styles.lifelineBadge]}>
            <Text style={styles.hudIcon}>🎲</Text>
            <Text style={styles.lifelineText}>{stats.lifelines} 50:50</Text>
          </View>

          <View style={[styles.hudBadge, styles.xpBadge]}>
            <Text style={styles.hudIcon}>⭐</Text>
            <Text style={styles.xpText}>{stats.totalXP} XP</Text>
          </View>
        </View>

        {/* Title */}
        <Title titleText="Quizzo" subtitle="The Ultimate Trivia Adventure!" />

        {/* Level Progression Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelLeft}>
              <Text style={styles.levelIcon}>{stats.levelInfo.icon}</Text>
              <View>
                <Text style={styles.levelRank}>
                  Level {stats.levelInfo.level}
                </Text>
                <Text style={styles.levelTitle}>{stats.levelInfo.title}</Text>
              </View>
            </View>
            <Text style={styles.levelXP}>
              {stats.totalXP} / {stats.levelInfo.maxXP} XP
            </Text>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelTrack}>
            <View
              style={[
                styles.levelFill,
                {width: `${stats.levelInfo.progressPercent}%`},
              ]}
            />
          </View>
          <Text style={styles.levelNext}>
            {stats.levelInfo.xpToNextLevel > 0
              ? `${stats.levelInfo.xpToNextLevel} XP to Next Level`
              : 'Max Level Reached! 🌟'}
          </Text>
        </View>

        {/* Hero Mascot / Floating Card */}
        <View style={styles.heroWrapper}>
          <Animated.View
            style={[styles.heroCard, {transform: [{translateY: floatAnim}]}]}>
            <View style={styles.trophyGlow}>
              <Text style={styles.heroEmoji}>🏆</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🧠 Daily Brain Challenge</Text>
            </View>
            <Text style={styles.heroQuote}>
              &quot;Test your smarts, learn amazing facts &amp; climb player
              levels!&quot;
            </Text>
          </Animated.View>
        </View>

        {/* Game Modes */}
        <View style={styles.modesContainer}>
          <TouchableOpacity
            style={styles.modeCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SelectQuiz')}>
            <View style={styles.modeIconBg}>
              <Text style={styles.modeEmoji}>🎯</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Choose Category</Text>
              <Text style={styles.modeSubtitle}>
                Tech, Animals, Geography, Sports &amp; more!
              </Text>
            </View>
            <Text style={styles.modeArrow}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, styles.quickCard]}
            activeOpacity={0.8}
            onPress={handleQuickPlay}>
            <View style={[styles.modeIconBg, styles.quickIconBg]}>
              <Text style={styles.modeEmoji}>⚡</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Quick Play</Text>
              <Text style={styles.modeSubtitle}>
                Instant random 10-question quiz!
              </Text>
            </View>
            <Text style={styles.modeArrow}>➔</Text>
          </TouchableOpacity>

          {/* Global Leaderboard Entry */}
          <TouchableOpacity
            style={[styles.modeCard, styles.leaderboardCard]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Leaderboard')}>
            <View style={[styles.modeIconBg, styles.leaderboardIconBg]}>
              <Text style={styles.modeEmoji}>🏆</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Global Leaderboard</Text>
              <Text style={styles.modeSubtitle}>
                Check rankings &amp; compete for Top #1!
              </Text>
            </View>
            <Text style={styles.modeArrow}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* Big 3D Play Now CTA */}
        <View style={styles.ctaContainer}>
          <Button3D
            title="PLAY NOW 🎮"
            onPress={() => navigation.navigate('SelectQuiz')}
            color="#10B981"
            shadowColor="#059669"
            size="large"
            style={styles.playButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lifelineBadge: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  lifelineText: {
    color: '#4F7DF3',
    fontWeight: 'bold',
    fontSize: 11,
  },
  xpBadge: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  hudIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  hudText: {
    color: '#FF8A4C',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  xpText: {
    color: '#FFC857',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  levelRank: {
    color: '#4F7DF3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelTitle: {
    color: '#25324A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelXP: {
    color: '#7A8B99',
    fontSize: 12,
  },
  levelTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#63C174',
    borderRadius: 6,
  },
  levelNext: {
    color: '#7A8B99',
    fontSize: 11,
    textAlign: 'right',
  },
  heroWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 125, 243, 0.2)',
    shadowColor: '#4F7DF3',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  trophyGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 87, 0.4)',
    marginBottom: 8,
  },
  heroEmoji: {
    fontSize: 44,
  },
  heroBadge: {
    backgroundColor: '#4F7DF3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  heroQuote: {
    color: '#7A8B99',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modesContainer: {
    marginVertical: 8,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickCard: {
    borderColor: '#E2E8F0',
  },
  leaderboardCard: {
    borderColor: '#E2E8F0',
  },
  modeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 125, 243, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickIconBg: {
    backgroundColor: 'rgba(255, 138, 76, 0.15)',
  },
  leaderboardIconBg: {
    backgroundColor: 'rgba(139, 109, 232, 0.15)',
  },
  modeEmoji: {
    fontSize: 20,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    color: '#25324A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modeSubtitle: {
    color: '#7A8B99',
    fontSize: 11,
    marginTop: 2,
  },
  modeArrow: {
    color: '#4F7DF3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  ctaContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  playButton: {
    width: '100%',
  },
});
