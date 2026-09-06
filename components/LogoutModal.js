import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const LogoutModal = ({visible, onCancel, onConfirm}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Friendly Quizzo Mascot Illustration */}
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/logout_mascot.jpg')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Log out?</Text>

          {/* Friendly Supporting Message */}
          <Text style={styles.subtitle}>
            You can always come back and continue your Quizzo journey.
          </Text>

          {/* Actions Hierarchy */}
          <View style={styles.actions}>
            {/* Primary Action: Stay on Quizzo */}
            <TouchableOpacity
              style={styles.stayBtn}
              activeOpacity={0.85}
              onPress={onCancel}>
              <Text style={styles.stayBtnText}>Stay on Quizzo</Text>
            </TouchableOpacity>

            {/* Secondary Action: Log Out */}
            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 16, right: 16}}
              onPress={onConfirm}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  // Soft dark navy translucent scrim rather than pitch black
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Deep navy #17243D container with generous padding & rounded corners
  modalCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#17243D',
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },

  illustrationWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },

  title: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },

  actions: {
    width: '100%',
    alignItems: 'center',
  },

  // Primary Blue CTA (#407CF4)
  stayBtn: {
    width: '100%',
    backgroundColor: '#407CF4',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#407CF4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  stayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Secondary Restrained Red Text Link (#FF5C67)
  logoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#FF5C67',
    fontSize: 14,
    fontWeight: '700',
  },
});
