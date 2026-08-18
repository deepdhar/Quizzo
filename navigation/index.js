import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Home from '../screens/Home';
import Quiz from '../screens/Quiz';
import Result from '../screens/Result';
import SelectQuiz from '../screens/SelectQuiz';
import Leaderboard from '../screens/Leaderboard';
import Login from '../screens/Login';
import {checkHasOnboarded} from '../utils/leaderboardService';

const Stack = createStackNavigator();

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
        initialRouteName={isOnboarded ? 'Home' : 'Login'}
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
          name="Home"
          component={Home}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="SelectQuiz"
          component={SelectQuiz}
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
        <Stack.Screen
          options={{headerShown: false}}
          name="Leaderboard"
          component={Leaderboard}
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
