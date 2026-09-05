import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const QuitModal = ({visible, onCancel, onConfirm}) => {
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
              source={require('../assets/leave_quiz_mascot.jpg')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Leave Quiz?</Text>

          {/* Friendly Supporting Message */}
          <Text style={styles.subtitle}>
            Your current progress will be lost if you leave.
          </Text>

          {/* Actions Hierarchy */}
          <View style={styles.actions}>
            {/* Primary Action: Keep Playing */}
            <TouchableOpacity
              style={styles.keepBtn}
              activeOpacity={0.85}
              onPress={onCancel}>
              <Text style={styles.keepBtnText}>Keep Playing →</Text>
            </TouchableOpacity>

            {/* Secondary Action: Quit Quiz */}
            <TouchableOpacity
              style={styles.quitBtn}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 16, right: 16}}
              onPress={onConfirm}>
              <Text style={styles.quitText}>Quit Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuitModal;

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
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
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
  keepBtn: {
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
  keepBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Secondary Restrained Red Text Link (#FF5C67)
  quitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  quitText: {
    color: '#FF5C67',
    fontSize: 14,
    fontWeight: '700',
  },
});
