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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import {
  getUserProfile,
  updateUserProfile,
  AVATAR_OPTIONS,
} from '../utils/leaderboardService';

const Profile = () => {
  const navigation = useNavigation();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isSaving, setIsSaving] = useState(false);

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
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updated = await updateUserProfile(playerName, selectedAvatar);
    setIsSaving(false);
    if (updated) {
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Your Profile 👤</Text>
          <Text style={styles.headerSubtitle}>Customize your identity</Text>
        </View>
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
            title={isSaving ? "SAVING..." : "SAVE PROFILE ✨"}
            onPress={handleSaveProfile}
            color="#63C174"
            shadowColor="#4FA05D"
            size="medium"
            disabled={isSaving}
            style={styles.saveProfileBtn}
          />
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#25324A',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#7A8B99',
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarPickItemSelected: {
    borderColor: '#4F7DF3',
    backgroundColor: 'rgba(79, 125, 243, 0.15)',
  },
  avatarPickEmoji: {
    fontSize: 28,
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
});
