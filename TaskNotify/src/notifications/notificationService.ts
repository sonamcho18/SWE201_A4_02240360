import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { CHANNEL_ID } from './notificationChannels';
import { registerTokenWithBackend } from '../api/backendApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<string> {
  if (!Device.isDevice) return 'denied';
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return existing;
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

export async function getPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

export async function registerPushToken(): Promise<string | null> {
  try {
    const status = await requestPermission();
    if (status !== 'granted') return null;
    const token = await getExpoPushToken();
    if (token) await registerTokenWithBackend(token);
    return token;
  } catch (e) {
    console.warn('registerPushToken error:', e);
    return null;
  }
}

export async function scheduleNotification(
  taskId: string,
  title: string,
  body: string,
  date: Date
): Promise<string | null> {
  try {
    const triggerDate = date.getTime() > Date.now() ? date : new Date(Date.now() + 5000);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { taskId, screen: 'TaskDetail' },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (e) {
    console.warn('scheduleNotification error:', e);
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch { /* ignore */ }
}
