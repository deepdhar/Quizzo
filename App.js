import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar} from 'react-native';

import MyStack from './navigation';

const App = () => {
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