// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import { store } from '../store';
import { setUnauthenticated } from '../store/slices/authSlice';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - user is unauthenticated
          // Clear storage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('rider_data');
          // Update Redux state to trigger navigation back to login screen
          store.dispatch(setUnauthenticated());
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(phone: string, password: string) {
    const response = await this.api.post('/rider/login', {
      phone,
      password,
      device_name: 'riderApp',
    });
    return response;
  }

  async logout() {
    const response = await this.api.post('/rider/logout');
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/rider/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/rider/profile', data);
    return response.data;
  }

  // Order methods
  async getOrders() {
    const response = await this.api.get('/rider/orders');
    return response.data;
  }

  async getOrderDetails(orderId: number) {
    const response = await this.api.get(`/rider/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: number, status: string, reason?: string, deliveryPasscode?: string) {
    const endpoint = `/rider/orders/${orderId}/status`;
    const payload = {
      status,
      reason,
      delivery_passcode: deliveryPasscode,
    };
    const fullUrl = `${this.api.defaults.baseURL}${endpoint}`;
    
    console.log('🚀 [API] updateOrderStatus - Request Details:');
    console.log('📍 Endpoint:', endpoint);
    console.log('🌐 Full URL:', fullUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('🔑 Order ID:', orderId);
    console.log('📊 Status:', status);
    console.log('🔐 Delivery Passcode:', deliveryPasscode ? `"${deliveryPasscode}" (length: ${deliveryPasscode.length})` : 'undefined');
    
    try {
      const response = await this.api.put(endpoint, payload);
      console.log('✅ [API] updateOrderStatus - Success Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] updateOrderStatus - Error Details:');
      console.error('📡 Response Status:', error.response?.status);
      console.error('📄 Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('💬 Error Message:', error.response?.data?.message || error.message);
      console.error('🔍 Full Error:', error);
      throw error;
    }
  }

  async confirmDelivery(orderId: number, data: any, deliveryPasscode?: string) {
    const response = await this.api.post(`/rider/orders/${orderId}/delivery-confirmation`, {
      ...data,
      delivery_passcode: deliveryPasscode,
    });
    return response.data;
  }

  // Notification methods
  async getNotifications() {
    const response = await this.api.get('/rider/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number) {
    const response = await this.api.put(`/rider/notifications/${notificationId}/read`);
    return response.data;
  }

  // Location methods
  async updateLocation(latitude: number, longitude: number) {
    const response = await this.api.post('/rider/location', {
      latitude,
      longitude,
    });
    return response.data;
  }

  // Dashboard methods
  async getDashboardData() {
    const response = await this.api.get('/dashboard');
    return response.data;
  }

  // Earnings methods
  async getEarnings(period?: string, date?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    
    const response = await this.api.get(`/rider/earnings?${params.toString()}`);
    return response.data;
  }

  async getPerformance() {
    const response = await this.api.get('/rider/performance');
    return response.data;
  }
}

export default new ApiService();
