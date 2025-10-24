// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { COLORS, SCREEN_NAMES } from '../constants';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === SCREEN_NAMES.DASHBOARD) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === SCREEN_NAMES.PROFILE) {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY_RED,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopWidth: 1,
          borderTopColor: COLORS.LIGHT_GRAY,
          elevation: 8,
          shadowColor: COLORS.BLACK,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: Platform.OS === 'ios' ? 34 : 8, // Safe area padding for iOS
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 90 : 60, // Increased height for iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name={SCREEN_NAMES.DASHBOARD} 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, initialLoading } = useSelector((state: RootState) => state.auth);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name={SCREEN_NAMES.ORDER_DETAILS} 
              component={OrderDetailsScreen}
              options={{
                headerShown: true,
                title: 'Order Details',
                headerStyle: {
                  backgroundColor: COLORS.WHITE,
                  elevation: 2,
                  shadowColor: COLORS.BLACK,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                headerTitleStyle: {
                  color: COLORS.TEXT_PRIMARY,
                  fontWeight: '700',
                  fontSize: 18,
                  fontFamily: 'System',
                },
                headerTintColor: COLORS.PRIMARY_RED,
                headerBackTitleVisible: true,
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default AppNavigator;