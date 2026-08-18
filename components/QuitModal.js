import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Button3D from './Button3D';

const QuitModal = ({visible, onCancel, onConfirm}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.emoji}>🥺</Text>
          <Text style={styles.title}>Leave Quiz?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to quit? Your score and current progress will
            be lost!
          </Text>

          <View style={styles.actions}>
            <Button3D
              title="Keep Playing! 🎯"
              onPress={onCancel}
              color="#10B981"
              shadowColor="#059669"
              size="medium"
              style={styles.keepBtn}
            />

            <TouchableOpacity onPress={onConfirm} style={styles.quitBtn}>
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
  overlay: {
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  keepBtn: {
    width: '100%',
    marginBottom: 14,
  },
  quitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  quitText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
  },
});
