// src/components/LoadingScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import OpenMenuLogo from './OpenMenuLogo';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <OpenMenuLogo size={120} />
        <Text style={styles.appName}>OpenMenu Rider</Text>
        <Text style={styles.subtitle}>Delivery Partner</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 40,
    fontFamily: 'System',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'System',
  },
});

export default LoadingScreen;
