import React from 'react';
import {Image, StyleSheet} from 'react-native';

// Official high-resolution Google "G" logo data URI
const GOOGLE_G_LOGO_URI =
  'https://developers.google.com/static/identity/images/g-logo.png';

const GoogleIcon = ({size = 22, style}) => {
  return (
    <Image
      source={{uri: GOOGLE_G_LOGO_URI}}
      style={[styles.icon, {width: size, height: size}, style]}
      resizeMode="contain"
    />
  );
};

export default GoogleIcon;

const styles = StyleSheet.create({
  icon: {
    marginRight: 10,
  },
});
