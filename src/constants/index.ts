// src/constants/index.ts
export const API_BASE_URL = 'https://staging-be.openmenu.pk/api/'; // Your Laravel backend
export const PUSHER_KEY = 'your-pusher-key'; // Update with your Pusher key
export const PUSHER_CLUSTER = 'your-pusher-cluster'; // Update with your Pusher cluster

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const VEHICLE_TYPES = {
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle',
  CAR: 'car',
  VAN: 'van',
} as const;

export const NOTIFICATION_TYPES = {
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  EMERGENCY_ALERT: 'emergency_alert',
} as const;

export const COLORS = {
  // OpenMenu Brand Colors - Exact from SVG logo
  PRIMARY_RED: '#DB0007',      // Exact red from logo (#DB0007)
  PRIMARY_YELLOW: '#FFD700',   // Exact yellow from logo (#FFD700)
  ACCENT_WHITE: '#FFFFFF',      // White from logo
  BACKGROUND_BLACK: '#000000',  // Black background from logo
  
  // Main Brand Colors
  PRIMARY: '#DB0007',           // Main brand red
  SECONDARY: '#FFD700',        // Main brand yellow
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  
  // Semantic Colors - Using brand colors
  SUCCESS: '#00C851',          // Keep green for success
  ERROR: '#DB0007',            // Using brand red for errors
  WARNING: '#FFD700',          // Using brand yellow for warnings
  INFO: '#DB0007',             // Using brand red for info
  
  // Neutral Colors
  GRAY: '#9E9E9E',
  LIGHT_GRAY: '#F5F5F5',
  DARK_GRAY: '#424242',
  
  // Background Colors
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F8F9FA',
  CARD_BACKGROUND: '#FFFFFF',
  
  // Text Colors
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_LIGHT: '#999999',
  TEXT_ON_PRIMARY: '#FFFFFF',
  TEXT_ON_SECONDARY: '#000000',
  
  // Brand Color Variations
  PRIMARY_RED_LIGHT: '#FFE6E6',    // Light red for backgrounds
  PRIMARY_YELLOW_LIGHT: '#FFF9E6', // Light yellow for backgrounds
  PRIMARY_RED_DARK: '#B80006',     // Darker red for pressed states
  PRIMARY_YELLOW_DARK: '#E6C200',  // Darker yellow for pressed states
} as const;

export const SCREEN_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  ORDER_DETAILS: 'OrderDetails',
  PROFILE: 'Profile',
  NOTIFICATIONS: 'Notifications',
  ORDER_HISTORY: 'OrderHistory',
} as const;