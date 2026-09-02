import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Button3D from '../components/Button3D';
import GoogleIcon from '../components/GoogleIcon';
import {
  getUserProfile,
  updateUserProfile,
  setOnboarded,
  AVATAR_OPTIONS,
} from '../utils/leaderboardService';
import {configureGoogleSignIn, signInWithGoogle} from '../utils/authService';

const Login = () => {
  const navigation = useNavigation();
  const [selectedMode, setSelectedMode] = useState('google'); // 'google' | 'username'
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
    getUserProfile().then(prof => {
      if (prof) {
        if (prof.name && prof.name !== 'Player One') {
          setNickname(prof.name);
        }
        if (prof.avatar) {
          setSelectedAvatar(prof.avatar);
        }
      }
    });
  }, []);

  const handleStartWithUsername = async () => {
    const finalName = nickname.trim() || 'Player One';
    setIsUsernameLoading(true);
    try {
      await updateUserProfile(finalName, selectedAvatar);
      await setOnboarded();
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsUsernameLoading(false);
    }
  };

  const handleGoogleSignInPress = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigation.replace('Home');
      } else if (!result.cancelled) {
        Alert.alert('Google Sign-In', result.error || 'Sign in failed');
      }
    } catch (e) {
      Alert.alert('Google Sign-In Error', 'Unable to complete Google Sign-In.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestPlay = async () => {
    await setOnboarded();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Top Logo / Mascot */}
          <View style={styles.mascotSection}>
            <View style={styles.mascotGlow}>
              <Text style={styles.mascotEmoji}>🏆</Text>
            </View>
            <Text style={styles.appTitle}>Quizzo ✨</Text>
            <Text style={styles.appTagline}>
              Train Your Brain &amp; Climb the Global Leaderboard!
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                selectedMode === 'google' && styles.modeTabActive,
              ]}
              onPress={() => setSelectedMode('google')}>
              <Text
                style={[
                  styles.modeTabText,
                  selectedMode === 'google' && styles.modeTabTextActive,
                ]}>
                🌐 Google Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                selectedMode === 'username' && styles.modeTabActive,
              ]}
              onPress={() => setSelectedMode('username')}>
              <Text
                style={[
                  styles.modeTabText,
                  selectedMode === 'username' && styles.modeTabTextActive,
                ]}>
                🎮 Pick Nickname
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card Content based on Mode */}
          {selectedMode === 'google' ? (
            <View style={styles.cardContainer}>
              <View style={styles.googleHeroBox}>
                <View style={styles.googleIconCircle}>
                  <GoogleIcon size={32} style={styles.heroGoogleLogo} />
                </View>
                <Text style={styles.googleCardTitle}>Sign in with Google</Text>
                <Text style={styles.googleCardSubtitle}>
                  One-tap sign in using your official Google Account to sync XP,
                  stats, and real-time ranks.
                </Text>
              </View>

              {/* Official styled Google Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.googleOfficialButton,
                  isGoogleLoading && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleGoogleSignInPress}
                disabled={isGoogleLoading}>
                {isGoogleLoading ? (
                  <ActivityIndicator color="#1F2937" size="small" />
                ) : (
                  <View style={styles.googleButtonInner}>
                    <GoogleIcon size={24} />
                    <Text style={styles.googleButtonText}>
                      Sign in with Google
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardContainer}>
              <Text style={styles.sectionHeading}>1. Choose Your Avatar</Text>
              <View style={styles.avatarPickerRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.avatarList}>
                  {AVATAR_OPTIONS.map((av, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.avatarItem,
                        selectedAvatar === av && styles.avatarItemSelected,
                      ]}
                      onPress={() => setSelectedAvatar(av)}>
                      <Text style={styles.avatarEmoji}>{av}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.sectionHeading}>2. Enter Your Nickname</Text>
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="e.g. BrainiacMax, StarGazer"
                placeholderTextColor="#64748B"
                maxLength={15}
                autoCorrect={false}
              />

              <Button3D
                title={isUsernameLoading ? 'SETTING UP...' : 'LET’S PLAY! 🚀'}
                onPress={handleStartWithUsername}
                size="large"
                disabled={isUsernameLoading}
                style={styles.actionBtn}
              />
            </View>
          )}

          {/* Quick Play as Guest */}
          <TouchableOpacity style={styles.guestLink} onPress={handleGuestPlay}>
            <Text style={styles.guestLinkText}>
              Skip &amp; Play as Guest ⚡
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F7DF3',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascotGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 87, 0.5)',
    marginBottom: 12,
  },
  mascotEmoji: {
    fontSize: 50,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  appTagline: {
    color: '#E2E8F0',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 4,
    width: '100%',
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modeTabTextActive: {
    color: '#4F7DF3',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  googleHeroBox: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  googleIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  heroGoogleLogo: {
    marginRight: 0,
  },
  googleCardTitle: {
    color: '#25324A',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  googleCardSubtitle: {
    color: '#7A8B99',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  googleOfficialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#25324A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeading: {
    color: '#25324A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avatarPickerRow: {
    marginBottom: 16,
  },
  avatarList: {
    paddingVertical: 4,
  },
  avatarItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarItemSelected: {
    borderColor: '#4F7DF3',
    backgroundColor: 'rgba(79, 125, 243, 0.1)',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  textInput: {
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#25324A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  actionBtn: {
    width: '100%',
  },
  guestLink: {
    paddingVertical: 12,
  },
  guestLinkText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
