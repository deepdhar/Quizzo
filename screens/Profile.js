import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  DeviceEventEmitter,
  Image,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import LogoutModal from '../components/LogoutModal';
import ProfileUpdatedModal from '../components/ProfileUpdatedModal';
import {getUserProfile, updateUserProfile} from '../utils/leaderboardService';
import {getPlayerStats} from '../utils/gameStorage';
import {signOutUser} from '../utils/authService';
import {resetRoot} from '../navigation';

// Custom 2D illustrated avatar characters matching Quizzo design system
const AVATAR_CHARACTERS = [
  {
    id: '🦁',
    label: 'Lion',
    image: require('../assets/avatars/lion.jpg'),
  },
  {
    id: '🚀',
    label: 'Rocket',
    image: require('../assets/avatars/rocket.jpg'),
  },
  {
    id: '👑',
    label: 'Crown',
    image: require('../assets/avatars/crown.jpg'),
  },
  {
    id: '🦊',
    label: 'Fox',
    image: require('../assets/avatars/fox.jpg'),
  },
  {
    id: '⚡',
    label: 'Lightning',
    image: require('../assets/avatars/lightning.jpg'),
  },
  {
    id: '🤖',
    label: 'Robot',
    emoji: '🤖',
  },
  {
    id: '🦄',
    label: 'Unicorn',
    emoji: '🦄',
  },
  {
    id: '🐼',
    label: 'Panda',
    emoji: '🐼',
  },
  {
    id: '🦉',
    label: 'Owl',
    emoji: '🦉',
  },
  {
    id: '🐯',
    label: 'Tiger',
    emoji: '🐯',
  },
];

// Checkmark icon for Save Profile button
const CheckIcon = ({color = '#FFFFFF', size = 18}) => (
  <View style={[styles.iconBox, {width: size, height: size}]}>
    <View
      style={[
        styles.checkMark,
        {
          width: size * 0.4,
          height: size * 0.72,
          borderColor: color,
        },
      ]}
    />
  </View>
);

// Restrained secondary red logout icon
const LogoutIcon = ({color = '#FF5C67', size = 18}) => (
  <View style={[styles.logoutIconBox, {width: size, height: size}]}>
    {/* Door outline */}
    <View
      style={[
        styles.logoutDoor,
        {
          width: size * 0.52,
          borderColor: color,
        },
      ]}
    />
    {/* Arrow shaft */}
    <View
      style={[
        styles.logoutShaft,
        {
          left: size * 0.26,
          width: size * 0.52,
          backgroundColor: color,
        },
      ]}
    />
    {/* Arrow top head */}
    <View
      style={[
        styles.logoutArrowHeadTop,
        {
          top: size * 0.5 - 4.5,
          backgroundColor: color,
        },
      ]}
    />
    {/* Arrow bottom head */}
    <View
      style={[
        styles.logoutArrowHeadBottom,
        {
          bottom: size * 0.5 - 4.5,
          backgroundColor: color,
        },
      ]}
    />
  </View>
);

