import React, {useState} from 'react';
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

  const total = totalQuestions || 10;
  const correctCount = Math.round(score / 10);
  const wrongCount = total - correctCount;
  const accuracy = Math.round((correctCount / total) * 100);

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
            <Text style={styles.statValue}>{score} XP</Text>
            <Text style={styles.statLabel}>TOTAL SCORE</Text>
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
            color="#10B981"
            shadowColor="#059669"
            size="large"
            style={styles.actionBtn}
          />

          <Button3D
            title="CHOOSE CATEGORY 🎯"
            onPress={() => navigation.navigate('SelectQuiz')}
            color="#38BDF8"
            shadowColor="#0284C7"
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
    backgroundColor: '#06173B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  celebrationCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 18,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
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
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 12,
  },
  scoreBox: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  accuracyBox: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  correctBox: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  incorrectBox: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
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
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  reviewBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  reviewBadgeText: {
    color: '#06173B',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  reviewArrow: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  reviewItemCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  reviewCorrectCard: {
    borderLeftColor: '#10B981',
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
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
  },
  reviewItemStatus: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'Ubuntu-Medium',
  },
  reviewQuestionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    lineHeight: 20,
    marginBottom: 8,
  },
  answerComparison: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    padding: 8,
  },
  answerRow: {
    marginVertical: 2,
  },
  answerLabel: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
  },
  answerValue: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  correctValue: {
    color: '#10B981',
  },
  incorrectValue: {
    color: '#EF4444',
  },
  homeLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeLinkText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
});
