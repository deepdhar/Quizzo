import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, Animated} from 'react-native';

const TimerBadge = ({timeLeft, totalTime = 20}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft, pulseAnim]);

  // Determine color thresholds:
  // Hard (10s): <=3s red, <=6s amber, >6s green
  // Medium (20s): <=5s red, <=10s amber, >10s green
  const redThreshold = totalTime <= 10 ? 3 : 5;
  const amberThreshold = totalTime <= 10 ? 6 : 10;

  let badgeBg = '#EDFDF2';
  let badgeBorder = '#35C878';
  let textColor = '#2E7D32';

  if (timeLeft <= redThreshold) {
    badgeBg = '#FFF1F3';
    badgeBorder = '#FF4D6D';
    textColor = '#E11D48';
  } else if (timeLeft <= amberThreshold) {
    badgeBg = '#FFF7ED';
    badgeBorder = '#FF8A4C';
    textColor = '#C25E00';
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
          transform: [{scale: pulseAnim}],
        },
      ]}>
      <Text style={styles.icon}>⏱️</Text>
      <Text style={[styles.text, {color: textColor}]}>{timeLeft}s</Text>
    </Animated.View>
  );
};

export default TimerBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.2,
    elevation: 0,
    shadowOpacity: 0,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
});
