import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Home from './screens/Home';
import Quiz from './screens/Quiz';
import Result from './screens/Result';

import MyStack from './navigation';

const App = () => {
    return (
        <MyStack/>
    );
}

export default App;

const styles = StyleSheet.create({
    container: {
        paddingStart: 10,
        paddingTop: 10
    }
})