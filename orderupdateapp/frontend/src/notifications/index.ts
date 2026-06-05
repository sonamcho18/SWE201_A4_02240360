/**
 * notifications/index.ts
 * All Expo Notifications logic isolated in one place:
 *   - foreground handler configuration
 *   - Android channel setup
 *   - permission request + push token retrieval
 *   - backend token registration
 *   - local notification scheduling and cancellation
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerToken } from '../api';

// ─── Foreground display behaviour ─────────────────────────────────────────────
// Show alert, play sound, and update badge even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

// ─── Android notification channel ─────────────────────────────────────────────
/**
 * Create the 'order-updates' channel on Android.
 * Must be called before any notification is scheduled or received.
 * Channel ID must match the channelId sent from the backend.
 */
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('order-updates', {
      name:             'Order Updates',
      importance:       Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#F97316',
      sound:            'default',
    });
  }
}

// ─── Permissions + push token ─────────────────────────────────────────────────
/**
 * Request notification permissions from the OS.
 * On a real device, also fetches the Expo push token.
 * Returns { granted: boolean, token: string | null }.
 */
export async function requestPermissionsAndGetToken(): Promise<{
  granted: boolean;
  token:   string | null;
}> {
  // On emulator we can still get permissions for local notifications,
  // but remote push tokens require a real device.
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, token: null };
  }

  // Only real devices can get a valid Expo push token
  if (!Device.isDevice) {
    return { granted: true, token: null };
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return { granted: true, token: tokenData.data };
}

// ─── Backend registration ─────────────────────────────────────────────────────
/** Send the device ID + push token to the backend for storage. */
export async function registerDeviceToken(
  deviceId: string,
  token:    string,
): Promise<void> {
  try {
    await registerToken(deviceId, token);
    console.log('[Notifications] Push token registered with backend');
  } catch (err) {
    console.warn('[Notifications] Could not register token with backend:', err);
  }
}

// ─── Local notification scheduling ───────────────────────────────────────────
/**
 * Schedule a local reminder notification for a specific order.
 * @param orderId    - Used as deep-link data so tapping navigates to this order
 * @param orderName  - Shown in the notification body
 * @param delaySeconds - How many seconds from now to fire the notification
 * @returns The scheduled notification identifier (used to cancel it later)
 */
export async function scheduleOrderReminder(
  orderId:      string,
  orderName:    string,
  delaySeconds: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Order Reminder',
      body:  `Reminder: your order for "${orderName}" is still pending!`,
      sound: 'default',
      data:  { orderId, screen: 'OrderDetail' },
      ...(Platform.OS === 'android' && { channelId: 'order-updates' }),
    },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });
  return id;
}

/** Cancel one scheduled notification by its identifier */
export async function cancelScheduledNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/** Cancel every pending scheduled notification for this device */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Return all currently scheduled notification requests */
export async function getAllScheduled(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
