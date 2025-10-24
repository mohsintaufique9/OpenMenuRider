# 🚀 Test Credentials for OpenMenu Rider App

## 📱 **Ready to Test!**

Your React Native rider app is now running with **mock data** for immediate testing. The Expo development server is active and you can test the app right now!

## 🔑 **Test Login Credentials**

Use these credentials to sign in to the app:

```
Phone Number: 03001234567
Password: password123
```

## 📱 **How to Test**

1. **Open Expo Go** on your Android device
2. **Scan the QR code** from the terminal
3. **Enter the credentials** above
4. **Explore the app** with mock data

## 🎯 **What You'll See**

### **Login Screen**
- Clean, professional login form
- Phone number and password fields
- Loading states and error handling

### **Dashboard Screen**
- Welcome message for "Ahmed Khan"
- Today's statistics (3 deliveries, Rs. 3,750 earnings)
- 2 active orders with different statuses
- Quick action buttons

### **Mock Data Includes**
- **Rider Profile**: Ahmed Khan (Motorcycle rider)
- **Restaurant**: Pizza Palace in Karachi
- **Active Orders**: 2 orders with different statuses
- **Notifications**: Order assignments and updates
- **Statistics**: Daily/weekly earnings and delivery counts

## 🔄 **Switching to Real Backend**

When you're ready to connect to your actual backend:

1. **Update API URL** in `src/constants/index.ts`:
   ```typescript
   export const API_BASE_URL = 'http://your-backend-url/api';
   ```

2. **Uncomment real API calls** in `src/services/api.ts`
3. **Comment out mock calls** in the same file
4. **Create rider accounts** in your backend

## 📋 **Mock Data Details**

### **Test Rider**
- Name: Ahmed Khan
- Phone: 03001234567
- Vehicle: Motorcycle (ABC-123)
- Restaurant: Pizza Palace

### **Sample Orders**
1. **Order #ORD-12345678** - Ready for pickup
   - Customer: Ali Ahmed
   - Items: 2x Margherita Pizza
   - Total: Rs. 1,250

2. **Order #ORD-87654321** - On the way
   - Customer: Sara Khan
   - Items: 1x Chicken Burger
   - Total: Rs. 850

## 🎨 **App Features Working**

✅ **Authentication Flow**
✅ **Dashboard with Statistics**
✅ **Order List Display**
✅ **Status Badges**
✅ **Notification Center**
✅ **Loading States**
✅ **Error Handling**
✅ **Responsive Design**

## 🚀 **Next Steps**

1. **Test the login** with the provided credentials
2. **Explore the dashboard** and order management
3. **Check the UI/UX** and provide feedback
4. **Plan additional screens** (Order Details, Profile, etc.)
5. **Connect to real backend** when ready

---

**Happy Testing!** 🎉

The app is fully functional with mock data and ready for development and testing.
