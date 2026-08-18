import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import TimerBadge from '../components/TimerBadge';
import QuitModal from '../components/QuitModal';
import Button3D from '../components/Button3D';
import {decodeText} from '../utils/decoder';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const QUESTION_TIME = 15;

const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Quiz = ({route}) => {
  const navigation = useNavigation();
  const {
    url,
    categoryName = 'Quiz',
    categoryIcon = '🎯',
    difficulty = 'medium',
  } = route.params || {};

  const [questions, setQuestions] = useState([]);
  const [ques, setQues] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Answer selection states
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [quitModalVisible, setQuitModalVisible] = useState(false);

  // Toast animation for +10 XP
  const scoreToastAnim = useRef(new Animated.Value(0)).current;

  const showScoreToast = () => {
    scoreToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(scoreToastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(400),
      Animated.timing(scoreToastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateOptionsAndShuffle = useCallback(_question => {
    if (!_question) {
      return [];
    }
    const opts = [..._question.incorrect_answers, _question.correct_answer];
    return shuffleArray(opts);
  }, []);

  const getQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setQuestions(data.results);
        setQues(0);
        setScore(0);
        setUserHistory([]);
        setOptions(generateOptionsAndShuffle(data.results[0]));
        setTimeLeft(QUESTION_TIME);
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [url, generateOptionsAndShuffle]);

  useEffect(() => {
    getQuiz();
  }, [getQuiz]);

  const advanceToNext = useCallback(
    (latestHistory, latestScore) => {
      const nextIndex = ques + 1;
      if (nextIndex < questions.length) {
        setQues(nextIndex);
        setOptions(generateOptionsAndShuffle(questions[nextIndex]));
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(QUESTION_TIME);
      } else {
        // Quiz finished
        navigation.navigate('Result', {
          score: latestScore,
          totalQuestions: questions.length,
          userHistory: latestHistory,
          categoryName,
          categoryIcon,
          difficulty,
          url,
        });
      }
    },
    [
      ques,
      questions,
      generateOptionsAndShuffle,
      navigation,
      categoryName,
      categoryIcon,
      difficulty,
      url,
    ],
  );

  const handleTimeOut = useCallback(() => {
    if (isAnswered || questions.length === 0) {
      return;
    }
    setIsAnswered(true);
    setSelectedOption('__TIMEOUT__');

    const currentQ = questions[ques];
    const updatedHistory = [
      ...userHistory,
      {
        question: currentQ.question,
        selectedAnswer: 'Time Out',
        correctAnswer: currentQ.correct_answer,
        isCorrect: false,
        options,
      },
    ];
    setUserHistory(updatedHistory);

    setTimeout(() => {
      advanceToNext(updatedHistory, score);
    }, 1000);
  }, [isAnswered, questions, ques, userHistory, options, advanceToNext, score]);

  // Timer countdown effect
  useEffect(() => {
    if (isLoading || isAnswered || questions.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isAnswered, ques, questions, handleTimeOut]);

  const handleSelectedOption = option => {
    if (isAnswered) {
      return;
    }

    setIsAnswered(true);
    setSelectedOption(option);

    const currentQ = questions[ques];
    const isCorrect = option === currentQ.correct_answer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 10;
      setScore(newScore);
      showScoreToast();
    }

    const updatedHistory = [
      ...userHistory,
      {
        question: currentQ.question,
        selectedAnswer: option,
        correctAnswer: currentQ.correct_answer,
        isCorrect,
        options,
      },
    ];
    setUserHistory(updatedHistory);

    setTimeout(() => {
      advanceToNext(updatedHistory, newScore);
    }, 900);
  };

  const handleSkip = () => {
    if (isAnswered) {
      return;
    }
    setIsAnswered(true);

    const currentQ = questions[ques];
    const updatedHistory = [
      ...userHistory,
      {
        question: currentQ.question,
        selectedAnswer: 'Skipped',
        correctAnswer: currentQ.correct_answer,
        isCorrect: false,
        options,
      },
    ];
    setUserHistory(updatedHistory);

    advanceToNext(updatedHistory, score);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingEmoji}>🧠</Text>
          <Text style={styles.loadingTitle}>Loading Questions...</Text>
          <Text style={styles.loadingSubtitle}>
            Getting your {categoryName} quiz ready!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError || !questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>😕</Text>
          <Text style={styles.loadingTitle}>Oops! Network Error</Text>
          <Text style={styles.loadingSubtitle}>
            Couldn&apos;t fetch questions. Please check your internet
            connection.
          </Text>
          <Button3D
            title="Try Again 🔄"
            onPress={getQuiz}
            color="#38BDF8"
            shadowColor="#0284C7"
            style={styles.retryBtn}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('SelectQuiz')}
            style={styles.chooseAnotherBtn}>
            <Text style={styles.chooseAnotherText}>
              Choose Another Category
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[ques];
  const decodedQuestion = decodeText(currentQuestion.question);
  const isLastQuestion = ques === questions.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top HUD */}
      <View style={styles.hudHeader}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setQuitModalVisible(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillIcon}>{categoryIcon}</Text>
          <Text style={styles.categoryPillText} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>

        <View style={styles.scorePill}>
          <Text style={styles.scorePillIcon}>⭐</Text>
          <Text style={styles.scorePillText}>{score} XP</Text>
        </View>

        <TimerBadge timeLeft={timeLeft} totalTime={QUESTION_TIME} />
      </View>

      {/* Question Progress Bar */}
      <ProgressBar current={ques + 1} total={questions.length} />

      {/* Question Card & Options */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMetaRow}>
            <Text style={styles.difficultyTag}>{difficulty.toUpperCase()}</Text>
            <Text style={styles.pointsTag}>+10 XP</Text>
          </View>
          <Text style={styles.questionText}>{decodedQuestion}</Text>
        </View>

        {/* Score Toast Animation */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scoreToast,
            {
              opacity: scoreToastAnim,
              transform: [
                {
                  translateY: scoreToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, -10],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.scoreToastText}>+10 XP! 🎉</Text>
        </Animated.View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {options.map((opt, index) => {
            const decodedOpt = decodeText(opt);
            const isCorrectOption = opt === currentQuestion.correct_answer;
            const isUserSelected = opt === selectedOption;

            let buttonBg = 'rgba(30, 41, 59, 0.85)';
            let borderColor = 'rgba(255, 255, 255, 0.12)';
            let badgeBg = 'rgba(255, 255, 255, 0.1)';
            let textColor = '#FFFFFF';
            let statusIcon = null;

            if (isAnswered) {
              if (isCorrectOption) {
                buttonBg = 'rgba(16, 185, 129, 0.25)';
                borderColor = '#10B981';
                badgeBg = '#10B981';
                statusIcon = '✓';
              } else if (isUserSelected) {
                buttonBg = 'rgba(239, 68, 68, 0.25)';
                borderColor = '#EF4444';
                badgeBg = '#EF4444';
                statusIcon = '✕';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                disabled={isAnswered}
                onPress={() => handleSelectedOption(opt)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: buttonBg,
                    borderColor: borderColor,
                  },
                ]}>
                <View
                  style={[
                    styles.optionLetterBadge,
                    {backgroundColor: badgeBg},
                  ]}>
                  <Text style={styles.optionLetterText}>
                    {statusIcon || OPTION_LETTERS[index] || index + 1}
                  </Text>
                </View>

                <Text style={[styles.optionText, {color: textColor}]}>
                  {decodedOpt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleSkip}
          disabled={isAnswered}
          style={[styles.skipBtn, isAnswered && styles.disabledSkip]}>
          <Text style={styles.skipBtnText}>
            {isLastQuestion ? 'SKIP TO RESULTS ➔' : 'SKIP QUESTION ➔'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quit Confirmation Modal */}
      <QuitModal
        visible={quitModalVisible}
        onCancel={() => setQuitModalVisible(false)}
        onConfirm={() => {
          setQuitModalVisible(false);
          navigation.navigate('Home');
        }}
      />
    </SafeAreaView>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06173B',
    paddingHorizontal: 16,
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    maxWidth: 130,
  },
  categoryPillIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  categoryPillText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  scorePillIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  scorePillText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  questionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 22,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  difficultyTag: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Ubuntu-Medium',
  },
  pointsTag: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    lineHeight: 26,
  },
  scoreToast: {
    alignSelf: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: -8,
    zIndex: 10,
  },
  scoreToastText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
  },
  optionsList: {
    marginTop: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionLetterBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLetterText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
  },
  bottomBar: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledSkip: {
    opacity: 0.5,
  },
  skipBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#06173B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  loadingEmoji: {
    fontSize: 48,
    marginVertical: 12,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 6,
  },
  loadingSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20,
    width: '100%',
  },
  chooseAnotherBtn: {
    marginTop: 14,
  },
  chooseAnotherText: {
    color: '#94A3B8',
    fontFamily: 'Ubuntu-Medium',
  },
});
