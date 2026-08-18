import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Title = ({titleText = 'Quizzo', subtitle = ''}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.sparkle}>✨</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export default Title;

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    fontSize: 22,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#38BDF8',
    fontFamily: 'Pacifico_Regular',
    textShadowColor: 'rgba(56, 189, 248, 0.4)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 1,
  },
});
