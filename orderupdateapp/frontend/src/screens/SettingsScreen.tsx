/**
 * screens/SettingsScreen.tsx
 * Shows notification permission state, the registered push token,
 * and controls to request/re-register permissions and cancel scheduled reminders.
 */

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useFocusEffect }  from '@react-navigation/native';
import { Ionicons }        from '@expo/vector-icons';
import * as Notifications  from 'expo-notifications';
import AsyncStorage        from '@react-native-async-storage/async-storage';
import {
  requestPermissionsAndGetToken,
  registerDeviceToken,
  cancelAllScheduledNotifications,
  getAllScheduled,
} from '../notifications';
import { Colors } from '../constants';

export default function SettingsScreen() {
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [pushToken, setPushToken]               = useState<string | null>(null);
  const [deviceId, setDeviceId]                 = useState<string>('');
  const [scheduledCount, setScheduledCount]     = useState(0);
  const [registering, setRegistering]           = useState(false);
  const [cancelling, setCancelling]             = useState(false);

  /** Refresh all displayed values */
  const refresh = useCallback(async () => {
    const { status }     = await Notifications.getPermissionsAsync();
    const storedToken    = await AsyncStorage.getItem('app_push_token');
    const storedDeviceId = await AsyncStorage.getItem('app_device_id');
    const scheduled      = await getAllScheduled();

    setPermissionStatus(status);
    setPushToken(storedToken);
    setDeviceId(storedDeviceId || '');
    setScheduledCount(scheduled.length);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleRequestPermission = async () => {
    setRegistering(true);
    try {
      const { granted, token } = await requestPermissionsAndGetToken();

      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Notifications are blocked. Open your device settings to enable them.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
        setPermissionStatus('denied');
        return;
      }

      const storedDeviceId = await AsyncStorage.getItem('app_device_id');
      if (token && storedDeviceId) {
        await registerDeviceToken(storedDeviceId, token);
        await AsyncStorage.setItem('app_push_token', token);
        Alert.alert('Success', 'Notifications enabled and device registered with the server!');
      } else if (token) {
        await AsyncStorage.setItem('app_push_token', token);
      }

      setPermissionStatus('granted');
    } finally {
      setRegistering(false);
      refresh();
    }
  };

  const handleCancelAll = async () => {
    setCancelling(true);
    try {
      await cancelAllScheduledNotifications();
      setScheduledCount(0);
      Alert.alert('Done', 'All scheduled reminders have been cancelled.');
    } finally {
      setCancelling(false);
    }
  };

  // Colour and icon based on current permission status
  const statusColor = permissionStatus === 'granted' ? Colors.success
                    : permissionStatus === 'denied'  ? Colors.error
                    : Colors.warning;

  const statusIcon  = permissionStatus === 'granted' ? 'checkmark-circle'
                    : permissionStatus === 'denied'  ? 'close-circle'
                    : 'help-circle';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Permission status card ────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>NOTIFICATION PERMISSION</Text>

        <View style={[styles.permRow, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
          <Ionicons name={statusIcon as any} size={26} color={statusColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.permStatus, { color: statusColor }]}>
              {permissionStatus.charAt(0).toUpperCase() + permissionStatus.slice(1)}
            </Text>
            <Text style={styles.permDesc}>
              {permissionStatus === 'granted'
                ? 'Your device is registered and ready to receive push notifications.'
                : permissionStatus === 'denied'
                ? 'Notifications are blocked. Tap below to open your device settings.'
                : 'Permission not yet requested. Tap below to enable notifications.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, registering && styles.btnDisabled]}
          onPress={handleRequestPermission}
          disabled={registering}
        >
          {registering
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <>
                <Ionicons name="notifications-outline" size={18} color={Colors.white} />
                <Text style={styles.btnText}>
                  {permissionStatus === 'granted' ? 'Re-register Device' : 'Enable Notifications'}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* ── Device info card ─────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DEVICE INFO</Text>

        <View style={styles.infoRow}>
          <Ionicons name="phone-portrait-outline" size={16} color={Colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Device ID</Text>
            <Text style={styles.infoValue} selectable numberOfLines={2}>{deviceId || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="key-outline" size={16} color={Colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Expo Push Token</Text>
            <Text style={styles.infoValue} selectable numberOfLines={3}>
              {pushToken || 'Not registered yet — enable notifications above'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Scheduled reminders card ──────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SCHEDULED REMINDERS</Text>

        <View style={styles.countRow}>
          <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
          <Text style={styles.countText}>
            {scheduledCount} reminder{scheduledCount !== 1 ? 's' : ''} currently scheduled
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnOutline, (cancelling || scheduledCount === 0) && styles.btnDisabled]}
          onPress={handleCancelAll}
          disabled={cancelling || scheduledCount === 0}
        >
          {cancelling
            ? <ActivityIndicator color={Colors.error} size="small" />
            : <>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                <Text style={[styles.btnText, { color: Colors.error }]}>Cancel All Reminders</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* ── Info note ─────────────────────────────────────────── */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.infoNote}>
          Remote push notifications require a real Android device running Expo Go.
          Local reminders work on both emulator and real device.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, gap: 14, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 16, gap: 12,
  },
  cardTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },

  permRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 10, borderWidth: 1, padding: 12,
  },
  permStatus: { fontSize: 15, fontWeight: '700' },
  permDesc:   { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    borderRadius: 10, paddingVertical: 12,
  },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: Colors.error,
    borderRadius: 10, paddingVertical: 12,
  },
  btnDisabled: { opacity: 0.4 },
  btnText:     { color: Colors.white, fontSize: 14, fontWeight: '700' },

  infoRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoLabel: { fontSize: 11, color: Colors.textMuted, letterSpacing: 0.5 },
  infoValue: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  divider:   { height: 1, backgroundColor: Colors.border },

  countRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  infoCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10, padding: 12,
  },
  infoNote: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
