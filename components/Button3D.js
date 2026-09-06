import React, {useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, Animated, View} from 'react-native';

const Button3D = ({
  title,
  onPress,
  color = '#FF8A4C', // Top surface color (CTA)
  shadowColor = '#E06A26', // Darker bevel shadow color
  textColor = '#FFFFFF',
  icon = null,
  style,
  textStyle,
  disabled = false,
  size = 'medium',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) {
      return;
    }
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) {
      return;
    }
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}>
      <View style={[styles.container, style]}>
        {/* 3D bottom bevel / shadow layer */}
        <View
          style={[
            styles.shadowLayer,
            {
              backgroundColor: disabled ? '#CBD5E1' : shadowColor,
              borderRadius: isSmall ? 12 : 18,
              bottom: 0,
            },
          ]}
        />

        {/* Animated top surface */}
        <Animated.View
          style={[
            styles.topLayer,
            {
              backgroundColor: disabled ? '#E2E8F0' : color,
              borderRadius: isSmall ? 12 : 18,
              paddingVertical: isSmall ? 10 : isLarge ? 18 : 14,
              paddingHorizontal: isSmall ? 14 : isLarge ? 24 : 20,
              transform: [{translateY}],
            },
          ]}>
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.title,
                {
                  color: disabled ? '#94A3B8' : textColor,
                  fontSize: isSmall ? 14 : isLarge ? 20 : 17,
                },
                textStyle,
              ]}>
              {title}
            </Text>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default Button3D;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 4,
  },
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    top: 4,
  },
  topLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
