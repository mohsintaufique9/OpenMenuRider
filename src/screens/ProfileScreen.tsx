// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
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
  TextInput,
  Button,
  Avatar,
  Divider,
  IconButton,
  Modal,
  Portal,
  ActivityIndicator,
  Snackbar,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout, updateProfile, clearError } from '../store/slices/authSlice';
import { COLORS } from '../constants';
import { Rider } from '../types';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rider, loading, error } = useSelector((state: RootState) => state.auth);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(rider?.name || '');
  const [editedAddress, setEditedAddress] = useState(rider?.address || '');
  const [editedVehicleType, setEditedVehicleType] = useState(rider?.vehicle_type || '');
  const [editedVehicleReg, setEditedVehicleReg] = useState(rider?.vehicle_registration_number || '');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (rider) {
      setEditedName(rider.name || '');
      setEditedAddress(rider.address || '');
      setEditedVehicleType(rider.vehicle_type || '');
      setEditedVehicleReg(rider.vehicle_registration_number || '');
    }
  }, [rider]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

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

  const handleUpdateProfile = async () => {
    if (!editedName.trim() || !editedAddress.trim() || !editedVehicleType.trim() || !editedVehicleReg.trim()) {
      Alert.alert('Error', 'Please fill in all profile fields');
      return;
    }

    try {
      await dispatch(updateProfile({
        name: editedName.trim(),
        address: editedAddress.trim(),
        vehicle_type: editedVehicleType.trim() as 'motorcycle' | 'bicycle' | 'car' | 'van',
        vehicle_registration_number: editedVehicleReg.trim(),
      })).unwrap();
      setEditModalVisible(false);
      setSnackbarVisible(true);
    } catch (e) {
      // Error handled by Redux
    }
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
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
            <IconButton
              icon="pencil"
              size={24}
              iconColor={COLORS.PRIMARY_RED}
              onPress={() => setEditModalVisible(true)}
            />
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

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Surface style={styles.modalSurface} elevation={4}>
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={styles.modalTitle}>
                  Edit Profile
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor={COLORS.TEXT_PRIMARY}
                  onPress={() => setEditModalVisible(false)}
                />
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <TextInput
                    label="Name"
                    value={editedName}
                    onChangeText={setEditedName}
                    mode="outlined"
                    style={styles.formInput}
                  />
                </View>

                <View style={styles.formGroup}>
                  <TextInput
                    label="Address"
                    value={editedAddress}
                    onChangeText={setEditedAddress}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.formInput}
                  />
                </View>

                <View style={styles.formGroup}>
                  <TextInput
                    label="Vehicle Type"
                    value={editedVehicleType}
                    onChangeText={setEditedVehicleType}
                    mode="outlined"
                    style={styles.formInput}
                    placeholder="e.g., motorcycle, car"
                  />
                </View>

                <View style={styles.formGroup}>
                  <TextInput
                    label="Vehicle Registration Number"
                    value={editedVehicleReg}
                    onChangeText={setEditedVehicleReg}
                    mode="outlined"
                    style={styles.formInput}
                    placeholder="e.g., ABC-123"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setEditModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleUpdateProfile}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </View>
              </ScrollView>
            </Surface>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          duration={4000}
          style={[styles.snackbar, { backgroundColor: error ? COLORS.PRIMARY_RED : COLORS.SUCCESS }]}
          action={{
            label: 'Dismiss',
            onPress: dismissSnackbar,
          }}
        >
          {error || 'Profile updated successfully!'}
        </Snackbar>
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalSurface: {
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  formGroup: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  formInput: {
    backgroundColor: COLORS.WHITE,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  snackbar: {
    backgroundColor: COLORS.SUCCESS,
  },
});

export default ProfileScreen;