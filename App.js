import React, {useEffect} from 'react';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import MyStack from './navigation';

const App = () => {
  useEffect(() => {
    if (SplashScreen && SplashScreen.hide) {
      SplashScreen.hide();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4F7DF3" barStyle="light-content" />
      <MyStack />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F7DF3',
  },
});
