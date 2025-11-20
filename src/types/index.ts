// src/types/index.ts
export interface Rider {
  id: number;
  name: string;
  cnic: string;
  phone_number: string;
  address: string;
  vehicle_type: 'motorcycle' | 'bicycle' | 'car' | 'van';
  vehicle_registration_number: string;
  is_active: boolean;
  restaurant_id: number;
  restaurant?: Restaurant;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  phone_number?: string; // Added for compatibility
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  delivery_radius?: number; // Added for compatibility
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled';
  rider_id?: number;
  restaurant_id: number;
  user_id?: number;
  guest_id?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_details: DeliveryDetails;
  payment_details: PaymentDetails;
  restaurant?: Restaurant;
  items?: OrderItem[];
  rider?: Rider;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  variations?: any[];
  addons?: any[];
  special_instructions?: string;
  menuItem?: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  instructions?: string;
  delivery_method: 'standard' | 'express';
}

export interface PaymentDetails {
  method: string;
  status?: string;
  transaction_id?: string;
  provider?: string;
  amount?: number;
  [key: string]: any;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  rider: Rider | null;
  token: string | null;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
