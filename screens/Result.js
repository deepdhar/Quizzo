import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import {decodeText} from '../utils/decoder';
import {recordGameFinished} from '../utils/gameStorage';
import {syncPlayerToLeaderboard} from '../utils/leaderboardService';

const Result = ({route}) => {
  const navigation = useNavigation();
  const {
    score = 0,
    totalQuestions = 10,
    userHistory = [],
    categoryName = 'Trivia',
    categoryIcon = '🎯',
    difficulty = 'medium',
    url,
  } = route.params || {};

  const [showReview, setShowReview] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);

  const total = totalQuestions || 10;
  const correctCount = Math.round(score / 10);
  const wrongCount = total - correctCount;
  const accuracy = Math.round((correctCount / total) * 100);

  useEffect(() => {
    // Record game in persistent storage and check level up
    recordGameFinished(score, categoryName, correctCount).then(updated => {
      if (updated) {
        setSessionStats(updated);
        // Sync new stats to Supabase Real-Time Leaderboard
        syncPlayerToLeaderboard();
      }
    });
  }, [score, categoryName, correctCount]);

  let starRating = '⭐';
  let celebrationTitle = 'GOOD EFFORT! 💪';
  let celebrationSub = 'Practice makes perfect. Try again to get 3 stars!';
  let celebrationEmoji = '🥉';

  if (accuracy >= 80) {
    starRating = '⭐⭐⭐';
    celebrationTitle = 'QUIZ CHAMPION! 🏆';
    celebrationSub = 'Outstanding! You are a genuine trivia master!';
    celebrationEmoji = '🥇';
  } else if (accuracy >= 50) {
    starRating = '⭐⭐';
    celebrationTitle = 'GREAT JOB! 🎉';
    celebrationSub = 'Way to go! You scored more than half correct!';
    celebrationEmoji = '🥈';
  }

  const handlePlayAgain = () => {
    if (url) {
      navigation.replace('Quiz', {
        url,
        categoryName,
        categoryIcon,
        difficulty,
      });
    } else {
      navigation.navigate('SelectQuiz');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Level Up Banner if leveled up */}
        {sessionStats && sessionStats.hasLeveledUp && (
          <View style={styles.levelUpBanner}>
            <Text style={styles.levelUpEmoji}>🎉</Text>
            <View style={styles.levelUpInfo}>
              <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
              <Text style={styles.levelUpSubtitle}>
                You reached Level {sessionStats.levelInfo.level} •{' '}
                {sessionStats.levelInfo.title}
              </Text>
            </View>
          </View>
        )}

        {/* Trophy & Celebration Header */}
        <View style={styles.celebrationCard}>
          <View style={styles.trophyCircle}>
            <Text style={styles.trophyEmoji}>{celebrationEmoji}</Text>
          </View>

          <Text style={styles.starsText}>{starRating}</Text>
          <Text style={styles.titleText}>{celebrationTitle}</Text>
          <Text style={styles.subtitleText}>{celebrationSub}</Text>
        </View>

        {/* Score Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, styles.scoreBox]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>+{score} XP</Text>
            <Text style={styles.statLabel}>POINTS EARNED</Text>
          </View>

          <View style={[styles.statBox, styles.accuracyBox]}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>

          <View style={[styles.statBox, styles.correctBox]}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={[styles.statValue, styles.correctValue]}>
              {correctCount}
            </Text>
            <Text style={styles.statLabel}>CORRECT</Text>
          </View>

          <View style={[styles.statBox, styles.incorrectBox]}>
            <Text style={styles.statIcon}>✕</Text>
            <Text style={[styles.statValue, styles.incorrectValue]}>
              {wrongCount}
            </Text>
            <Text style={styles.statLabel}>INCORRECT</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button3D
            title="PLAY AGAIN 🔄"
            onPress={handlePlayAgain}
            color="#63C174"
            shadowColor="#4FA05D"
            size="large"
            style={styles.actionBtn}
          />

          <Button3D
            title="GLOBAL LEADERBOARD 🏆"
            onPress={() => navigation.navigate('Leaderboard')}
            color="#8B6DE8"
            shadowColor="#6A4FB8"
            size="medium"
            style={styles.actionBtn}
          />

          <Button3D
            title="CHOOSE CATEGORY 🎯"
            onPress={() => navigation.navigate('SelectQuiz')}
            color="#4F7DF3"
            shadowColor="#3A60C4"
            size="medium"
            style={styles.actionBtn}
          />
        </View>

        {/* Review Answers Accordion */}
        {userHistory && userHistory.length > 0 && (
          <View style={styles.reviewSection}>
            <TouchableOpacity
              style={styles.reviewHeader}
              activeOpacity={0.8}
              onPress={() => setShowReview(!showReview)}>
              <View style={styles.reviewHeaderLeft}>
                <Text style={styles.reviewHeaderIcon}>📝</Text>
                <Text style={styles.reviewHeaderText}>Review Answers</Text>
                <View style={styles.reviewBadge}>
                  <Text style={styles.reviewBadgeText}>
                    {userHistory.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.reviewArrow}>{showReview ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showReview && (
              <View style={styles.reviewList}>
                {userHistory.map((item, index) => {
                  const qText = decodeText(item.question);
                  const selected = decodeText(item.selectedAnswer);
                  const correct = decodeText(item.correctAnswer);

                  return (
                    <View
                      key={index}
                      style={[
                        styles.reviewItemCard,
                        item.isCorrect
                          ? styles.reviewCorrectCard
                          : styles.reviewIncorrectCard,
                      ]}>
                      <View style={styles.reviewItemHeader}>
                        <Text style={styles.reviewQIndex}>Q{index + 1}.</Text>
                        <Text style={styles.reviewItemStatus}>
                          {item.isCorrect
                            ? '✅ Correct (+10 XP)'
                            : '❌ Incorrect'}
                        </Text>
                      </View>

                      <Text style={styles.reviewQuestionText}>{qText}</Text>

                      <View style={styles.answerComparison}>
                        <View style={styles.answerRow}>
                          <Text style={styles.answerLabel}>Your Answer:</Text>
                          <Text
                            style={[
                              styles.answerValue,
                              item.isCorrect
                                ? styles.correctValue
                                : styles.incorrectValue,
                            ]}>
                            {selected}
                          </Text>
                        </View>

                        {!item.isCorrect && (
                          <View style={styles.answerRow}>
                            <Text style={styles.answerLabel}>
                              Correct Answer:
                            </Text>
                            <Text
                              style={[styles.answerValue, styles.correctValue]}>
                              {correct}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Back to Home Link */}
        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeLinkText}>🏠 Back to Home Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Result;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  levelUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FFC857',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  levelUpEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  levelUpInfo: {
    flex: 1,
  },
  levelUpTitle: {
    color: '#E6AC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelUpSubtitle: {
    color: '#25324A',
    fontSize: 13,
    marginTop: 2,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 87, 0.4)',
    marginBottom: 10,
  },
  trophyEmoji: {
    fontSize: 44,
  },
  starsText: {
    fontSize: 26,
    marginBottom: 6,
    letterSpacing: 4,
  },
  titleText: {
    color: '#25324A',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    color: '#7A8B99',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreBox: {
    borderBottomWidth: 3,
    borderBottomColor: '#FFC857',
  },
  accuracyBox: {
    borderBottomWidth: 3,
    borderBottomColor: '#4F7DF3',
  },
  correctBox: {
    borderBottomWidth: 3,
    borderBottomColor: '#63C174',
  },
  incorrectBox: {
    borderBottomWidth: 3,
    borderBottomColor: '#EF4444',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: '#25324A',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#7A8B99',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionBtn: {
    width: '100%',
    marginBottom: 12,
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  reviewHeaderText: {
    color: '#25324A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewBadge: {
    backgroundColor: 'rgba(79, 125, 243, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  reviewBadgeText: {
    color: '#4F7DF3',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reviewArrow: {
    color: '#7A8B99',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  reviewItemCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  reviewCorrectCard: {
    borderLeftColor: '#63C174',
  },
  reviewIncorrectCard: {
    borderLeftColor: '#EF4444',
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewQIndex: {
    color: '#7A8B99',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reviewItemStatus: {
    color: '#7A8B99',
    fontWeight: 'bold',
    fontSize: 11,
  },
  reviewQuestionText: {
    color: '#25324A',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
  },
  answerComparison: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  answerRow: {
    marginVertical: 2,
  },
  answerLabel: {
    color: '#7A8B99',
    fontSize: 11,
  },
  answerValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  correctValue: {
    color: '#63C174',
  },
  incorrectValue: {
    color: '#EF4444',
  },
  homeLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeLinkText: {
    color: '#7A8B99',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
