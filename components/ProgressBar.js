import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Animated} from 'react-native';

const ProgressBar = ({
  current,
  total,
  color = '#35C878', // Quizzo Success Green
  trackColor = '#E2E8F0',
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progressPercent,
      useNativeDriver: false,
      bounciness: 2,
      speed: 10,
    }).start();
  }, [progressPercent, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>
          QUESTION {current} OF {total}
        </Text>
        <Text style={styles.percentText}>{Math.round(progressPercent)}%</Text>
      </View>
      <View style={[styles.track, {backgroundColor: trackColor}]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthInterpolation,
            },
          ]}>
          {/* Subtle gloss highlight line */}
          <View style={styles.gloss} />
        </Animated.View>
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  percentText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    position: 'relative',
  },
  gloss: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 4,
  },
});
