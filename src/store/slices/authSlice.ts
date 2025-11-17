// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/api';
import { AuthState, Rider } from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  rider: null,
  token: null,
  loading: false,
  initialLoading: true,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ phone, password }: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await ApiService.login(phone, password);
      
      
      // Check if login was successful
      if (response.data.success) {
        const { token, rider } = response.data;
        
        // Store token and rider data
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('rider_data', JSON.stringify(rider));
        
        return { token, rider };
      } else {
        // Convert backend error messages to mobile-friendly messages
        const backendMessage = response.data.message || 'Login failed';
        let mobileMessage = backendMessage;
        
        if (backendMessage.includes('Invalid credentials')) {
          mobileMessage = 'Wrong phone number or password';
        } else if (backendMessage.includes('Invalid phone number')) {
          mobileMessage = 'Phone number not found';
        } else if (backendMessage.includes('not authorized')) {
          mobileMessage = 'This account is not for riders';
        } else if (backendMessage.includes('not found')) {
          mobileMessage = 'Account not found';
        }
        
        return rejectWithValue(mobileMessage);
      }
    } catch (error: any) {
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return rejectWithValue('No internet connection');
      }
      
      // Convert API error messages to mobile-friendly messages
      const backendMessage = error.response?.data?.message || 'Login failed';
      let mobileMessage = backendMessage;
      
      if (backendMessage.includes('Invalid credentials')) {
        mobileMessage = 'Wrong phone number or password';
      } else if (backendMessage.includes('Invalid phone number')) {
        mobileMessage = 'Phone number not found';
      } else if (backendMessage.includes('not authorized')) {
        mobileMessage = 'This account is not for riders';
      } else if (backendMessage.includes('not found')) {
        mobileMessage = 'Account not found';
      }
      
      return rejectWithValue(mobileMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Auth slice: Starting logout...');
      await ApiService.logout();
      console.log('Auth slice: API logout successful');
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('rider_data');
      console.log('Auth slice: Storage cleared');
      return true;
    } catch (error: any) {
      console.log('Auth slice: Logout error:', error);
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const riderData = await AsyncStorage.getItem('rider_data');
      
      if (token && riderData) {
        const rider = JSON.parse(riderData);
        return { token, rider };
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<Rider>, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(profileData);
      const rider = response.data.rider;
      
      // Update stored rider data
      await AsyncStorage.setItem('rider_data', JSON.stringify(rider));
      
      return rider;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUnauthenticated: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.rider = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.rider = action.payload.rider;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        console.log('Auth slice: Logout pending...');
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log('Auth slice: Logout fulfilled, setting isAuthenticated to false');
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.rider = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.log('Auth slice: Logout rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.initialLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.initialLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.rider = action.payload.rider;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.initialLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.rider = null;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.rider = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading, setUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
