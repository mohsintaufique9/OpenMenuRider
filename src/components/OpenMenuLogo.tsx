// src/components/OpenMenuLogo.tsx
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../constants';

interface OpenMenuLogoProps {
  size?: number;
  showText?: boolean;
}

const OpenMenuLogo: React.FC<OpenMenuLogoProps> = ({ 
  size = 100, 
  showText = true 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Use the actual app icon */}
      <Image 
        source={require('../../assets/logo-oval.png')}
        style={[styles.logoImage, { width: size * 0.8, height: size * 0.8 }]}
        resizeMode="contain"
      />
      
      {/* Optional text below logo */}
      {showText && (
        <Text style={[styles.logoText, { fontSize: size * 0.15 }]}>
          OpenMenu.pk
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    marginBottom: 8,
  },
  logoText: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default OpenMenuLogo;