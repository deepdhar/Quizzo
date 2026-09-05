import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {supabase, isSupabaseConfigured} from './supabaseClient';
import {
  getUserProfile,
  updateUserProfile,
  setOnboarded,
  clearOnboarded,
  resetUserProfile,
  syncPlayerToLeaderboard,
} from './leaderboardService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Optional: Web Client ID from Google Cloud Console / Firebase / Supabase Auth Provider
// If you have a Web Client ID, paste it here:
export const GOOGLE_WEB_CLIENT_ID =
  '31043432322-v71urlfqriohs5pgecfciddvdslreeii.apps.googleusercontent.com';

const AUTH_USER_KEY = 'QUIZZO_AUTH_USER';

export const configureGoogleSignIn = () => {
  try {
    const config = {
      scopes: ['profile', 'email'],
    };

    if (GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID.trim().length > 0) {
      config.webClientId = GOOGLE_WEB_CLIENT_ID.trim();
      config.offlineAccess = true;
    }

    GoogleSignin.configure(config);
  } catch (e) {
    // Configuration fallback
  }
};

// Initialize configuration immediately
configureGoogleSignIn();

/**
 * Performs real native Google Sign-In with Google Play Services
 * and authenticates the session with Supabase.
 */
export const signInWithGoogle = async () => {
  try {
    configureGoogleSignIn();

    // Check if Play Services is available
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Native Google Account Picker dialog
    const userInfo = await GoogleSignin.signIn();

    const googleUser = userInfo?.user || {};
    const displayName =
      googleUser.name ||
      googleUser.givenName ||
      googleUser.email?.split('@')[0] ||
      'Trivia Champ';

    // 1. If we have idToken and Supabase is configured, sync auth session to Supabase
    if (userInfo?.idToken && isSupabaseConfigured()) {
      try {
        await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
      } catch (authErr) {
        // Continue even if Supabase Auth is optional
      }
    }

    // 2. Save Google profile locally
    const currentProfile = await getUserProfile();
    const updatedProfile = {
      ...currentProfile,
      id: googleUser.id ? `google_${googleUser.id}` : currentProfile.id,
      name: displayName,
      email: googleUser.email || null,
      avatar: '👑', // Default crown for Google users
      photoUrl: googleUser.photo || null,
      authProvider: 'google',
    };

    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedProfile));
    await updateUserProfile(displayName, updatedProfile.avatar);
    await setOnboarded();

    // 3. Sync player profile to Supabase Leaderboard table
    await syncPlayerToLeaderboard();

    return {
      success: true,
      user: updatedProfile,
    };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {success: false, cancelled: true};
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {success: false, error: 'Sign in is already in progress'};
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error:
          'Google Play Services is not available or outdated on this device',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Google Sign-In failed. Please try again.',
      };
    }
  }
};

/**
 * Signs out from Google and Supabase.
 */
export const signOutUser = async () => {
  try {
    configureGoogleSignIn();
    try {
      await GoogleSignin.signOut();
    } catch (gErr) {
      // Ignored if not signed in with Google
    }
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (sErr) {
        // Ignored
      }
    }
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    await clearOnboarded();
    await resetUserProfile();
    return true;
  } catch (e) {
    await clearOnboarded();
    await resetUserProfile();
    return false;
  }
};
