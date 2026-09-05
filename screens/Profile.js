import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import {
  getUserProfile,
  updateUserProfile,
  AVATAR_OPTIONS,
} from '../utils/leaderboardService';
import {signOutUser} from '../utils/authService';
import {resetRoot} from '../navigation';

const LogoutIcon = ({color = '#FFFFFF', size = 18}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    }}>
    {/* Door outline */}
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 1,
        bottom: 1,
        width: size * 0.52,
        borderWidth: 2,
        borderRightWidth: 0,
        borderColor: color,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
      }}
    />
    {/* Arrow shaft */}
    <View
      style={{
        position: 'absolute',
        left: size * 0.26,
        width: size * 0.52,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    {/* Arrow top head */}
    <View
      style={{
        position: 'absolute',
        right: 1,
        top: size * 0.5 - 4.5,
        width: 6,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{rotate: '45deg'}],
      }}
    />
    {/* Arrow bottom head */}
    <View
      style={{
        position: 'absolute',
        right: 1,
        bottom: size * 0.5 - 4.5,
        width: 6,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{rotate: '-45deg'}],
      }}
    />
  </View>
);

const Profile = () => {
  const navigation = useNavigation();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Quizzo?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
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
        },
      },
    ]);
  };

  const loadProfile = async () => {
    try {
      const prof = await getUserProfile();
      if (prof) {
        setPlayerName(prof.name || 'Player One');
        setSelectedAvatar(prof.avatar || '🚀');
        if (prof.avatar) {
          DeviceEventEmitter.emit('USER_PROFILE_UPDATED', prof.avatar);
        }
      }
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updated = await updateUserProfile(playerName, selectedAvatar);
    setIsSaving(false);
    if (updated) {
      DeviceEventEmitter.emit('USER_PROFILE_UPDATED', selectedAvatar);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose Your Avatar</Text>

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

          <Text style={styles.cardTitle}>Player Nickname</Text>
          <TextInput
            style={styles.nameInput}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter your nickname"
            placeholderTextColor="#7A8B99"
            maxLength={15}
          />

          <Button3D
            title={isSaving ? 'SAVING...' : 'SAVE PROFILE ✨'}
            onPress={handleSaveProfile}
            color="#63C174"
            shadowColor="#4FA05D"
            size="medium"
            disabled={isSaving}
            style={styles.saveProfileBtn}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={handleLogout}>
          <LogoutIcon color="#FFFFFF" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    color: '#25324A',
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
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    color: '#25324A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  avatarPickerRow: {
    marginBottom: 24,
    width: '100%',
  },
  avatarList: {
    paddingVertical: 4,
  },
  avatarPickItem: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPickItemSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2.5,
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    transform: [{scale: 1.05}],
  },
  avatarPickEmoji: {
    fontSize: 28,
    color: '#000000',
    opacity: 1,
  },
  nameInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#25324A',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  saveProfileBtn: {
    width: '100%',
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
