import React, {useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Title from '../components/Title';
import Button3D from '../components/Button3D';

const Home = () => {
  const navigation = useNavigation();

  // Floating animation for mascot/hero
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
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
    // Random category quick play
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
            <Text style={styles.hudText}>3 DAY STREAK</Text>
          </View>

          <View style={[styles.hudBadge, styles.xpBadge]}>
            <Text style={styles.hudIcon}>⭐</Text>
            <Text style={styles.xpText}>250 XP</Text>
          </View>
        </View>

        {/* Title */}
        <Title titleText="Quizzo" subtitle="The Ultimate Trivia Adventure!" />

        {/* Hero Mascot / Floating Card */}
        <View style={styles.heroWrapper}>
          <Animated.View
            style={[styles.heroCard, {transform: [{translateY: floatAnim}]}]}>
            <View style={styles.trophyGlow}>
              <Text style={styles.heroEmoji}>🏆</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                🧠 Brain Master Challenge
              </Text>
            </View>
            <Text style={styles.heroQuote}>
              &quot;Test your smarts, learn amazing facts &amp; beat high
              scores!&quot;
            </Text>
          </Animated.View>
        </View>

        {/* Game Modes Preview */}
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
                Jump right into a random 10-question quiz!
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
    backgroundColor: '#06173B',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  xpBadge: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  hudIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  hudText: {
    color: '#F97316',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
  },
  xpText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
  },
  heroWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  heroCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#38BDF8',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  trophyGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 54,
  },
  heroBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#06173B',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
  },
  heroQuote: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 20,
  },
  modesContainer: {
    marginVertical: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  modeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickIconBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  modeEmoji: {
    fontSize: 22,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  modeSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 2,
  },
  modeArrow: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ctaContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  playButton: {
    width: '100%',
  },
});
