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
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { COLORS } from '../constants';
import StatusChip from '../components/StatusChip';

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
            <StatusChip
              status="active_rider"
              compact={false}
              style={styles.statusChip}
            />
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Personal Information
            </Text>
            
            <View style={styles.infoRow}>
              <IconButton icon="account" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
              <IconButton icon="phone" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
              <IconButton icon="card-account-details" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
              <IconButton icon="map-marker" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Vehicle Information
            </Text>
            
            <View style={styles.infoRow}>
              <IconButton 
                icon={getVehicleIcon(rider.vehicle_type)} 
                size={18} 
                iconColor={COLORS.TEXT_SECONDARY}
                style={styles.infoIcon}
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
              <IconButton icon="car" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Registration
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {rider.vehicle_registration_number?.toUpperCase() || ''}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Associated Restaurant */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Associated Restaurant
            </Text>
            
            {rider.restaurant ? (
              <>
                <View style={styles.infoRow}>
                  <IconButton icon="store" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
                  <IconButton icon="phone" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
                  <IconButton icon="map-marker-radius" size={18} iconColor={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
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
          <Card.Content style={styles.cardContent}>
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
    paddingVertical: 10,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 12,
    marginBottom: 8,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  profileAvatar: {
    backgroundColor: COLORS.PRIMARY_RED,
    marginBottom: 12,
  },
  profileName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  profilePhone: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 10,
    textAlign: 'center',
  },
  statusChip: {
    alignSelf: 'center',
    marginTop: 4,
  },
  sectionCard: {
    margin: 12,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  infoIcon: {
    margin: 0,
    width: 36,
    height: 36,
  },
  infoContent: {
    flex: 1,
    marginLeft: 4,
  },
  infoLabel: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 4,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  noRestaurantText: {
    color: COLORS.TEXT_LIGHT,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  logoutCard: {
    margin: 12,
    marginTop: 8,
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
    height: 60,
    paddingBottom: 12,
  },
});

export default ProfileScreen;