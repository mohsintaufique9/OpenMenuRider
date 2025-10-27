// src/screens/OrderHistoryScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Button,
  Surface,
  Avatar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchOrders } from '../store/slices/orderSlice';
import { COLORS, SCREEN_NAMES } from '../constants';
import { Order } from '../types';

const OrderHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { orders, loading } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await dispatch(fetchOrders()).unwrap();
    } catch (error) {
      console.log('error in loadData', error);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewOrderDetails = (order: Order) => {
    (navigation as any).navigate(SCREEN_NAMES.ORDER_DETAILS, { orderId: order.id });
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

  // All orders sorted by date (newest first)
  const allOrders = [...orders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.headerSection}>
            <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY_RED} />
            <Text variant="titleMedium" style={styles.headerTitle}>
              Order History
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={handleRefresh}
            icon="refresh"
            style={styles.refreshButton}
          >
            Refresh
          </Button>
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading orders...
            </Text>
          </View>
        ) : allOrders.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyContent}>
              <Avatar.Icon 
                size={64} 
                icon="receipt" 
                style={styles.emptyIcon}
              />
              <Text variant="titleMedium" style={styles.emptyText}>
                No orders yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Your order history will appear here
              </Text>
            </Card.Content>
          </Card>
        ) : (
          allOrders.map((order: Order) => (
            <TouchableOpacity 
              key={order.id} 
              onPress={() => handleViewOrderDetails(order)}
              style={styles.orderCardTouchable}
              activeOpacity={0.7}
            >
              <Card style={styles.orderCard} mode="elevated" elevation={3}>
                <Card.Content style={styles.orderCardContent}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderNumberSection}>
                      <Text variant="titleLarge" style={styles.orderNumber}>
                        #{order.order_number}
                      </Text>
                      <Text variant="bodySmall" style={styles.orderTime}>
                        {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
                      textStyle={styles.statusChipText}
                      compact
                    >
                      {getStatusText(order.status)}
                    </Chip>
                  </View>

                  {/* Restaurant & Customer Info */}
                  <View style={styles.orderInfoSection}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="storefront-outline" size={20} color={COLORS.PRIMARY_RED} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.infoLabel}>
                          Restaurant
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoValue}>
                          {order.restaurant?.name || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="person-outline" size={20} color={COLORS.SUCCESS} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.infoLabel}>
                          Customer
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoValue}>
                          {order.delivery_details?.name || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="cash-outline" size={20} color={COLORS.PRIMARY_YELLOW} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text variant="bodySmall" style={styles.infoLabel}>
                          Total Amount
                        </Text>
                        <Text variant="titleMedium" style={styles.orderTotal}>
                          Rs. {Number(order.total || 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* View Details Button */}
                  <Button
                    mode="contained"
                    icon="eye-outline"
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                    onPress={() => handleViewOrderDetails(order)}
                  >
                    View Details
                  </Button>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
  },
  refreshButton: {
    borderRadius: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyCard: {
    borderRadius: 16,
    margin: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    backgroundColor: COLORS.TEXT_LIGHT,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderCardContent: {
    padding: 20,
  },
  orderCardTouchable: {
    marginBottom: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumberSection: {
    flex: 1,
  },
  orderNumber: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'System',
  },
  orderTime: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  statusChip: {
    borderRadius: 20,
    height: 32,
  },
  statusChipText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  orderInfoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    fontFamily: 'System',
  },
  infoValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
  orderTotal: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
  },
  actionButton: {
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY_RED,
    shadowColor: COLORS.PRIMARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
    color: COLORS.WHITE,
  },
  bottomSpacing: {
    height: 100,
    paddingBottom: 20,
  },
});

export default OrderHistoryScreen;

