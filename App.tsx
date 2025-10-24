// App.tsx
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PaperProvider, configureFonts, DefaultTheme } from 'react-native-paper';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { COLORS } from './src/constants';
import { loadStoredAuth } from './src/store/slices/authSlice';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '100' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '100' as const,
    },
  },
};

const theme = {
  ...DefaultTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    primary: COLORS.PRIMARY_RED,
    secondary: COLORS.PRIMARY_YELLOW,
    surface: COLORS.WHITE,
    background: COLORS.BACKGROUND,
    error: COLORS.PRIMARY_RED,
    onPrimary: COLORS.WHITE,
    onSecondary: COLORS.BLACK,
    onSurface: COLORS.TEXT_PRIMARY,
    onBackground: COLORS.TEXT_PRIMARY,
  },
};

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load fonts
    const loadFonts = async () => {
      await Font.loadAsync({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
      });
      setFontsLoaded(true);
    };

    loadFonts();
    
    // Load stored authentication data on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" backgroundColor={COLORS.WHITE} />
      <AppNavigator />
      <Toast />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}