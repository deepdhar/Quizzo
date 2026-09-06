import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import TimerBadge from '../components/TimerBadge';
import QuitModal from '../components/QuitModal';
import Button3D from '../components/Button3D';
import {decodeText} from '../utils/decoder';
import {getPlayerStats, apply5050Lifeline} from '../utils/gameStorage';
import {getEducationalFact} from '../utils/educationalFacts';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const CONFETTI_COLORS = [
  '#35C878',
  '#407CF4',
  '#FFC83D',
  '#FF8A4C',
  '#A855F7',
  '#EC4899',
];

const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Lightweight particle burst for correct answers
const ConfettiBurst = ({active}) => {
  const particles = useRef(
    Array.from({length: 12}).map((_, i) => ({
      id: i,
      animX: new Animated.Value(0),
      animY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      targetX: Math.cos((i * Math.PI * 2) / 12) * (40 + (i % 3) * 15),
      targetY: Math.sin((i * Math.PI * 2) / 12) * (35 + (i % 3) * 12),
    })),
  ).current;

  useEffect(() => {
    if (active) {
      particles.forEach(p => {
        p.animX.setValue(0);
        p.animY.setValue(0);
        p.opacity.setValue(1);
        p.scale.setValue(0.6);

        Animated.parallel([
          Animated.timing(p.animX, {
            toValue: p.targetX,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(p.animY, {
            toValue: p.targetY,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 1.2,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(350),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [active, particles]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.confettiContainer}>
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.confettiParticle,
            {
              backgroundColor: p.color,
              transform: [
                {translateX: p.animX},
                {translateY: p.animY},
                {scale: p.scale},
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const Quiz = ({route}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    url,
    categoryName = 'Quick Play',
    categoryIcon = '⚡',
    difficulty = 'easy',
  } = route.params || {};

  // Quiz modes timer setup: Easy -> no timer, Medium -> 20s, Hard -> 10s
  const normalizedDifficulty = (difficulty || 'easy').toLowerCase();
  const hasTimer = normalizedDifficulty !== 'easy';
  const QUESTION_TIME = normalizedDifficulty === 'hard' ? 10 : 20;

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

  // Lifelines (hints) state
  const [lifelinesCount, setLifelinesCount] = useState(2);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [lifelineUsedInCurrentQ, setLifelineUsedInCurrentQ] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(hasTimer ? QUESTION_TIME : 0);
  const [quitModalVisible, setQuitModalVisible] = useState(false);
  const isLeavingRef = useRef(false);

  // Intercept system back navigation (hardware back button, gestures, nav buttons)
  useEffect(() => {
    const onHardwareBackPress = () => {
      if (isLeavingRef.current) {
        return false;
      }
      setQuitModalVisible(true);
      return true;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress,
    );

    const removeListener = navigation.addListener('beforeRemove', e => {
      if (isLeavingRef.current) {
        return;
      }
      e.preventDefault();
      setQuitModalVisible(true);
    });

    return () => {
      backSubscription.remove();
      removeListener();
    };
  }, [navigation]);

  // Animation states
  const [showConfetti, setShowConfetti] = useState(false);
  const scoreToastAnim = useRef(new Animated.Value(0)).current;

  // Load initial lifelines count
  useEffect(() => {
    getPlayerStats().then(s => {
      if (s && typeof s.lifelines === 'number') {
        setLifelinesCount(s.lifelines);
      }
    });
  }, []);

  const showScoreToast = () => {
    scoreToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(scoreToastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(600),
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
        if (hasTimer) {
          setTimeLeft(QUESTION_TIME);
        }
        setIsAnswered(false);
        setSelectedOption(null);
        setEliminatedOptions([]);
        setLifelineUsedInCurrentQ(false);
        setShowConfetti(false);
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [url, generateOptionsAndShuffle, hasTimer, QUESTION_TIME]);

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
        setEliminatedOptions([]);
        setLifelineUsedInCurrentQ(false);
        if (hasTimer) {
          setTimeLeft(QUESTION_TIME);
        }
        setShowConfetti(false);
      } else {
        // Quiz finished
        isLeavingRef.current = true;
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
      hasTimer,
      QUESTION_TIME,
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
  }, [isAnswered, questions, ques, userHistory, options]);

  // Timer countdown effect (only for Medium: 20s and Hard: 10s)
  useEffect(() => {
    if (!hasTimer || isLoading || isAnswered || questions.length === 0) {
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
  }, [hasTimer, isLoading, isAnswered, ques, questions, handleTimeOut]);

  // 50:50 Lifeline (Hint) action
  const handleUse5050 = async () => {
    if (
      isAnswered ||
      lifelineUsedInCurrentQ ||
      options.length <= 2 ||
      lifelinesCount <= 0
    ) {
      return;
    }

    const currentQ = questions[ques];
    const incorrect = options.filter(o => o !== currentQ.correct_answer);

    if (incorrect.length < 2) {
      return;
    }

    const result = await apply5050Lifeline();
    if (result.success) {
      setLifelinesCount(result.remainingLifelines);
      // Eliminate 2 incorrect options
      const toEliminate = shuffleArray(incorrect).slice(0, 2);
      setEliminatedOptions(toEliminate);
      setLifelineUsedInCurrentQ(true);
    } else {
      Alert.alert('Hint', result.reason || 'No hints remaining.');
    }
  };

  const handleSelectedOption = option => {
    if (isAnswered || eliminatedOptions.includes(option)) {
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
      setShowConfetti(true);
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
  };

  const handleNextPress = () => {
    advanceToNext(userHistory, score);
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
      <View
        style={[
          styles.loadingContainer,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          },
        ]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#407CF4" />
          <Text style={styles.loadingEmoji}>🧠</Text>
          <Text style={styles.loadingTitle}>Loading Questions...</Text>
          <Text style={styles.loadingSubtitle}>
            Getting your {categoryName} quiz ready!
          </Text>
        </View>
      </View>
    );
  }

  if (hasError || !questions || questions.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          },
        ]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
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
            color="#407CF4"
            shadowColor="#2563EB"
            style={styles.retryBtn}
          />
          <TouchableOpacity
            onPress={() => {
              isLeavingRef.current = true;
              navigation.navigate('SelectQuiz');
            }}
            style={styles.chooseAnotherBtn}>
            <Text style={styles.chooseAnotherText}>
              Choose Another Category
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[ques];
  const decodedQuestion = decodeText(currentQuestion?.question || '');
  const isLastQuestion = ques === questions.length - 1;
  const isCorrectSelection = selectedOption === currentQuestion?.correct_answer;
  const educationalSnippet = getEducationalFact(
    currentQuestion?.question,
    currentQuestion?.correct_answer,
    categoryName,
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + 8 : 16,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
        },
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      {/* ── 1. SIMPLIFIED TOP CONTROLS ── */}
      <View style={styles.hudHeader}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setQuitModalVisible(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Quick Play / Category Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillIcon}>{categoryIcon}</Text>
          <Text style={styles.categoryPillText} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>

        {/* Clean Hint Pill (💡 count) */}
        <TouchableOpacity
          style={[
            styles.hintPill,
            (lifelinesCount <= 0 ||
              lifelineUsedInCurrentQ ||
              options.length <= 2) &&
              styles.disabledHintPill,
          ]}
          disabled={
            isAnswered ||
            lifelinesCount <= 0 ||
            lifelineUsedInCurrentQ ||
            options.length <= 2
          }
          onPress={handleUse5050}>
          <Text style={styles.hintPillIcon}>💡</Text>
          <Text style={styles.hintPillText}>{lifelinesCount}</Text>
        </TouchableOpacity>

        {/* Non-stressful Timer Pill (Medium: 20s, Hard: 10s, Easy: No timer) */}
        {hasTimer && (
          <TimerBadge timeLeft={timeLeft} totalTime={QUESTION_TIME} />
        )}
      </View>

      {/* ── 6. PROGRESS BAR ── */}
      <ProgressBar current={ques + 1} total={questions.length} />

      {/* ── SCROLLABLE BODY ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}>
        {/* ── 2. QUESTION CARD ── */}
        <View style={styles.questionCard}>
          <View style={styles.questionMetaRow}>
            <Text style={styles.difficultyTag}>{difficulty.toUpperCase()}</Text>
            <Text style={styles.pointsTag}>+10 XP</Text>
          </View>
          <Text style={styles.questionText}>{decodedQuestion}</Text>

          {/* Confetti Particle Burst on Correct */}
          <ConfettiBurst active={showConfetti} />
        </View>

        {/* Floating XP Toast */}
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
                    outputRange: [10, -12],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.scoreToastText}>+10 XP Earned! 🌟</Text>
        </Animated.View>

        {/* ── 3 & 4. ANSWER CARDS ── */}
        <View style={styles.optionsList}>
          {options.map((opt, index) => {
            const decodedOpt = decodeText(opt);
            const isCorrectOption = opt === currentQuestion.correct_answer;
            const isUserSelected = opt === selectedOption;
            const isEliminated = eliminatedOptions.includes(opt);

            // Default card styles
            let cardBg = '#FFFFFF';
            let borderColor = '#E2E8F0';
            let badgeBg = '#F1F5F9';
            let badgeTextColor = '#253858';
            let textColor = '#253858';
            let statusIcon = null;

            if (isEliminated) {
              cardBg = '#F8FAFC';
              borderColor = '#E2E8F0';
              textColor = '#94A3B8';
              badgeTextColor = '#CBD5E1';
            } else if (isAnswered) {
              if (isCorrectOption) {
                // Correct Answer State (Soft Green)
                cardBg = '#EDFDF2';
                borderColor = '#35C878';
                badgeBg = '#35C878';
                badgeTextColor = '#FFFFFF';
                textColor = '#15803D';
                statusIcon = '✓';
              } else if (isUserSelected) {
                // Incorrect User Pick (Soft Rose/Pink)
                cardBg = '#FFF1F3';
                borderColor = '#FF4D6D';
                badgeBg = '#FF4D6D';
                badgeTextColor = '#FFFFFF';
                textColor = '#BE123C';
                statusIcon = '✕';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                disabled={isAnswered || isEliminated}
                onPress={() => handleSelectedOption(opt)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                  },
                  isEliminated && styles.eliminatedOption,
                  isAnswered && isCorrectOption && styles.correctCardBorder,
                  isAnswered &&
                    isUserSelected &&
                    !isCorrectOption &&
                    styles.wrongCardBorder,
                ]}>
                {/* Circular Letter Badge */}
                <View
                  style={[
                    styles.optionLetterBadge,
                    {backgroundColor: badgeBg},
                  ]}>
                  <Text
                    style={[styles.optionLetterText, {color: badgeTextColor}]}>
                    {statusIcon || OPTION_LETTERS[index] || index + 1}
                  </Text>
                </View>

                {/* Option Text */}
                <Text
                  style={[
                    styles.optionText,
                    {color: textColor},
                    isEliminated && styles.eliminatedText,
                  ]}>
                  {isEliminated ? '— Eliminated —' : decodedOpt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 5. EDUCATIONAL "DID YOU KNOW?" FEEDBACK ── */}
        {isAnswered && (
          <View
            style={[
              styles.educationalCard,
              isCorrectSelection
                ? styles.educationalCardCorrect
                : styles.educationalCardReview,
            ]}>
            <View style={styles.educationalHeaderRow}>
              <Text style={styles.educationalIcon}>💡</Text>
              <Text style={styles.educationalTitle}>Did you know?</Text>
            </View>
            <Text style={styles.educationalBody}>{educationalSnippet}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── BOTTOM ACTIONS: 9. SUBTLE SKIP OR 10. NEXT QUESTION CTA ── */}
      <View style={styles.bottomBar}>
        {isAnswered ? (
          <TouchableOpacity
            style={styles.nextQuestionBtn}
            activeOpacity={0.85}
            onPress={handleNextPress}>
            <Text style={styles.nextQuestionText}>
              {isLastQuestion ? 'FINISH QUIZ 🏆' : 'NEXT QUESTION →'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            style={styles.subtleSkipBtn}>
            <Text style={styles.subtleSkipText}>Skip question ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quit Confirmation Modal */}
      <QuitModal
        visible={quitModalVisible}
        onCancel={() => setQuitModalVisible(false)}
        onConfirm={() => {
          isLeavingRef.current = true;
          setQuitModalVisible(false);
          navigation.navigate('Home');
        }}
      />
    </View>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    paddingHorizontal: 16,
  },

  // ── 1. TOP HUD CONTROLS ──
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1.5},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  closeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    maxWidth: 125,
    elevation: 0,
    shadowOpacity: 0,
  },
  categoryPillIcon: {
    fontSize: 13,
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  categoryPillText: {
    color: '#407CF4',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledHintPill: {
    opacity: 0.45,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  hintPillIcon: {
    fontSize: 13,
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  hintPillText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'transparent',
  },

  // ── BODY & QUESTION CARD ──
  scrollBody: {
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyTag: {
    color: '#407CF4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pointsTag: {
    color: '#35C878',
    fontSize: 13,
    fontWeight: '800',
  },
  questionText: {
    color: '#253858',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 30,
  },

  // ── CONFETTI BURST ──
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── SCORE TOAST ──
  scoreToast: {
    alignSelf: 'center',
    backgroundColor: '#35C878',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -8,
    marginBottom: 6,
    zIndex: 10,
    shadowColor: '#35C878',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreToastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // ── 3 & 4. ANSWER CARDS ──
  optionsList: {
    marginTop: 2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  correctCardBorder: {
    borderWidth: 2,
    borderColor: '#35C878',
  },
  wrongCardBorder: {
    borderWidth: 2,
    borderColor: '#FF4D6D',
  },
  eliminatedOption: {
    opacity: 0.35,
    borderStyle: 'dashed',
    elevation: 0,
    shadowOpacity: 0,
  },
  eliminatedText: {
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  optionLetterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },

  // ── 5. EDUCATIONAL FEEDBACK ──
  educationalCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 2,
    marginBottom: 10,
    borderWidth: 1.2,
  },
  educationalCardCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(53, 200, 120, 0.3)',
  },
  educationalCardReview: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  educationalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  educationalIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  educationalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#407CF4',
    letterSpacing: 0.3,
  },
  educationalBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },

  // ── 9 & 10. BOTTOM ACTIONS ──
  bottomBar: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  subtleSkipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  subtleSkipText: {
    color: '#7A8B99',
    fontSize: 13,
    fontWeight: '700',
  },
  nextQuestionBtn: {
    backgroundColor: '#407CF4',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#407CF4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  nextQuestionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // ── LOADING & ERROR ──
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  loadingEmoji: {
    fontSize: 48,
    marginVertical: 12,
  },
  loadingTitle: {
    color: '#253858',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  loadingSubtitle: {
    color: '#7A8B99',
    fontSize: 14,
    textAlign: 'center',
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
    color: '#407CF4',
    fontWeight: 'bold',
  },
});
