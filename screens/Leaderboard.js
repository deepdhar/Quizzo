import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import {
  fetchGlobalLeaderboard,
  subscribeToLeaderboardChanges,
  syncPlayerToLeaderboard,
} from '../utils/leaderboardService';

const Leaderboard = () => {
  const navigation = useNavigation();
  const [timeframe, setTimeframe] = useState('all-time');
  const [data, setData] = useState({
    leaderboard: [],
    userRankInfo: null,
    isRealtime: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Sync local player stats once when entering leaderboard screen
    syncPlayerToLeaderboard().catch(() => {});
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const result = await fetchGlobalLeaderboard(timeframe);
      if (result && Array.isArray(result.leaderboard)) {
        setData(result);
      }
    } catch (e) {
      Alert.alert(
        'Error',
        'Leaderboard is currently down or unreachable. Please try again later.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncPlayerToLeaderboard().catch(() => {});
    await loadLeaderboard();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Real-time subscription to cloud changes
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToLeaderboardChanges(() => {
        loadLeaderboard();
      });
    } catch (e) {
      // Ignored
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (e) {
          // Ignored
        }
      }
    };
  }, [loadLeaderboard]);


  const hasPodium =
    data && Array.isArray(data.leaderboard) && data.leaderboard.length >= 3;
  const top3 = hasPodium ? data.leaderboard.slice(0, 3) : [];
  const remainingPlayers = hasPodium
    ? data.leaderboard.slice(3)
    : data?.leaderboard || [];

  const first = top3[0] || null;
  const second = top3[1] || null;
  const third = top3[2] || null;

  const renderPlayerRow = ({item}) => {
    if (!item) {
      return null;
    }

    return (
      <View
        style={[
          styles.playerRow,
          item.isCurrentUser && styles.currentUserRowHighlight,
        ]}>
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankNumber,
              item.isCurrentUser && styles.currentUserText,
            ]}>
            #{item.rank || '-'}
          </Text>
        </View>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{item.avatar || '🚀'}</Text>
        </View>

        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.playerName,
                item.isCurrentUser && styles.currentUserText,
              ]}
              numberOfLines={1}>
              {item.name || 'Player'}
            </Text>
            {item.streak > 0 && (
              <Text style={styles.streakBadge}>🔥{item.streak}</Text>
            )}
          </View>
          <Text style={styles.levelTag}>Level {item.level || 1}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>⭐ {item.xp || 0}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Global Leaderboard 🏆</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Compete with trivia masters
          </Text>
        </View>

        <View style={styles.emptyHeaderSpacer} />
      </View>

      {/* Timeframe Selector Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            timeframe === 'all-time' && styles.activeTab,
          ]}
          onPress={() => setTimeframe('all-time')}>
          <Text
            style={[
              styles.tabText,
              timeframe === 'all-time' && styles.activeTabText,
            ]}>
            🌟 All-Time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, timeframe === 'weekly' && styles.activeTab]}
          onPress={() => setTimeframe('weekly')}>
          <Text
            style={[
              styles.tabText,
              timeframe === 'weekly' && styles.activeTabText,
            ]}>
            ⚡ This Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading or Empty State */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>Loading Leaderboard...</Text>
        </View>
      ) : (
        <FlatList
          data={remainingPlayers}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          renderItem={renderPlayerRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38BDF8"
            />
          }
          ListHeaderComponent={
            hasPodium && first && second && third ? (
              <View style={styles.podiumContainer}>
                {/* 2nd Place */}
                <View style={[styles.podiumColumn, styles.secondColumn]}>
                  <Text style={styles.podiumMedal}>🥈</Text>
                  <View
                    style={[styles.podiumAvatarCircle, styles.secondAvatar]}>
                    <Text style={styles.podiumAvatarText}>
                      {second.avatar || '🚀'}
                    </Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {second.name || 'Player'}
                  </Text>
                  <Text style={styles.podiumXP}>⭐ {second.xp || 0}</Text>
                  <View style={[styles.podiumBase, styles.secondBase]}>
                    <Text style={styles.podiumRankText}>#2</Text>
                  </View>
                </View>

                {/* 1st Place */}
                <View style={[styles.podiumColumn, styles.firstColumn]}>
                  <Text style={styles.crownEmoji}>👑</Text>
                  <Text style={styles.podiumMedal}>🥇</Text>
                  <View style={[styles.podiumAvatarCircle, styles.firstAvatar]}>
                    <Text style={styles.podiumAvatarText}>
                      {first.avatar || '👑'}
                    </Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {first.name || 'Player'}
                  </Text>
                  <Text style={styles.podiumXPFirst}>⭐ {first.xp || 0}</Text>
                  <View style={[styles.podiumBase, styles.firstBase]}>
                    <Text style={styles.podiumRankTextFirst}>#1</Text>
                  </View>
                </View>

                {/* 3rd Place */}
                <View style={[styles.podiumColumn, styles.thirdColumn]}>
                  <Text style={styles.podiumMedal}>🥉</Text>
                  <View style={[styles.podiumAvatarCircle, styles.thirdAvatar]}>
                    <Text style={styles.podiumAvatarText}>
                      {third.avatar || '🚀'}
                    </Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {third.name || 'Player'}
                  </Text>
                  <Text style={styles.podiumXP}>⭐ {third.xp || 0}</Text>
                  <View style={[styles.podiumBase, styles.thirdBase]}>
                    <Text style={styles.podiumRankText}>#3</Text>
                  </View>
                </View>
              </View>
            ) : null
          }
        />
      )}

      {/* Sticky User Standing Bar */}
      {data?.userRankInfo && (
        <View style={styles.stickyUserBar}>
          <View style={styles.stickyRankBadge}>
            <Text style={styles.stickyRankText}>
              #{data.userRankInfo.rank || 1}
            </Text>
          </View>

          <View style={styles.stickyAvatarCircle}>
            <Text style={styles.stickyAvatarEmoji}>
              {data.userRankInfo.avatar || '🚀'}
            </Text>
          </View>

          <View style={styles.stickyUserInfo}>
            <Text style={styles.stickyUserName}>Your Standing</Text>
            <Text style={styles.stickyUserSub}>
              Level {data.userRankInfo.level || 1}
            </Text>
          </View>

          <View style={styles.stickyXPBox}>
            <Text style={styles.stickyXPText}>
              ⭐ {data.userRankInfo.xp || 0} XP
            </Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

export default Leaderboard;

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
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    color: '#25324A',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#25324A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#7A8B99',
    fontSize: 12,
    marginTop: 2,
  },
  emptyHeaderSpacer: {
    width: 38,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#4F7DF3',
  },
  tabText: {
    color: '#7A8B99',
    fontSize: 13,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#7A8B99',
    fontSize: 14,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 14,
    paddingTop: 16,
  },
  podiumColumn: {
    alignItems: 'center',
    flex: 1,
  },
  firstColumn: {
    zIndex: 2,
  },
  secondColumn: {
    zIndex: 1,
  },
  thirdColumn: {
    zIndex: 1,
  },
  crownEmoji: {
    fontSize: 22,
    marginBottom: -4,
  },
  podiumMedal: {
    fontSize: 16,
    marginBottom: 4,
  },
  podiumAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  firstAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
    borderColor: '#FFC857',
  },
  secondAvatar: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  thirdAvatar: {
    backgroundColor: 'rgba(255, 138, 76, 0.2)',
    borderColor: '#FF8A4C',
  },
  podiumAvatarText: {
    fontSize: 26,
  },
  podiumName: {
    color: '#25324A',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    maxWidth: 90,
  },
  podiumXP: {
    color: '#7A8B99',
    fontSize: 11,
    marginBottom: 6,
  },
  podiumXPFirst: {
    color: '#E6AC00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  podiumBase: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  firstBase: {
    height: 90,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#FFC857',
  },
  secondBase: {
    height: 70,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#CBD5E1',
  },
  thirdBase: {
    height: 55,
    backgroundColor: 'rgba(255, 138, 76, 0.15)',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#FF8A4C',
  },
  podiumRankText: {
    color: '#25324A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  podiumRankTextFirst: {
    color: '#E6AC00',
    fontSize: 22,
    fontWeight: 'bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserRowHighlight: {
    borderColor: '#4F7DF3',
    borderWidth: 1.5,
    backgroundColor: '#EDF4FF',
    shadowOpacity: 0,
    elevation: 0,
  },
  rankContainer: {
    width: 32,
    backgroundColor: 'transparent',
  },
  rankNumber: {
    color: '#7A8B99',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarEmoji: {
    fontSize: 20,
    backgroundColor: 'transparent',
  },
  playerInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playerName: {
    color: '#25324A',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
    maxWidth: 140,
    backgroundColor: 'transparent',
  },
  currentUserText: {
    color: '#4F7DF3',
    backgroundColor: 'transparent',
  },
  streakBadge: {
    color: '#FF8A4C',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  levelTag: {
    color: '#7A8B99',
    fontSize: 11,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  xpContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  xpText: {
    color: '#FFC857',
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  xpLabel: {
    color: '#7A8B99',
    fontSize: 10,
    backgroundColor: 'transparent',
  },
  stickyUserBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  stickyRankBadge: {
    backgroundColor: '#4F7DF3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  stickyRankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stickyAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stickyAvatarEmoji: {
    fontSize: 18,
  },
  stickyUserInfo: {
    flex: 1,
  },
  stickyUserName: {
    color: '#25324A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stickyUserSub: {
    color: '#7A8B99',
    fontSize: 11,
  },
  stickyXPBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC857',
  },
  stickyXPText: {
    color: '#E6AC00',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
