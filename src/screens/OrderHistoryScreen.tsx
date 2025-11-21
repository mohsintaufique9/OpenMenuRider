// src/screens/OrderHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  Button,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchOrders } from '../store/slices/orderSlice';
import { COLORS, SCREEN_NAMES } from '../constants';
import StatusChip from '../components/StatusChip';
import { Order } from '../types';

const OrderHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { orders, loading } = useSelector((state: RootState) => state.order);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await dispatch(fetchOrders()).unwrap();
    } catch (error) {
      console.log('Error loading orders:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleViewOrderDetails = (order: Order) => {
    (navigation as any).navigate(SCREEN_NAMES.ORDER_DETAILS, { orderId: order.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Sort orders by date (most recent first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Group orders by date
  const groupedOrders = sortedOrders.reduce((groups: { [key: string]: Order[] }, order) => {
    const date = new Date(order.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Order History
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          All your assigned orders
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading orders...
            </Text>
          </View>
        ) : sortedOrders.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.TEXT_LIGHT} />
              <Text variant="titleMedium" style={styles.emptyText}>
                No orders yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Your order history will appear here once you receive assignments
              </Text>
              <Button
                mode="contained"
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                Refresh
              </Button>
            </Card.Content>
          </Card>
        ) : (
          Object.entries(groupedOrders).map(([date, dateOrders]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text variant="titleMedium" style={styles.dateText}>
                  {new Date(date).toDateString() === new Date().toDateString()
                    ? 'Today'
                    : new Date(date).toDateString() ===
                      new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
                    ? 'Yesterday'
                    : new Date(date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                      })}
                </Text>
                <Divider style={styles.dateDivider} />
              </View>

              {dateOrders.map((order: Order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => handleViewOrderDetails(order)}
                  style={styles.orderCardTouchable}
                  activeOpacity={0.7}
                >
                  <Card style={styles.orderCard} mode="elevated" elevation={2}>
                    <Card.Content style={styles.orderCardContent}>
                      {/* Order Header */}
                      <View style={styles.orderHeader}>
                        <View style={styles.orderNumberSection}>
                          <Text variant="titleLarge" style={styles.orderNumber}>
                            #{order.order_number}
                          </Text>
                          <Text variant="bodySmall" style={styles.orderTime}>
                            {formatDate(order.created_at)}
                          </Text>
                        </View>
                        <StatusChip status={order.status} />
                      </View>

                      {/* Restaurant & Customer Info */}
                      <View style={styles.orderInfoSection}>
                        <View style={styles.infoRow}>
                          <View style={styles.infoIconContainer}>
                            <Ionicons name="storefront-outline" size={18} color={COLORS.PRIMARY_RED} />
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
                            <Ionicons name="person-outline" size={18} color={COLORS.SUCCESS} />
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
                            <Ionicons name="cash-outline" size={18} color={COLORS.PRIMARY_YELLOW} />
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
                      <View style={styles.orderActions}>
                        <Button
                          mode="contained"
                          icon="eye-outline"
                          style={styles.viewButton}
                          labelStyle={styles.viewButtonLabel}
                          onPress={() => handleViewOrderDetails(order)}
                        >
                          View Details
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 24,
    fontFamily: 'System',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyCard: {
    margin: 16,
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  refreshButton: {
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
    marginRight: 12,
  },
  dateDivider: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    height: 1,
  },
  orderCardTouchable: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  orderCard: {
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardContent: {
    padding: 20,
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
  orderActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  viewButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  viewButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
    color: COLORS.WHITE,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default OrderHistoryScreen;

