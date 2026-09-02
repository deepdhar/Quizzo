import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
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
import {checkHasOnboarded} from '../utils/leaderboardService';
import {Text} from 'react-native';
import AnimatedTabBar from '../components/AnimatedTabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
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
          tabBarIcon: ({focused, size}) => (
            <Text style={{fontSize: size, opacity: 1, color: '#000'}}>😎</Text>
          ),
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
    <NavigationContainer>
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
