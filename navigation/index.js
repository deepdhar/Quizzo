import React, {useState, useEffect} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Home from '../screens/Home';
import Quiz from '../screens/Quiz';
import Result from '../screens/Result';
import SelectQuiz from '../screens/SelectQuiz';
import Leaderboard from '../screens/Leaderboard';
import Login from '../screens/Login';
import Profile from '../screens/Profile';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import AnimatedTabBar from '../components/AnimatedTabBar';
import {checkHasOnboarded, getUserProfile} from '../utils/leaderboardService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const navigationRef = React.createRef();

export const resetRoot = routeName => {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{name: routeName}],
    });
  }
};

const DEFAULT_PROFILE_ICON = '😎';

const ProfileTabIcon = ({size}) => {
  const [avatar, setAvatar] = useState(DEFAULT_PROFILE_ICON);

  useEffect(() => {
    let isMounted = true;
    getUserProfile().then(profile => {
      if (isMounted && profile?.avatar) {
        setAvatar(profile.avatar);
      }
    });

    const sub = DeviceEventEmitter.addListener(
      'USER_PROFILE_UPDATED',
      newAvatar => {
        if (isMounted) {
          setAvatar(newAvatar || DEFAULT_PROFILE_ICON);
        }
      },
    );

    return () => {
      isMounted = false;
      sub.remove();
    };
  }, []);

  return (
    <Text style={{fontSize: size, opacity: 1, color: '#000'}}>
      {avatar || DEFAULT_PROFILE_ICON}
    </Text>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused, size}) => (
            <Text style={{fontSize: size, opacity: 1, color: '#000'}}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="SelectQuiz"
        component={SelectQuiz}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: ({focused, size}) => (
            <Text style={{fontSize: size, opacity: 1, color: '#000'}}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          tabBarLabel: 'Rank',
          tabBarIcon: ({focused, size}) => (
            <Text style={{fontSize: size, opacity: 1, color: '#000'}}>🏆</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused, size}) => <ProfileTabIcon size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyStack = () => {
  const [isOnboarded, setIsOnboarded] = useState(null);

  useEffect(() => {
    checkHasOnboarded().then(result => {
      setIsOnboarded(result);
    });
  }, []);

  if (isOnboarded === null) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isOnboarded ? 'MainTabs' : 'Login'}
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}>
        <Stack.Screen
          options={{headerShown: false}}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="MainTabs"
          component={MainTabs}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Quiz"
          component={Quiz}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="Result"
          component={Result}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#06173B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
