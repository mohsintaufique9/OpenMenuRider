// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { OrderState, Order } from '../../types';

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await ApiService.getOrderDetails(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status, reason }: { orderId: number; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateOrderStatus(orderId, status, reason);
      return { orderId, status, reason };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const confirmDelivery = createAsyncThunk(
  'order/confirmDelivery',
  async ({ orderId, deliveryData }: { orderId: number; deliveryData: any }, { rejectWithValue }) => {
    try {
      const response = await ApiService.confirmDelivery(orderId, deliveryData);
      return { orderId, deliveryData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm delivery');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, status } = action.payload;
        
        // Update order in list
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status as any;
        }
        
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = status as any;
        }
        
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Confirm delivery
      .addCase(confirmDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId } = action.payload;
        
        // Update order status to delivered
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'delivered';
        }
        
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = 'delivered';
        }
        
        state.error = null;
      })
      .addCase(confirmDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentOrder, clearError, addOrder, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;
