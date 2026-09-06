import React, {useEffect, useRef} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

const ProfileUpdatedModal = ({visible, onDismiss}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Celebrating Mascot Illustration */}
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../assets/profile_success_mascot.jpg')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Profile Updated! 🎉</Text>

          {/* Friendly Supporting Message */}
          <Text style={styles.subtitle}>Your Quizzo profile is all set!</Text>

          {/* Primary CTA: CONTINUE → */}
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={onDismiss}>
            <Text style={styles.continueBtnText}>CONTINUE →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ProfileUpdatedModal;

const styles = StyleSheet.create({
  // Soft dark navy translucent scrim
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Deep navy #17243D container with 26px rounded corners & soft shadow
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
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },

  illustrationWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 200, 61, 0.25)',
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
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 12,
  },

  // Primary Blue CTA (#407CF4)
  continueBtn: {
    width: '100%',
    backgroundColor: '#407CF4',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#407CF4',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
