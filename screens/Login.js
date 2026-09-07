import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import GoogleIcon from '../components/GoogleIcon';
import {
  getUserProfile,
  updateUserProfile,
  setOnboarded,
} from '../utils/leaderboardService';
import {configureGoogleSignIn, signInWithGoogle} from '../utils/authService';

const Login = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // 1-Tap Google Sign-In
  const handleGoogleSignInPress = async () => {
    if (isGoogleLoading || isGuestLoading) {
      return;
    }
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        DeviceEventEmitter.emit(
          'USER_PROFILE_UPDATED',
          result.user?.avatar || '👑',
        );
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        });
      } else if (!result.cancelled) {
        Alert.alert('Google Sign-In', result.error || 'Sign in failed');
      }
    } catch (e) {
      Alert.alert('Google Sign-In Error', 'Unable to complete Google Sign-In.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Continue as Guest
  const handleGuestPress = async () => {
    if (isGoogleLoading || isGuestLoading) {
      return;
    }
    setIsGuestLoading(true);
    try {
      let profile = await getUserProfile();
      if (!profile || !profile.name) {
        profile = await updateUserProfile('Player One', '🚀');
      }
      await setOnboarded();
      DeviceEventEmitter.emit('USER_PROFILE_UPDATED', profile?.avatar || '🚀');
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    } catch (e) {
      await setOnboarded();
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#407CF4" />
      {/* Subtle Floating Background Accents */}
      <View pointerEvents="none" style={styles.bgDecorations}>
        <Text style={[styles.bgSymbol, styles.symbolTopLeft]}>✦</Text>
        <Text style={[styles.bgSymbol, styles.symbolTopRight]}>★</Text>
        <Text style={[styles.bgSymbol, styles.symbolMidLeft]}>?</Text>
        <Text style={[styles.bgSymbol, styles.symbolMidRight]}>⚡</Text>
        <Text style={[styles.bgSymbol, styles.symbolBottomLeft]}>✦</Text>
        <Text style={[styles.bgSymbol, styles.symbolBottomRight]}>★</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top > 0 ? insets.top + 8 : 16,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 32,
            },
          ]}>
          {/* ── 3. QUIZZO BRANDING & MASCOT ── */}
          <View style={styles.brandingSection}>
            <View style={styles.mascotWrapper}>
              <Image
                source={require('../assets/login_trophy_mascot.jpg')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.appTitle}>Quizzo✨</Text>

            {/* ── 4. SHORT ENGAGING TAGLINE ── */}
            <Text style={styles.taglineMain}>Ready to test your brain?</Text>
            <Text style={styles.taglineSub}>Play. Learn. Level up.</Text>
          </View>

          {/* ── 5. MAIN AUTHENTICATION CARD ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to Quizzo!</Text>
            <Text style={styles.cardSubtitle}>
              Save your progress, earn XP and climb the leaderboard.
            </Text>

            {/* ── 6. PRIMARY GOOGLE AUTHENTICATION CTA ── */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                isGoogleLoading && styles.buttonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleGoogleSignInPress}
              disabled={isGoogleLoading || isGuestLoading}>
              {isGoogleLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.googleBtnInner}>
                  <View style={styles.googleIconCircle}>
                    <GoogleIcon size={22} style={styles.googleIconNoMargin} />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                  <View style={styles.googleChevronContainer}>
                    <View style={styles.googleChevron} />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── 7 & 8. GUEST MODE ── */}
            <TouchableOpacity
              style={[
                styles.guestButton,
                isGuestLoading && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleGuestPress}
              disabled={isGoogleLoading || isGuestLoading}>
              {isGuestLoading ? (
                <ActivityIndicator color="#3B82F6" size="small" />
              ) : (
                <View style={styles.guestBtnInner}>
                  <View style={styles.guestIconCircle}>
                    <Text style={styles.guestIcon}>🎮</Text>
                  </View>
                  <Text style={styles.guestBtnText}>Continue as Guest</Text>
                  <View style={styles.guestChevronContainer}>
                    <View style={styles.guestChevron} />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.guestSubtext}>
              You can create an account later to save your progress.
            </Text>
          </View>

          {/* ── 9. TRUST & PRIVACY FOOTER ── */}
          <View style={styles.footerSection}>
            <Text style={styles.trustText}>
              🔒 Your progress and XP are synced securely.
            </Text>
            <View style={styles.legalRow}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
              <Text style={styles.legalDot}>·</Text>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  // ── 2. QUIZZO SIGNATURE BLUE BACKGROUND ──
  container: {
    flex: 1,
    backgroundColor: '#407CF4',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  // Low-contrast background floating shapes
  bgDecorations: {
    ...StyleSheet.absoluteFillObject,
  },
  bgSymbol: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.12)',
    fontWeight: 'bold',
  },
  symbolTopLeft: {
    top: 40,
    left: 28,
    fontSize: 22,
  },
  symbolTopRight: {
    top: 48,
    right: 32,
    fontSize: 24,
  },
  symbolMidLeft: {
    top: '38%',
    left: 20,
    fontSize: 28,
  },
  symbolMidRight: {
    top: '36%',
    right: 22,
    fontSize: 24,
  },
  symbolBottomLeft: {
    bottom: 70,
    left: 36,
    fontSize: 22,
  },
  symbolBottomRight: {
    bottom: 64,
    right: 32,
    fontSize: 26,
  },

  // ── 3. BRANDING & MASCOT ──
  brandingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mascotWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 51,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  taglineMain: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  taglineSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // ── 5. MAIN AUTH CARD ──
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#253858',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },

  // ── 6. GOOGLE CTA ──
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  googleBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  googleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconNoMargin: {
    marginRight: 0,
  },
  googleBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  googleChevronContainer: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleChevron: {
    width: 9,
    height: 9,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{rotate: '45deg'}],
    borderRadius: 1.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // ── 7. GUEST CTA ──
  guestButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  guestBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  guestIconCircle: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestIcon: {
    fontSize: 22,
  },
  guestBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0A2540',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  guestChevronContainer: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestChevron: {
    width: 9,
    height: 9,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#0A2540',
    transform: [{rotate: '45deg'}],
    borderRadius: 1.5,
  },
  guestSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  // ── 9. FOOTER ──
  footerSection: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 8,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  legalDot: {
    marginHorizontal: 6,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
