// src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Surface,
  Button,
  Avatar,
  Divider,
  IconButton,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { COLORS } from '../constants';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rider, loading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
            } catch (e) {
              // Error handled by Redux
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'motorcycle':
        return 'bike';
      case 'bicycle':
        return 'bike';
      case 'car':
        return 'car';
      case 'van':
        return 'truck';
      default:
        return 'bike';
    }
  };

  if (!rider) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              My Profile
            </Text>
          </View>
        </Surface>

        {/* Profile Card */}
        <Card style={styles.profileCard} mode="elevated">
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={100} 
              label={rider.name?.charAt(0) || 'R'} 
              style={styles.profileAvatar}
            />
            <Text variant="headlineMedium" style={styles.profileName}>
              {rider.name}
            </Text>
            <Text variant="bodyLarge" style={styles.profilePhone}>
              {rider.phone_number}
            </Text>
            <Chip
              icon="check-circle"
              style={styles.statusChip}
              textStyle={styles.statusChipText}
            >
              Active Rider
            </Chip>
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Personal Information
            </Text>
            
            <View style={styles.infoRow}>
              <IconButton icon="account" size={20} iconColor={COLORS.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Name
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.name}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <IconButton icon="phone" size={20} iconColor={COLORS.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Phone
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.phone_number}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <IconButton icon="card-account-details" size={20} iconColor={COLORS.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  CNIC
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.cnic}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <IconButton icon="map-marker" size={20} iconColor={COLORS.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Address
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.address}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Vehicle Information
            </Text>
            
            <View style={styles.infoRow}>
              <IconButton 
                icon={getVehicleIcon(rider.vehicle_type)} 
                size={20} 
                iconColor={COLORS.TEXT_SECONDARY} 
              />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Type
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.vehicle_type}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <IconButton icon="car" size={20} iconColor={COLORS.TEXT_SECONDARY} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Registration
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.vehicle_registration_number}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Associated Restaurant */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Associated Restaurant
            </Text>
            
            {rider.restaurant ? (
              <>
                <View style={styles.infoRow}>
                  <IconButton icon="store" size={20} iconColor={COLORS.TEXT_SECONDARY} />
                  <View style={styles.infoContent}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Name
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {rider.restaurant.name}
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.infoRow}>
                  <IconButton icon="phone" size={20} iconColor={COLORS.TEXT_SECONDARY} />
                  <View style={styles.infoContent}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Phone
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {rider.restaurant.phone_number}
                    </Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.infoRow}>
                  <IconButton icon="map-marker-radius" size={20} iconColor={COLORS.TEXT_SECONDARY} />
                  <View style={styles.infoContent}>
                    <Text variant="bodySmall" style={styles.infoLabel}>
                      Delivery Radius
                    </Text>
                    <Text variant="bodyMedium" style={styles.infoValue}>
                      {rider.restaurant.delivery_radius} km
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text variant="bodyMedium" style={styles.noRestaurantText}>
                No associated restaurant found.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Card style={styles.logoutCard} mode="elevated">
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
              style={styles.logoutButton}
              contentStyle={styles.logoutButtonContent}
              labelStyle={styles.logoutButtonLabel}
              icon="logout"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardContainer: {
    flex: 1,
  },
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.WHITE,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileAvatar: {
    backgroundColor: COLORS.PRIMARY_RED,
    marginBottom: 20,
  },
  profileName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  profilePhone: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusChip: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 20,
  },
  statusChipText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.TEXT_PRIMARY,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  noRestaurantText: {
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  logoutCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
    paddingBottom: 20,
  },
});

export default ProfileScreen;