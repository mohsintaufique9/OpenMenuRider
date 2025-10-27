// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Surface,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/slices/authSlice';
import { COLORS } from '../constants';
import OpenMenuLogo from '../components/OpenMenuLogo';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your phone number and password');
      return;
    }

    try {
      await dispatch(login({ phone: phone.trim(), password })).unwrap();
    } catch (error) {
      // Error is handled by Redux and shown in snackbar
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) {
      dispatch(clearError());
    }
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Single Card Design */}
        <Card style={styles.loginCard} elevation={8}>
          <Card.Content style={styles.cardContent}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <OpenMenuLogo size={100} />
              <Text variant="headlineMedium" style={styles.title}>
                Rider Login
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                OpenMenu.pk Delivery Partner
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={handlePhoneChange}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
                error={!!error}
                disabled={loading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  />
                }
                error={!!error}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={loading}
                style={[styles.loginButton, loading && styles.loginButtonLoading]}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonLabel}
                icon={loading ? undefined : "login"}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Signing In</Text>
                  </View>
                ) : (
                  'Sign In'
                )}
              </Button>

              <Button
                mode="text"
                onPress={() => Alert.alert('Forgot Password', 'Contact your administrator')}
                style={styles.forgotButton}
                labelStyle={styles.forgotButtonLabel}
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={dismissSnackbar}
        duration={4000}
        style={styles.snackbar}
        action={{
          label: 'Dismiss',
          onPress: dismissSnackbar,
        }}
      >
        {error || 'Login failed'}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardContent: {
    padding: 28,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    fontSize: 28,
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '400',
  },
  form: {
    gap: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY_RED,
    shadowColor: COLORS.PRIMARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 56,
    justifyContent: 'center',
  },
  loginButtonLoading: {
    backgroundColor: COLORS.PRIMARY_RED,
    opacity: 0.9,
    shadowOpacity: 0.1,
  },
  loginButtonContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  loginButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 24,
  },
  loadingText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  forgotButton: {
    marginTop: 20,
  },
  forgotButtonLabel: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
  snackbar: {
    backgroundColor: COLORS.PRIMARY_RED,
  },
});

export default LoginScreen;