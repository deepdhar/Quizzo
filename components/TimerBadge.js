import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, Animated} from 'react-native';

const TimerBadge = ({timeLeft}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 4 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

  // Determine color based on time left
  let badgeBg = 'rgba(99, 193, 116, 0.15)';
  let badgeBorder = '#63C174';
  let textColor = '#63C174';

  if (timeLeft <= 4) {
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeBorder = '#EF4444';
    textColor = '#EF4444';
  } else if (timeLeft <= 7) {
    badgeBg = 'rgba(255, 200, 87, 0.15)';
    badgeBorder = '#FFC857';
    textColor = '#E6AC00';
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
