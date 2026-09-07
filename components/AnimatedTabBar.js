import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const AnimatedTabBar = ({state, descriptors, navigation}) => {
  const insets = useSafeAreaInsets();
  const [tabBarWidth, setTabBarWidth] = useState(width);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const tabCount = state.routes.length;
  const tabWidth = tabBarWidth / tabCount;
  const bottomInset = insets.bottom > 0 ? insets.bottom : 10;
  const barHeight = 70 + (insets.bottom > 0 ? insets.bottom : 0);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      bounciness: 10,
      speed: 12,
    }).start();
  }, [state.index, tabWidth, slideAnim]);

  return (
    <View 
      style={[
        styles.container,
        {
          paddingBottom: bottomInset,
          height: barHeight,
        },
      ]}
      onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding Pill Background */}
      <Animated.View
        style={[
          styles.slidingPillContainer,
          {
            width: tabWidth,
            transform: [{translateX: slideAnim}],
          },
        ]}>
        <View style={styles.pill} />
      </Animated.View>

      {/* Tab Items */}
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.8}>
            <View style={styles.contentContainer}>
              {/* Render Icon from options */}
              {options.tabBarIcon && options.tabBarIcon({focused: isFocused, size: 22})}
              
              {/* Render Label from options */}
              {options.tabBarLabel && (
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {options.tabBarLabel}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AnimatedTabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 25, // safe area padding for modern devices
    paddingTop: 10,
    height: 90,
  },
  slidingPillContainer: {
    position: 'absolute',
    top: 5, 
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  pill: {
    width: '80%', // pill doesn't stretch full tab width
    height: '100%',
    backgroundColor: '#4F7DF3',
    borderRadius: 24,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: '#7A8B99',
    marginTop: 4,
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
});
