import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPermissionStatus, requestPermission, getExpoPushToken, scheduleNotification } from '../notifications/notificationService';

export default function SettingsScreen() {
  const [permStatus, setPermStatus] = useState('unknown');
  const [pushToken, setPushToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(true);

  useFocusEffect(useCallback(() => { loadStatus(); }, []));

  async function loadStatus() {
    const status = await getPermissionStatus();
    setPermStatus(status);
    if (status === 'granted') {
      const token = await getExpoPushToken();
      setPushToken(token ?? '');
    }
  }

  async function handleRequestPermission() {
    setLoading(true);
    try {
      const status = await requestPermission();
      setPermStatus(status);
      if (status === 'granted') {
        const token = await getExpoPushToken();
        setPushToken(token ?? '');
      } else if (status === 'denied') {
        Alert.alert('Permission Denied', 'Please enable notifications in your device Settings.', [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } finally { setLoading(false); }
  }

  async function handleTestNotification() {
    setTestLoading(true);
    try {
      const id = await scheduleNotification('settings-test', 'Test Notification', 'Notifications are working correctly!', new Date(Date.now() + 3000));
      Alert.alert('Scheduled', id ? 'Notification in 3 seconds!' : 'Failed — is permission granted?');
    } finally { setTestLoading(false); }
  }

  const statusColor = permStatus === 'granted' ? '#16a34a' : permStatus === 'denied' ? '#dc2626' : '#d97706';
  const statusIcon = permStatus === 'granted' ? 'checkmark-circle' : permStatus === 'denied' ? 'close-circle' : 'help-circle';
  const statusText = permStatus === 'granted' ? 'Granted' : permStatus === 'denied' ? 'Denied' : 'Not Determined';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <Text style={s.sectionTitle}>NOTIFICATION PERMISSIONS</Text>
      <View style={s.card}>
        <View style={s.row}>
          <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          <Text style={s.rowLabel}>Status:</Text>
          <Text style={[s.rowValue, { color: statusColor }]}>{statusText}</Text>
        </View>
        {permStatus === 'denied' && (
          <View style={s.warning}>
            <Ionicons name="warning-outline" size={15} color="#d97706" />
            <Text style={s.warningText}>Notifications blocked. Open Settings to enable.</Text>
          </View>
        )}
        <TouchableOpacity style={[s.btn, loading && s.disabled]} onPress={handleRequestPermission} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />}
          <Text style={s.btnText}>{permStatus === 'denied' ? 'Open Settings' : 'Request Permission'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>EXPO PUSH TOKEN</Text>
      <View style={s.card}>
        <View style={s.row}>
          <Ionicons name="key-outline" size={16} color="#6b7280" />
          <Text style={s.tokenText} numberOfLines={4}>
            {pushToken || 'Not available — grant permission on a real device'}
          </Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>GLOBAL SETTINGS</Text>
      <View style={s.card}>
        <View style={s.toggleRow}>
          <View>
            <Text style={s.toggleLabel}>Enable All Notifications</Text>
            <Text style={s.toggleSub}>Master toggle for task reminders</Text>
          </View>
          <Switch value={globalEnabled} onValueChange={setGlobalEnabled} trackColor={{ false: '#d1d5db', true: '#bfdbfe' }} thumbColor={globalEnabled ? '#2563EB' : '#9ca3af'} />
        </View>
      </View>

      <Text style={s.sectionTitle}>TEST</Text>
      <TouchableOpacity style={[s.outlineBtn, testLoading && s.disabled]} onPress={handleTestNotification} disabled={testLoading}>
        {testLoading ? <ActivityIndicator size="small" color="#2563EB" /> : <Ionicons name="notifications-outline" size={16} color="#2563EB" />}
        <Text style={s.outlineBtnText}>Send Test Local Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 20, marginBottom: 8, letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  rowLabel: { fontSize: 14, color: '#374151' },
  rowValue: { fontSize: 14, fontWeight: '600' },
  warning: { backgroundColor: '#fffbeb', borderRadius: 8, padding: 10, flexDirection: 'row', gap: 8, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  warningText: { flex: 1, fontSize: 12, color: '#92400e' },
  btn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tokenText: { flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  outlineBtn: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  outlineBtnText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
