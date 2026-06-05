/**
 * App.tsx
 * Root component. Responsibilities:
 *  1. Polyfill crypto for uuid on React Native
 *  2. Set up Android notification channel
 *  3. Generate / restore a persistent device ID
 *  4. Request notification permissions + register push token with backend
 *  5. Listen for foreground notifications (show in-app alert)
 *  6. Listen for notification taps → navigate to the relevant order screen
 */

// Must be the very first import so uuid works on React Native
import 'react-native-get-random-values';

import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import AppNavigator, { navigationRef } from './src/navigation';
import {
  setupAndroidChannel,
  requestPermissionsAndGetToken,
  registerDeviceToken,
} from './src/notifications';
import { NotificationData } from './src/types';

export default function App() {
  const notificationListener    = useRef<Notifications.EventSubscription>();
  const notificationTapListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    bootstrap();

    // Foreground handler: show an in-app alert when a notification arrives
    // while the app is open (instead of silently dropping it)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;
        Alert.alert(title || 'OrderUpdateApp', body || '');
      },
    );

    // Tap handler: fired when the user taps a notification in the tray.
    // Reads the orderId from the data payload and navigates to that order.
    notificationTapListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as NotificationData;
        if (data?.orderId && navigationRef.isReady()) {
          navigationRef.navigate('OrderDetail', { orderId: data.orderId });
        }
      });

    return () => {
      notificationListener.current?.remove();
      notificationTapListener.current?.remove();
    };
  }, []);

  /** Run once on startup to set up notifications and register the device */
  async function bootstrap() {
    // 1. Register the Android notification channel (no-op on iOS)
    await setupAndroidChannel();

    // 2. Restore or create a unique, persistent device ID
    let deviceId = await AsyncStorage.getItem('app_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      await AsyncStorage.setItem('app_device_id', deviceId);
    }

    // 3. Ask for permission and retrieve the Expo push token
    const { granted, token } = await requestPermissionsAndGetToken();

    if (granted && token) {
      // Store locally for display in the Settings screen
      await AsyncStorage.setItem('app_push_token', token);
      // Register with the backend so the server can send push notifications
      await registerDeviceToken(deviceId, token);
    }
  }

  return <AppNavigator />;
}
