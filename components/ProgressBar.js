import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Animated} from 'react-native';

const ProgressBar = ({
  current,
  total,
  color = '#10B981',
  trackColor = '#1E293B',
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: progressPercent,
      useNativeDriver: false,
      bounciness: 4,
      speed: 12,
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
          {/* Gloss highlight line */}
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
    marginVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 1,
  },
  percentText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Ubuntu-Medium',
  },
  track: {
    height: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fill: {
    height: '100%',
    borderRadius: 10,
    position: 'relative',
  },
  gloss: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
  },
});
