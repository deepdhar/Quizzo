import React, {Component} from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import MyStack from './navigation';

function hideSplash() {
    SplashScreen.hide()
}

const App = () => {
    hideSplash();
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor = "#06173B"
            />
            <MyStack/>
        </SafeAreaView>
    );
}

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#06173B'
    }
})