import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

const CATEGORIES = [
  {
    id: '18',
    name: 'Computers',
    icon: '💻',
    color: '#4F46E5',
    shadow: '#3730A3',
    description: 'Tech & Code',
  },
  {
    id: '22',
    name: 'Geography',
    icon: '🌍',
    color: '#059669',
    shadow: '#047857',
    description: 'Maps & Earth',
  },
  {
    id: '21',
    name: 'Sports',
    icon: '⚽',
    color: '#EA580C',
    shadow: '#C2410C',
    description: 'Games & Stars',
  },
  {
    id: '23',
    name: 'History',
    icon: '🏛️',
    color: '#9333EA',
    shadow: '#7E22CE',
    description: 'Past Legends',
  },
  {
    id: '27',
    name: 'Animals',
    icon: '🦁',
    color: '#0891B2',
    shadow: '#0E7490',
    description: 'Wild & Pets',
  },
  {
    id: '17',
    name: 'Science',
    icon: '🔬',
    color: '#2563EB',
    shadow: '#1D4ED8',
    description: 'Space & Lab',
  },
  {
    id: '11',
    name: 'Movies',
    icon: '🎬',
    color: '#DC2626',
    shadow: '#B91C1C',
    description: 'Cinema & Pop',
  },
  {
    id: '20',
    name: 'Mythology',
    icon: '⚡',
    color: '#D97706',
    shadow: '#B45309',
    description: 'Gods & Lore',
  },
];

const DIFFICULTIES = [
  {key: 'easy', label: 'Easy', icon: '🌱', activeColor: '#10B981'},
  {key: 'medium', label: 'Medium', icon: '⚡', activeColor: '#F59E0B'},
  {key: 'hard', label: 'Hard', icon: '🔥', activeColor: '#EF4444'},
];

const SelectQuiz = () => {
  const navigation = useNavigation();
  const [difficulty, setDifficulty] = useState('medium');

  const handleCategoryPress = category => {
    const url = `https://opentdb.com/api.php?amount=10&category=${category.id}&difficulty=${difficulty}&type=multiple&encode=url3986`;
    navigation.navigate('Quiz', {
      url,
      categoryName: category.name,
      categoryIcon: category.icon,
      difficulty,
    });
  };

  const renderCategoryCard = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: item.color,
            borderBottomColor: item.shadow,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleCategoryPress(item)}>
        <View style={styles.iconCircle}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.categoryTitle}>{item.name}</Text>
        <Text style={styles.categoryDesc}>{item.description}</Text>
        <View style={styles.questionsPill}>
          <Text style={styles.questionsPillText}>10 Qs • +100 XP</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
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
                  isSelected && {
                    backgroundColor: diff.activeColor,
                    borderColor: diff.activeColor,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setDifficulty(diff.key)}>
                <Text style={styles.diffIcon}>{diff.icon}</Text>
                <Text
                  style={[
                    styles.diffText,
                    isSelected && styles.diffTextSelected,
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
    backgroundColor: '#06173B',
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 2,
  },
  headerSpacer: {
    width: 38,
  },
  difficultyContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  difficultyLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 1,
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
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diffIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  diffText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  diffTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionsPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  questionsPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
});
