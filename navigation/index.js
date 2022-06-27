import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native';
import Home from "../screens/Home";
import Quiz from "../screens/Quiz";
import Result from "../screens/Result";
import SelectQuiz from '../screens/SelectQuiz';

const Stack = createStackNavigator();

const MyStack = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                }}
            >
                <Stack.Screen options={{headerShown: false}} name="Home" component={Home}/>
                <Stack.Screen options={{headerShown: false}} name="SelectQuiz" component={SelectQuiz}/>
                <Stack.Screen options={{headerShown: false}} name="Quiz" component={Quiz}/>
                <Stack.Screen options={{headerShown: false}} name="Result" component={Result}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default MyStack;