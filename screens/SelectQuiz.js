import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {getPlayerStats} from '../utils/gameStorage';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = [
  {
    id: '18',
    name: 'Computers',
    image: require('../assets/categories/cat_computers.jpg'),
    fallbackIcon: '💻',
    color: '#407CF4', // Primary Blue
    description: 'Tech & Coding',
    badge: 'Popular 🔥',
  },
  {
    id: '22',
    name: 'Geography',
    image: require('../assets/categories/cat_geography.jpg'),
    fallbackIcon: '🌍',
    color: '#28A9B8', // Teal
    description: 'Maps & Earth',
    badge: null,
  },
  {
    id: '21',
    name: 'Sports',
    image: require('../assets/categories/cat_sports.jpg'),
    fallbackIcon: '⚽',
    color: '#FF8A4C', // Energy Orange
    description: 'Games & Stars',
    badge: null,
  },
  {
    id: '23',
    name: 'History',
    image: require('../assets/categories/cat_history.jpg'),
    fallbackIcon: '🏛️',
    color: '#8B65E8', // Purple
    description: 'Past Legends',
    badge: null,
  },
  {
    id: '27',
    name: 'Animals',
    image: require('../assets/categories/cat_animals.jpg'),
    fallbackIcon: '🦁',
    color: '#FFC83D', // Warm Gold/Yellow
    description: 'Wild & Pets',
    badge: 'Fun 🐾',
  },
  {
    id: '17',
    name: 'Science',
    image: require('../assets/categories/cat_science.jpg'),
    fallbackIcon: '🔬',
    color: '#35C878', // Success Green
    description: 'Space & Lab',
    badge: 'New ✨',
  },
  {
    id: '11',
    name: 'Movies',
    image: require('../assets/categories/cat_movies.jpg'),
    fallbackIcon: '🎬',
    color: '#FF5B79', // Coral Pink
    description: 'Cinema & Pop',
    badge: null,
  },
  {
    id: 'quick',
    name: 'Quick Play',
    image: require('../assets/categories/cat_quickplay.jpg'),
    fallbackIcon: '⚡',
    color: '#6366F1', // Indigo
    description: 'Instant 10 Qs',
    badge: 'Fast ⚡',
  },
];

const DIFFICULTIES = [
  {key: 'easy', label: 'Easy', icon: '🌱', activeColor: '#35C878'},
  {key: 'medium', label: 'Medium', icon: '⚡', activeColor: '#407CF4'},
  {key: 'hard', label: 'Hard', icon: '🔥', activeColor: '#FF5B79'},
];

const SelectQuiz = () => {
  const navigation = useNavigation();
  const [difficulty, setDifficulty] = useState('medium');
  const [stats, setStats] = useState({
    categoriesPlayed: [],
    bestScore: 0,
    gamesPlayed: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      getPlayerStats().then(loadedStats => {
        if (isMounted && loadedStats) {
          setStats(loadedStats);
        }
      });
      return () => {
        isMounted = false;
      };
    }, []),
  );

  const handleCategoryPress = category => {
    let url;
    if (category.id === 'quick') {
      // Pull randomly across all categories
      url = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple&encode=url3986`;
    } else {
      url = `https://opentdb.com/api.php?amount=10&category=${category.id}&difficulty=${difficulty}&type=multiple&encode=url3986`;
    }

    navigation.navigate('Quiz', {
      url,
      categoryName: category.name,
      categoryIcon: category.fallbackIcon,
      difficulty,
    });
  };

  const getProgressBadge = item => {
    const isPlayed =
      Array.isArray(stats.categoriesPlayed) &&
      stats.categoriesPlayed.includes(item.name);

    if (isPlayed) {
      if (stats.bestScore >= 8) {
        return {text: 'Mastered 🌟', isPlayed: true};
      }
      return {text: `Best: ${stats.bestScore || 7}/10`, isPlayed: true};
    }

    if (item.badge) {
      return {text: item.badge, isPlayed: false};
    }

    return null;
  };

  const renderCategoryCard = ({item}) => {
    const badgeInfo = getProgressBadge(item);

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            borderColor: item.color + '30',
          },
        ]}
        activeOpacity={0.88}
        onPress={() => handleCategoryPress(item)}>
        {/* Subtle Top Progress / Status Badge */}
        <View style={styles.cardHeaderRow}>
          {badgeInfo ? (
            <View
              style={[
                styles.statusBadge,
                badgeInfo.isPlayed
                  ? styles.statusBadgePlayed
                  : {backgroundColor: item.color + '18'},
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  badgeInfo.isPlayed
                    ? styles.statusBadgeTextPlayed
                    : {color: item.color},
                ]}>
                {badgeInfo.text}
              </Text>
            </View>
          ) : (
            <View style={styles.statusBadgePlaceholder} />
          )}
        </View>

        {/* 2D Vector Illustrated Icon */}
        <View style={[styles.iconContainer]}>
          <Image
            source={item.image}
            style={styles.categoryIllustration}
            resizeMode="contain"
          />
        </View>

        {/* Category Name - Strongest Text Element */}
        <Text numberOfLines={1} style={styles.categoryTitle}>
          {item.name}
        </Text>

        {/* Short Description */}
        <Text numberOfLines={1} style={styles.categoryDesc}>
          {item.description}
        </Text>

        {/* Reward Information Pill */}
        <View style={[styles.rewardPill, {backgroundColor: item.color + '12'}]}>
          <Text style={[styles.rewardPillText, {color: item.color}]}>
            10 Questions · +100 XP
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          style={styles.backButton}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Choose Category</Text>
          <Text style={styles.headerSubtitle}>Select your trivia arena</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Difficulty Selector */}
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>SELECT DIFFICULTY</Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTIES.map(diff => {
            const isSelected = difficulty === diff.key;
            return (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.diffPill,
                  isSelected && [
                    styles.diffPillSelected,
                    {
                      backgroundColor: diff.activeColor + '15',
                      borderColor: diff.activeColor,
                    },
                  ],
                ]}
                activeOpacity={0.82}
                onPress={() => setDifficulty(diff.key)}>
                <Text style={styles.diffIcon}>{diff.icon}</Text>
                <Text
                  style={[
                    styles.diffText,
                    isSelected && [
                      styles.diffTextSelected,
                      {color: diff.activeColor},
                    ],
                  ]}>
                  {diff.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2-Column Categories Grid */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={item => item.id}
        renderItem={renderCategoryCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default SelectQuiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    color: '#25324A',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -3,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#25324A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#7A8B99',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  difficultyContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  difficultyLabel: {
    color: '#7A8B99',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diffPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  diffPillSelected: {
    shadowOpacity: 0,
    elevation: 0,
  },
  diffIcon: {
    fontSize: 13,
    marginRight: 5,
    backgroundColor: 'transparent',
  },
  diffText: {
    color: '#7A8B99',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  diffTextSelected: {
    fontWeight: '800',
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    width: '100%',
    height: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgePlayed: {
    backgroundColor: '#35C87818',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusBadgeTextPlayed: {
    color: '#35C878',
  },
  statusBadgePlaceholder: {
    height: 18,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIllustration: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  categoryTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryDesc: {
    color: '#7A8B99',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
