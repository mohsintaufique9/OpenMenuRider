# OpenMenu Rider App

A React Native mobile application for food delivery riders working with the OpenMenu.pk platform.

## Features

- **Authentication**: Secure login with phone number and password
- **Order Management**: View assigned orders and update delivery status
- **Real-time Notifications**: Receive push notifications for new order assignments
- **Navigation**: Integrated maps for restaurant and customer locations
- **Profile Management**: View and update rider profile information
- **Dashboard**: Overview of daily deliveries and earnings

## Tech Stack

- **React Native** with TypeScript
- **Expo** for development and deployment
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Axios** for API calls
- **AsyncStorage** for local data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on Android:
   ```bash
   npm run android
   ```

5. Run on iOS:
   ```bash
   npm run ios
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
├── navigation/          # Navigation configuration
├── store/              # Redux store and slices
├── services/           # API services
├── types/              # TypeScript type definitions
├── constants/          # App constants
└── utils/              # Utility functions
```

## API Integration

The app integrates with the OpenMenu.pk backend API. Update the API base URL in `src/constants/index.ts`:

```typescript
export const API_BASE_URL = 'http://your-backend-url/api';
```

## Backend Requirements

The following APIs need to be implemented in the backend:

- Rider authentication endpoints
- Order management for riders
- Real-time notifications
- Location tracking
- Delivery confirmation

See `MISSING_APIS_ANALYSIS.md` for detailed API specifications.

## Development

### Running the App

1. **Development Mode**:
   ```bash
   npm start
   ```

2. **Android**:
   ```bash
   npm run android
   ```

3. **iOS**:
   ```bash
   npm run ios
   ```

### Building for Production

1. **Android APK**:
   ```bash
   npx expo build:android
   ```

2. **iOS IPA**:
   ```bash
   npx expo build:ios
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```
API_BASE_URL=http://localhost:8000/api
PUSHER_KEY=your-pusher-key
PUSHER_CLUSTER=your-pusher-cluster
```

### App Configuration

Update `app.json` for:
- App name and bundle identifier
- Permissions
- Splash screen
- Icons

## Testing

The app includes comprehensive user stories and acceptance criteria. Test the following flows:

1. **Authentication Flow**: Login, logout, token persistence
2. **Order Management**: View orders, update status, confirm delivery
3. **Notifications**: Receive and manage notifications
4. **Navigation**: Maps integration and location services

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React Native best practices
4. Write comprehensive user stories
5. Test on both Android and iOS

## License

This project is proprietary software for OpenMenu.pk delivery partners.

## Support

For technical support, contact the development team or refer to the documentation in the `/docs` folder.
