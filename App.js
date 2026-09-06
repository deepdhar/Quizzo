import React, {useEffect} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import MyStack from './navigation';

const App = () => {
  useEffect(() => {
    if (SplashScreen && SplashScreen.hide) {
      SplashScreen.hide();
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor="#F7F9FC" barStyle="dark-content" />
      <MyStack />
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
});
