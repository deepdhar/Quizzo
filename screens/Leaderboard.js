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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import {
  fetchGlobalLeaderboard,
  getUserProfile,
  updateUserProfile,
  subscribeToLeaderboardChanges,
  AVATAR_OPTIONS,
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
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  const loadLeaderboard = useCallback(async () => {
    try {
      const result = await fetchGlobalLeaderboard(timeframe);
      if (result && Array.isArray(result.leaderboard)) {
        setData(result);
      }
    } catch (e) {
      // Gracefully handle any error
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const loadProfile = async () => {
    try {
      const prof = await getUserProfile();
      if (prof) {
        setPlayerName(prof.name || 'Player One');
        setSelectedAvatar(prof.avatar || '🚀');
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleSaveProfile = async () => {
    await updateUserProfile(playerName, selectedAvatar);
    setProfileModalVisible(false);
    loadLeaderboard();
  };

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
            {data.isRealtime
              ? '🟢 Live Realtime Scores'
              : 'Compete with trivia masters'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setProfileModalVisible(true)}
          style={styles.profileBtn}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Player Profile</Text>
            <Text style={styles.modalSubtitle}>
              Choose your avatar &amp; player name
            </Text>

            <View style={styles.avatarPickerRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarList}>
                {AVATAR_OPTIONS.map((av, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.avatarPickItem,
                      selectedAvatar === av && styles.avatarPickItemSelected,
                    ]}
                    onPress={() => setSelectedAvatar(av)}>
                    <Text style={styles.avatarPickEmoji}>{av}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={styles.nameInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your nickname"
              placeholderTextColor="#64748B"
              maxLength={15}
            />

            <Button3D
              title="SAVE PROFILE ✨"
              onPress={handleSaveProfile}
              color="#10B981"
              shadowColor="#059669"
              size="medium"
              style={styles.saveProfileBtn}
            />

            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Leaderboard;

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
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 2,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  profileBtnText: {
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#38BDF8',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  activeTabText: {
    color: '#06173B',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
    fontFamily: 'Ubuntu-Medium',
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
  },
  firstAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
  },
  secondAvatar: {
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    borderColor: '#94A3B8',
  },
  thirdAvatar: {
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderColor: '#D97706',
  },
  podiumAvatarText: {
    fontSize: 26,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 2,
    maxWidth: 90,
  },
  podiumXP: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 6,
  },
  podiumXPFirst: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
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
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#F59E0B',
  },
  secondBase: {
    height: 70,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#94A3B8',
  },
  thirdBase: {
    height: 55,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#D97706',
  },
  podiumRankText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  podiumRankTextFirst: {
    color: '#FBBF24',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentUserRowHighlight: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  rankContainer: {
    width: 32,
  },
  rankNumber: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginRight: 6,
    maxWidth: 140,
  },
  currentUserText: {
    color: '#38BDF8',
  },
  streakBadge: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  levelTag: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 2,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  xpLabel: {
    color: '#64748B',
    fontSize: 10,
    fontFamily: 'Ubuntu-Regular',
  },
  stickyUserBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    borderTopWidth: 2,
    borderTopColor: '#38BDF8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyRankBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  stickyRankText: {
    color: '#06173B',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Ubuntu-Medium',
  },
  stickyAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stickyAvatarEmoji: {
    fontSize: 18,
  },
  stickyUserInfo: {
    flex: 1,
  },
  stickyUserName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  stickyUserSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
  },
  stickyXPBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 11, 0.3)',
  },
  stickyXPText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 38, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 16,
  },
  avatarPickerRow: {
    marginBottom: 16,
    width: '100%',
  },
  avatarList: {
    paddingVertical: 4,
  },
  avatarPickItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarPickItemSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  avatarPickEmoji: {
    fontSize: 24,
  },
  nameInput: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Ubuntu-Medium',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  saveProfileBtn: {
    width: '100%',
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
  },
});
