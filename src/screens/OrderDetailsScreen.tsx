// src/screens/OrderDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  Surface,
  Chip,
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

  const defaultCancelReasons = [
    'Customer not available',
    'Wrong address provided',
    'Customer refused to pay',
    'Restaurant closed',
    'Food quality issue',
    'Delivery location inaccessible',
    'Customer phone unreachable',
    'Other'
  ];

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

  const handleStatusChange = async (newStatus: string) => {
    if (!currentOrder) return;
    
    const statusMessages = {
      'on_the_way': 'Are you ready to start delivery?',
      'delivered': 'Have you delivered this order to the customer?',
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
              Alert.alert('Success', 'Order status updated successfully');
              
              // Refresh order details
              dispatch(fetchOrderDetails(currentOrder.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleConfirmDelivery = async () => {
    if (!currentOrder) return;
    
    Alert.alert(
      'Confirm Delivery',
      'Are you sure you have delivered this order to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await dispatch(confirmDelivery({ 
                orderId: currentOrder.id, 
                deliveryData: { 
                  delivered_at: new Date().toISOString(),
                  rider_confirmed: true 
                } 
              })).unwrap();
              Alert.alert('Success', 'Delivery confirmed successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm delivery');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
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
        cancellationReason: finalReason,
        cancelledBy: 'rider',
        cancelledAt: new Date().toISOString()
      })).unwrap();
      
      Alert.alert('Success', 'Order cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedReason('');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.PRIMARY_YELLOW;
      case 'preparing':
        return COLORS.PRIMARY_YELLOW;
      case 'ready':
        return COLORS.PRIMARY_RED;
      case 'on_the_way':
        return COLORS.PRIMARY_RED;
      case 'delivered':
        return COLORS.SUCCESS;
      case 'cancelled':
        return COLORS.PRIMARY_RED;
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'preparing':
        return 'food';
      case 'ready':
        return 'check-circle';
      case 'on_the_way':
        return 'bike';
      case 'delivered':
        return 'check-all';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'on_the_way':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
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
              
              <Chip
                icon={getStatusIcon(currentOrder.status)}
                style={[styles.statusChip, { backgroundColor: getStatusColor(currentOrder.status) }]}
                textStyle={styles.statusChipText}
              >
                {getStatusText(currentOrder.status)}
              </Chip>
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
                  Payment: {currentOrder.payment_details?.method || 'Cash on Delivery'}
                </Text>
                {currentOrder.payment_details?.method !== 'cash' && currentOrder.payment_details?.transaction_id && (
                  <Text variant="bodySmall" style={styles.transactionId}>
                    Transaction ID: {currentOrder.payment_details.transaction_id}
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
            <Button
              mode="contained"
              icon="bike"
              onPress={() => handleStatusChange('on_the_way')}
              style={styles.primaryActionButton}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Start Delivery
            </Button>
          )}
          
          {currentOrder.status === 'on_the_way' && (
            <Button
              mode="contained"
              icon="check-circle"
              onPress={handleConfirmDelivery}
              style={styles.successActionButton}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Confirm Delivery
            </Button>
          )}

          {(currentOrder.status === 'ready' || currentOrder.status === 'on_the_way') && (
            <Button
              mode="outlined"
              icon="close-circle"
              onPress={handleCancelOrder}
              style={styles.cancelActionButton}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Cancel Order
            </Button>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Cancellation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Cancel Order
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Please provide a reason for cancelling this order:
            </Text>

            <ScrollView style={styles.reasonsContainer}>
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
            </ScrollView>

            {selectedReason === 'Other' && (
              <TextInput
                style={styles.customReasonInput}
                placeholder="Please specify the reason..."
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowCancelModal(false);
                  setSelectedReason('');
                  setCancelReason('');
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmCancellation}
                style={[styles.modalButton, styles.confirmButton]}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Confirm Cancellation
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
    shadowColor: COLORS.BLACK,
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
  statusChip: {
    borderRadius: 20,
    height: 36,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 16,
    shadowColor: COLORS.SUCCESS,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelActionButton: {
    borderRadius: 16,
    borderColor: COLORS.PRIMARY_RED,
    borderWidth: 2,
    marginTop: 12,
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
    maxHeight: '80%',
  },
  modalTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  modalSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'System',
  },
  reasonsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reasonOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonOptionSelected: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderColor: COLORS.PRIMARY_RED,
  },
  reasonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  reasonTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY_RED,
  },
});

export default OrderDetailsScreen;
