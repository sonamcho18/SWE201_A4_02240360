import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

let navRef: React.RefObject<NavigationContainerRef<RootStackParamList>> | null = null;

export function setNavigationRef(
  ref: React.RefObject<NavigationContainerRef<RootStackParamList>>
) {
  navRef = ref;
}

function navigateToTask(taskId: string) {
  try {
    navRef?.current?.navigate('TaskDetail', { taskId });
  } catch (e) {
    console.warn('Navigate error:', e);
  }
}

export function setupForegroundListener(onRefresh?: () => void): () => void {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    const { title, body, data } = notification.request.content;
    Alert.alert(title ?? 'Reminder', body ?? '', [
      {
        text: 'View Task',
        onPress: () => {
          if (data?.taskId) navigateToTask(String(data.taskId));
        },
      },
      { text: 'Dismiss', style: 'cancel' },
    ]);
    onRefresh?.();
  });
  return () => sub.remove();
}

export function setupTapListener(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.taskId) navigateToTask(String(data.taskId));
  });
  return () => sub.remove();
}

export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}