const Profile = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isSaving, setIsSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const loadData = async () => {
    try {
      const [prof, stats] = await Promise.all([
        getUserProfile(),
        getPlayerStats(),
      ]);

      if (prof) {
        setPlayerName(prof.name || 'Player One');
        setSelectedAvatar(prof.avatar || '🚀');
        if (prof.avatar) {
          DeviceEventEmitter.emit('USER_PROFILE_UPDATED', prof.avatar);
        }
      }

      if (stats) {
        setPlayerStats(stats);
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updated = await updateUserProfile(playerName, selectedAvatar);
    setIsSaving(false);
    if (updated) {
      DeviceEventEmitter.emit('USER_PROFILE_UPDATED', selectedAvatar);
      setIsSuccessModalVisible(true);
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    await signOutUser();
    DeviceEventEmitter.emit('USER_PROFILE_UPDATED', null);
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } else {
      resetRoot('Login');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top : 0,
        },
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      {/* ── 1. HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        <View style={styles.emptyHeaderSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100,
          },
        ]}>
        {/* ── 2. PLAYER CUSTOMIZATION PANEL CARD ── */}
        <View style={styles.card}>
          {/* Avatar Section */}
          <Text style={styles.cardTitle}>Choose Your Avatar</Text>
          <View style={styles.avatarPickerRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarList}>
              {AVATAR_CHARACTERS.map(char => {
                const isSelected = selectedAvatar === char.id;
                return (
                  <TouchableOpacity
                    key={char.id}
                    style={[
                      styles.avatarPickItem,
                      isSelected && styles.avatarPickItemSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAvatar(char.id)}>
                    {char.image ? (
                      <Image
                        source={char.image}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.avatarPickEmoji}>
                        {char.emoji || char.id}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Player Nickname Section */}
          <Text style={styles.cardTitle}>Player Nickname</Text>
          <TextInput
            style={[styles.nameInput, isFocused && styles.nameInputFocused]}
            value={playerName}
            onChangeText={setPlayerName}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your nickname"
            placeholderTextColor="#94A3B8"
            maxLength={15}
          />

          {/* 5. Save Profile Button: Primary Quizzo Blue (#407CF4) */}
          <Button3D
            title={isSaving ? 'SAVING...' : 'SAVE PROFILE'}
            onPress={handleSaveProfile}
            color="#407CF4"
            shadowColor="#255CD0"
            size="large"
            icon={<CheckIcon color="#FFFFFF" size={18} />}
            disabled={isSaving}
            style={styles.saveProfileBtn}
          />
        </View>

        {/* ── 7. GAMIFIED PLAYER PROGRESSION STATS ── */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <Text style={styles.statsSectionTitle}>PLAYER STATS</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {playerStats?.levelInfo?.icon || '🌱'} Level{' '}
                {playerStats?.levelInfo?.level || 1} ·{' '}
                {playerStats?.levelInfo?.title || 'Curious Scout'}
              </Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumberXP}>
                {playerStats?.totalXP || 0} XP
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumberBlue}>
                {playerStats?.gamesPlayed || 0}
              </Text>
              <Text style={styles.statLabel}>Quizzes Played</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumberGreen}>
                {playerStats?.bestScore || 0}/10
              </Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
          </View>
        </View>

        {/* ── 6. RESTRAINED SECONDARY LOGOUT BUTTON ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => setIsLogoutModalVisible(true)}>
          <LogoutIcon color="#FF5C67" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── PART 2: CUSTOM QUIZZO LOGOUT CONFIRMATION MODAL ── */}
      <LogoutModal
        visible={isLogoutModalVisible}
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* ── CUSTOM QUIZZO PROFILE UPDATED SUCCESS MODAL ── */}
      <ProfileUpdatedModal
        visible={isSuccessModalVisible}
        onDismiss={() => setIsSuccessModalVisible(false)}
      />
    </View>
  );
};

export default Profile;

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
    paddingBottom: 16,
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
  headerTitle: {
    color: '#253858',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyHeaderSpacer: {
    width: 38,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── Card Container ──
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#253858',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  // ── Avatar Selector ──
  avatarPickerRow: {
    marginBottom: 22,
    width: '100%',
  },
  avatarList: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  avatarPickItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarPickItemSelected: {
    borderColor: '#407CF4',
    borderWidth: 2.5,
    backgroundColor: '#EFF6FF',
    shadowColor: '#407CF4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    transform: [{scale: 1.06}],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPickEmoji: {
    fontSize: 30,
    color: '#000000',
    opacity: 1,
  },

  // ── Player Nickname Input ──
  nameInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#253858',
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  nameInputFocused: {
    borderColor: '#407CF4',
    backgroundColor: '#FFFFFF',
    shadowColor: '#407CF4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },

  // ── Save Button ──
  saveProfileBtn: {
    width: '100%',
    marginTop: 4,
  },

  // ── Player Gamification Stats Card ──
  statsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 4,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statsSectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  levelBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  levelBadgeText: {
    color: '#407CF4',
    fontSize: 12,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statNumberXP: {
    color: '#FFC83D',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  statNumberBlue: {
    color: '#407CF4',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  statNumberGreen: {
    color: '#35C878',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Restrained Secondary Logout Button ──
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    shadowColor: '#FF5C67',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    color: '#FF5C67',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Icon Helper Styles ──
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    transform: [{rotate: '45deg'}, {translateY: -2}],
  },
  logoutIconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoutDoor: {
    position: 'absolute',
    left: 0,
    top: 1,
    bottom: 1,
    borderWidth: 2,
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  logoutShaft: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  logoutArrowHeadTop: {
    position: 'absolute',
    right: 1,
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{rotate: '45deg'}],
  },
  logoutArrowHeadBottom: {
    position: 'absolute',
    right: 1,
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{rotate: '-45deg'}],
  },
});
