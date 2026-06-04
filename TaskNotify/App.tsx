import React, { useEffect, useRef, useState } from 'react';
import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { createNotificationChannels } from './src/notifications/notificationChannels';
import { registerPushToken } from './src/notifications/notificationService';
import {
  setNavigationRef,
  setupForegroundListener,
  setupTapListener,
  getLastNotificationResponse,
} from './src/notifications/notificationListeners';
import { RootStackParamList } from './src/types';

const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await createNotificationChannels();
      await registerPushToken();
      setNavigationRef(navigationRef);

      // Handle cold-start tap
      const lastResponse = await getLastNotificationResponse();
      if (lastResponse?.notification?.request?.content?.data?.taskId) {
        const taskId = String(lastResponse.notification.request.content.data.taskId);
        setTimeout(() => {
          navigationRef.current?.navigate('TaskDetail', { taskId });
        }, 1500);
      }
    })();

    const removeFg = setupForegroundListener();
    const removeTap = setupTapListener();

    return () => {
      removeFg();
      removeTap();
    };
  }, []);

  if (!ready) {
    return <SplashScreen onDone={() => setReady(true)} />;
  }

  return <AppNavigator navigationRef={navigationRef} />;
}
