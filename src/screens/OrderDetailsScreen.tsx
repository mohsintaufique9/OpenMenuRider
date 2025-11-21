// src/screens/OrderDetailsScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  Surface,
  Avatar,
  Button,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchOrderDetails, updateOrderStatus, confirmDelivery } from '../store/slices/orderSlice';
import { COLORS } from '../constants';
import StatusChip from '../components/StatusChip';
import { Order } from '../types';

const OrderDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: number };
  
  const { currentOrder, loading } = useSelector((state: RootState) => state.order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isReasonInputFocused, setIsReasonInputFocused] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeDigits, setPasscodeDigits] = useState<string[]>(['', '', '', '']);
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const paymentMethod = currentOrder?.payment_details?.method;
  const transactionId = currentOrder?.payment_details
    ? (currentOrder.payment_details as Record<string, any>)?.transaction_id
    : undefined;

  const defaultCancelReasons = [
    'Wrong address provided',
    'Customer refused to pay',
    'Customer phone unreachable',
    'Other'
  ];

  const passcodeInputRefs = useRef<Array<TextInput | null>>([]);
  const deliveryPasscode = passcodeDigits.join('');

  const handlePasscodeInput = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const updatedDigits = [...passcodeDigits];

    if (numericValue.length === 0) {
      updatedDigits[index] = '';
      setPasscodeDigits(updatedDigits);
      return;
    }

    updatedDigits[index] = numericValue.charAt(numericValue.length - 1);
    setPasscodeDigits(updatedDigits);

    if (index < passcodeDigits.length - 1) {
      passcodeInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasscodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const updatedDigits = [...passcodeDigits];

      if (updatedDigits[index]) {
        updatedDigits[index] = '';
        setPasscodeDigits(updatedDigits);
        return;
      }

      if (index > 0) {
        updatedDigits[index - 1] = '';
        setPasscodeDigits(updatedDigits);
        passcodeInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const resetPasscodeInputs = () => {
    setPasscodeDigits(['', '', '', '']);
    setPasscodeError('');
  };

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  const handleRefresh = async () => {
    if (!orderId) return;
    
    setRefreshing(true);
    try {
      await dispatch(fetchOrderDetails(orderId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh order details');
    } finally {
      setRefreshing(false);
    }
  };

  const focusFirstPasscodeInput = () => {
    setTimeout(() => {
      passcodeInputRefs.current[0]?.focus();
    }, 50);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!currentOrder) return;
    
    // If marking as delivered, show passcode modal
    if (newStatus === 'delivered') {
      resetPasscodeInputs();
      setIsVerifyingPasscode(false);
      setShowPasscodeModal(true);
      focusFirstPasscodeInput();
      return;
    }
    
    const statusMessages = {
      'on_the_way': 'Are you ready to start delivery?',
    };
    
    const message = statusMessages[newStatus as keyof typeof statusMessages] || 'Update order status?';
    
    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await dispatch(updateOrderStatus({ 
                orderId: currentOrder.id, 
                status: newStatus 
              })).unwrap();
              
              // Show success message - order status is already updated optimistically in Redux
              Alert.alert('Success', 'Order status updated successfully');
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to update order status');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleConfirmDeliveryWithPasscode = async () => {
    if (!currentOrder) return;
    
    if (!deliveryPasscode || deliveryPasscode.length !== 4) {
      setPasscodeError('Please enter a valid 4-digit passcode');
      return;
    }

    setPasscodeError('');
    setIsVerifyingPasscode(true);
    try {
      await dispatch(updateOrderStatus({ 
        orderId: currentOrder.id, 
        status: 'delivered',
        deliveryPasscode: deliveryPasscode
      })).unwrap();

      setShowPasscodeModal(false);
      resetPasscodeInputs();
      setIsVerifyingPasscode(false);
      
      // Show success message - order status is already updated optimistically in Redux
      Alert.alert('Success', 'Order delivered successfully!');
    } catch (error: any) {
      setPasscodeError(error || 'Failed to confirm delivery. Please verify the passcode with the customer.');
      setIsVerifyingPasscode(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!currentOrder) return;
    
    resetPasscodeInputs();
    setIsVerifyingPasscode(false);
    setShowPasscodeModal(true);
    focusFirstPasscodeInput();
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = async () => {
    if (!currentOrder) return;
    
    const finalReason = selectedReason === 'Other' ? cancelReason : selectedReason;
    
    if (!finalReason.trim()) {
      Alert.alert('Error', 'Please provide a cancellation reason');
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateOrderStatus({ 
        orderId: currentOrder.id, 
        status: 'cancelled',
        reason: finalReason.trim(),
      })).unwrap();
      
      // Close modal and reset form
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedReason('');
      setIsReasonInputFocused(false);
      
      // Show success message - order status is already updated optimistically in Redux
      Alert.alert('Success', 'Order cancelled successfully');
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to cancel order';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCallCustomer = () => {
    if (currentOrder?.delivery_details?.phone) {
      Linking.openURL(`tel:${currentOrder.delivery_details.phone}`);
    }
  };

  const handleCallRestaurant = () => {
    if (currentOrder?.restaurant?.phone) {
      Linking.openURL(`tel:${currentOrder.restaurant.phone}`);
    }
  };

  const handleNavigateToRestaurant = () => {
    if (currentOrder?.restaurant?.address) {
      const address = encodeURIComponent(currentOrder.restaurant.address);
      Linking.openURL(`https://maps.google.com/maps?q=${address}`);
    }
  };

  const handleNavigateToCustomer = () => {
    if (currentOrder?.delivery_details?.address) {
      const address = encodeURIComponent(currentOrder.delivery_details.address);
      Linking.openURL(`https://maps.google.com/maps?q=${address}`);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateItemTotal = (item: any) => {
    return (parseFloat(item.total_price || item.price * item.quantity)).toFixed(2);
  };

  const getItemName = (item: any) => {
    return item.name || item.menu_item?.name || 'Unknown Item';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.TEXT_SECONDARY} />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Order Not Found
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            We couldn't find the order you're looking for.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Main Order Card - Single Card Design */}
        <Card style={styles.mainCard} mode="elevated" elevation={3}>
          <Card.Content style={styles.mainCardContent}>
            
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderNumberSection}>
                <Text variant="headlineMedium" style={styles.orderNumber}>
                  #{currentOrder.order_number}
                </Text>
                <Text variant="bodyMedium" style={styles.orderDate}>
                  {formatDate(currentOrder.created_at)}
                </Text>
              </View>
              
              <StatusChip status={currentOrder.status} />
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Restaurant Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="storefront-outline" size={20} color={COLORS.PRIMARY_RED} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Restaurant
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={handleCallRestaurant}
                    disabled={!currentOrder.restaurant?.phone}
                  >
                    <Ionicons name="call-outline" size={16} color={COLORS.PRIMARY_RED} />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={handleNavigateToRestaurant}
                    disabled={!currentOrder.restaurant?.address}
                  >
                    <Ionicons name="navigate-outline" size={16} color={COLORS.PRIMARY_RED} />
                    <Text style={styles.actionButtonText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text variant="bodyLarge" style={styles.restaurantName}>
                {currentOrder.restaurant?.name || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.restaurantAddress}>
                {currentOrder.restaurant?.address || 'Address not available'}
              </Text>
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Customer Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.SUCCESS} />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Customer
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={handleCallCustomer}
                    disabled={!currentOrder.delivery_details?.phone}
                  >
                    <Ionicons name="call-outline" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={handleNavigateToCustomer}
                    disabled={!currentOrder.delivery_details?.address}
                  >
                    <Ionicons name="navigate-outline" size={16} color={COLORS.SUCCESS} />
                    <Text style={styles.actionButtonText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text variant="bodyLarge" style={styles.customerName}>
                {currentOrder.delivery_details?.name || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.customerPhone}>
                {currentOrder.delivery_details?.phone || 'N/A'}
              </Text>
              <Text variant="bodyMedium" style={styles.deliveryAddress}>
                {currentOrder.delivery_details?.address || 'Address not available'}
              </Text>
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Order Items Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="list-outline" size={20} color={COLORS.PRIMARY_RED} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Order Items ({currentOrder.items?.length || 0})
                </Text>
              </View>
              
              {currentOrder.items?.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="bodyLarge" style={styles.itemName}>
                      {getItemName(item)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </Text>
                    {item.special_instructions && (
                      <Text variant="bodySmall" style={styles.specialInstructions}>
                        Note: {item.special_instructions}
                      </Text>
                    )}
                  </View>
                  <Text variant="titleMedium" style={styles.itemPrice}>
                    Rs. {calculateItemTotal(item)}
                  </Text>
                </View>
              ))}
            </View>

            <Divider style={styles.sectionDivider} />

            {/* Payment & Summary Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="card-outline" size={20} color={COLORS.PRIMARY_YELLOW} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Payment & Summary
                </Text>
              </View>
              
              <View style={styles.paymentInfo}>
                <Text variant="bodyMedium" style={styles.paymentMethod}>
                  Payment: {paymentMethod || 'Cash on Delivery'}
                </Text>
                {paymentMethod !== 'cash' && transactionId && (
                  <Text variant="bodySmall" style={styles.transactionId}>
                    Transaction ID: {transactionId}
                  </Text>
                )}
              </View>

              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge" style={styles.summaryLabel}>
                    Subtotal
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    Rs. {Number(currentOrder.subtotal || 0).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge" style={styles.summaryLabel}>
                    Delivery Fee
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    Rs. {Number(currentOrder.delivery_fee || 0).toFixed(2)}
                  </Text>
                </View>
                
                <Divider style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                  <Text variant="titleLarge" style={styles.totalLabel}>
                    Total
                  </Text>
                  <Text variant="titleLarge" style={styles.totalValue}>
                    Rs. {Number(currentOrder.total || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {currentOrder.status === 'ready' && (
            <View style={styles.rowActions}>
              <Button
                mode="contained"
                icon="bike"
                onPress={() => handleStatusChange('on_the_way')}
                style={[styles.primaryActionButton, styles.halfWidthButton]}
                labelStyle={styles.primaryActionLabel}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Start Delivery
              </Button>
              <Button
                mode="outlined"
                icon="close-circle"
                onPress={handleCancelOrder}
                style={[styles.cancelActionButton, styles.halfWidthButton]}
                labelStyle={styles.cancelActionLabel}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Cancel Order
              </Button>
            </View>
          )}
          
          {currentOrder.status === 'on_the_way' && (
            <View style={styles.rowActions}>
              <Button
                mode="contained"
                icon="check-circle"
                onPress={handleConfirmDelivery}
                style={[styles.successActionButton, styles.halfWidthButton]}
                labelStyle={styles.primaryActionLabel}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Confirm Delivered
              </Button>
              <Button
                mode="outlined"
                icon="close-circle"
                onPress={handleCancelOrder}
                style={[styles.cancelActionButton, styles.halfWidthButton]}
                labelStyle={styles.cancelActionLabel}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Cancel Order
              </Button>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Delivery Passcode Modal */}
      <Modal
        visible={showPasscodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPasscodeModal(false);
          resetPasscodeInputs();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Enter Delivery Passcode
              </Text>
              <IconButton
                icon="close"
                iconColor={COLORS.TEXT_SECONDARY}
                size={24}
                onPress={() => {
                  setShowPasscodeModal(false);
                  resetPasscodeInputs();
                }}
                disabled={isVerifyingPasscode}
                style={styles.modalCloseButton}
              />
            </View>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Please ask the customer for their 4-digit delivery passcode to confirm delivery:
            </Text>

            <View style={styles.passcodeContainer}>
              <View style={[
                styles.passcodeInputsWrapper,
                isVerifyingPasscode && styles.passcodeInputsDisabled
              ]}>
                {passcodeDigits.map((digit, index) => (
                  <TextInput
                    key={`passcode-${index}`}
                    ref={(ref) => {
                      passcodeInputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.passcodeBox,
                      digit ? styles.passcodeBoxFilled : undefined,
                      isVerifyingPasscode && styles.passcodeBoxDisabled,
                    ]}
                    value={digit}
                    onChangeText={(value) => handlePasscodeInput(value, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handlePasscodeKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    returnKeyType="done"
                    editable={!isVerifyingPasscode}
                  />
                ))}
              </View>
              <Text variant="bodySmall" style={styles.passcodeHint}>
                Enter the 4-digit code provided by the customer
              </Text>
              {isVerifyingPasscode && (
                <View style={styles.passcodeLoader}>
                  <ActivityIndicator size="small" color={COLORS.PRIMARY_RED} />
                  <Text style={styles.passcodeLoaderText}>Verifying passcode...</Text>
                </View>
              )}
              {passcodeError ? (
                <Text style={styles.passcodeError}>{passcodeError}</Text>
              ) : null}
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                icon="check-circle"
                onPress={handleConfirmDeliveryWithPasscode}
                style={styles.confirmButtonFullWidth}
                labelStyle={styles.modalConfirmLabel}
                disabled={deliveryPasscode.length !== 4 || isVerifyingPasscode}
              >
                Delivered
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCancelModal(false);
          setSelectedReason('');
          setCancelReason('');
          setIsReasonInputFocused(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Cancel Order
              </Text>
              <IconButton
                icon="close"
                iconColor={COLORS.TEXT_SECONDARY}
                size={24}
                onPress={() => {
                  setShowCancelModal(false);
                  setSelectedReason('');
                  setCancelReason('');
                  setIsReasonInputFocused(false);
                }}
                style={styles.modalCloseButton}
              />
            </View>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Please provide a reason for cancelling this order:
            </Text>

            <View style={styles.reasonsContainer}>
              {defaultCancelReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason && styles.reasonOptionSelected
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedReason === 'Other' && (
              <View style={styles.otherReasonContainer}>
                <Text variant="bodyMedium" style={styles.otherReasonLabel}>
                  Specify Reason
                </Text>
                <TextInput
                  style={[
                    styles.customReasonInput,
                    isReasonInputFocused && styles.customReasonInputFocused
                  ]}
                  placeholder="Please provide details about why you're cancelling this order..."
                  placeholderTextColor={COLORS.TEXT_LIGHT}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  onFocus={() => setIsReasonInputFocused(true)}
                  onBlur={() => setIsReasonInputFocused(false)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                icon="check-circle"
                onPress={handleConfirmCancellation}
                style={styles.confirmButtonFullWidth}
                labelStyle={styles.modalConfirmLabel}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Confirm
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  
  // Main Card Styles
  mainCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardContent: {
    padding: 24,
  },
  
  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumberSection: {
    flex: 1,
  },
  orderNumber: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 26,
    marginBottom: 4,
    fontFamily: 'System',
  },
  orderDate: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Section Styles
  sectionDivider: {
    marginVertical: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    height: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 18,
    fontFamily: 'System',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'System',
  },
  
  // Restaurant Section
  restaurantName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 4,
    fontFamily: 'System',
  },
  restaurantAddress: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Customer Section
  customerName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 4,
    fontFamily: 'System',
  },
  customerPhone: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '400',
    fontFamily: 'System',
  },
  deliveryAddress: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'System',
  },
  
  // Order Items
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'System',
  },
  itemQuantity: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '400',
    fontFamily: 'System',
  },
  specialInstructions: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontStyle: 'italic',
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    fontWeight: '400',
    fontFamily: 'System',
  },
  itemPrice: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '700',
    fontSize: 17,
    fontFamily: 'System',
  },
  
  // Payment & Summary
  paymentInfo: {
    marginBottom: 16,
  },
  paymentMethod: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 4,
    fontFamily: 'System',
  },
  transactionId: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  summaryContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  summaryValue: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    fontSize: 16,
    fontFamily: 'System',
  },
  summaryDivider: {
    marginVertical: 8,
    backgroundColor: COLORS.TEXT_SECONDARY,
    height: 1,
  },
  totalLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'System',
  },
  totalValue: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'System',
  },
  
  // Action Buttons Container
  actionButtonsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  halfWidthButton: {
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 16,
    shadowColor: COLORS.PRIMARY_RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successActionButton: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 16,
    shadowColor: COLORS.PRIMARY_RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelActionButton: {
    borderRadius: 16,
    borderColor: COLORS.PRIMARY_RED,
    borderWidth: 2,
  },
  primaryActionLabel: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  cancelActionLabel: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '600',
    fontSize: 17,
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalCloseButton: {
    margin: 0,
  },
  modalSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'System',
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  reasonOptionSelected: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderColor: COLORS.PRIMARY_RED,
    borderWidth: 2,
    shadowColor: COLORS.PRIMARY_RED,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reasonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  reasonTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 17,
  },
  otherReasonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  otherReasonLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 8,
    fontFamily: 'System',
  },
  customReasonInput: {
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontFamily: 'System',
    textAlignVertical: 'top',
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 100,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  customReasonInputFocused: {
    borderColor: COLORS.PRIMARY_RED,
    backgroundColor: '#FFF9F9',
    shadowColor: COLORS.PRIMARY_RED,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalCancelButton: {
    borderColor: COLORS.PRIMARY_RED,
    borderWidth: 2,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY_RED,
  },
  confirmButtonFullWidth: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 12,
    width: '100%',
  },
  modalCancelLabel: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  modalConfirmLabel: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  passcodeContainer: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  passcodeInputsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  passcodeInputsDisabled: {
    opacity: 0.6,
  },
  passcodeBox: {
    width: 56,
    height: 64,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
    textAlignVertical: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passcodeBoxFilled: {
    borderColor: COLORS.PRIMARY_RED,
    shadowOpacity: 0.2,
  },
  passcodeBoxDisabled: {
    opacity: 0.5,
  },
  passcodeHint: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'System',
    marginTop: 4,
  },
  passcodeError: {
    color: COLORS.PRIMARY_RED,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '600',
    marginTop: 8,
  },
  passcodeLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  passcodeLoaderText: {
    color: COLORS.PRIMARY_RED,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default OrderDetailsScreen;
