// src/screens/DashboardScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  Surface,
  Chip,
  Avatar,
  Badge,
  IconButton,
  Divider,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchOrders } from '../store/slices/orderSlice';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { logout } from '../store/slices/authSlice';
import { COLORS, SCREEN_NAMES } from '../constants';
import { Order } from '../types';
import OpenMenuLogo from '../components/OpenMenuLogo';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { rider } = useSelector((state: RootState) => state.auth);
  const { orders, loading } = useSelector((state: RootState) => state.order);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchOrders()).unwrap(),
        dispatch(fetchNotifications()).unwrap(),
      ]);
    } catch (error) {
      console.log('error in loadData', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewOrderDetails = (order: Order) => {
    (navigation as any).navigate(SCREEN_NAMES.ORDER_DETAILS, { orderId: order.id });
  };

  const handleLogout = () => {
    console.log('Dashboard: handleLogout called');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              await dispatch(logout()).unwrap();
              console.log('Logout completed successfully');
              // Navigation will be handled automatically by AppNavigator
              // when isAuthenticated becomes false
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Logout failed. Please try again.');
            }
          }
        }
      ]
    );
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

  const getStatusIconColor = (status: string) => {
    // If status background is red, return white for better visibility
    const statusColor = getStatusColor(status);
    if (statusColor === COLORS.PRIMARY_RED) {
      return COLORS.WHITE;
    }
    return COLORS.WHITE; // Default to white for all statuses
  };

  const activeOrders = orders.filter(order => 
    ['pending', 'preparing', 'ready', 'on_the_way'].includes(order.status)
  );

  const todayDeliveries = orders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  ).length;

  const todayPending = orders.filter(order => 
    order.status === 'pending' && 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <OpenMenuLogo size={40} showText={false} />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.appName}>
                OpenMenu Rider
              </Text>
              <Text variant="bodySmall" style={styles.welcomeText}>
                Welcome back, {rider?.name}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.notificationContainer}>
              <IconButton
                icon="bell"
                size={24}
                iconColor={COLORS.TEXT_PRIMARY}
                onPress={() => {}}
              />
              {unreadCount > 0 && (
                <Badge style={styles.badge}>{unreadCount}</Badge>
              )}
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.PRIMARY_RED} />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Today's Overview
          </Text>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard} mode="elevated" elevation={2}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <View style={[styles.statIconBackground, { backgroundColor: COLORS.SUCCESS }]}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.WHITE} />
                  </View>
                </View>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {todayDeliveries}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Delivered Today
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard} mode="elevated" elevation={2}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <View style={[styles.statIconBackground, { backgroundColor: COLORS.PRIMARY_YELLOW }]}>
                    <Ionicons name="time" size={24} color={COLORS.WHITE} />
                  </View>
                </View>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {todayPending}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Pending Today
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Active Orders Section */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Active Orders
            </Text>
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
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading orders...
              </Text>
            </View>
          ) : activeOrders.length === 0 ? (
            <Card style={styles.emptyCard} mode="outlined">
              <Card.Content style={styles.emptyContent}>
                <Avatar.Icon 
                  size={64} 
                  icon="bike" 
                  style={styles.emptyIcon}
                />
                <Text variant="titleMedium" style={styles.emptyText}>
                  No active orders
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  You'll be notified when new orders are assigned to you
                </Text>
                <Button
                  mode="contained"
                  onPress={handleRefresh}
                  style={styles.refreshOrderButton}
                >
                  Check for Orders
                </Button>
              </Card.Content>
            </Card>
          ) : (
            activeOrders.map((order: Order, index: number) => (
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
                        {new Date(order.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={[styles.statusChipContainer, { backgroundColor: getStatusColor(order.status) }]}>
                      <Chip
                        style={styles.statusChip}
                        textStyle={[styles.statusChipText, { color: COLORS.WHITE }]}
                        compact
                      >
                        {getStatusText(order.status)}
                      </Chip>
                    </View>
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

                  {/* Action Buttons */}
                  <View style={styles.orderActions}>
                    <Button
                      mode="contained"
                      icon="eye-outline"
                      style={styles.actionButton}
                      labelStyle={styles.actionButtonLabel}
                      onPress={() => handleViewOrderDetails(order)}
                    >
                      View Details
                    </Button>
                  </View>
                </Card.Content>
              </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

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
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'System',
  },
  welcomeText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 2,
    fontWeight: '400',
    fontFamily: 'System',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 16,
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: COLORS.PRIMARY_RED,
    fontWeight: '800',
    marginBottom: 4,
    fontSize: 24,
    fontFamily: 'System',
  },
  statLabel: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  ordersSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    borderRadius: 8,
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
    marginBottom: 16,
  },
  refreshOrderButton: {
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_RED,
  },
  orderCard: {
    marginBottom: 16,
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
  statusChipContainer: {
    borderRadius: 20,
    height: 32,
    overflow: 'hidden',
  },
  statusChip: {
    borderRadius: 0,
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
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  orderCardTouchable: {
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
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

export default DashboardScreen;