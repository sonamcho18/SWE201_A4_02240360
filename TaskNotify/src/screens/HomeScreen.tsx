import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storageService';
import { scheduleNotification, getPermissionStatus } from '../notifications/notificationService';
import { Task, RootStackParamList } from '../types';
import { isUpcoming, formatDateTime } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [permStatus, setPermStatus] = useState('unknown');
  const [testLoading, setTestLoading] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const all = await StorageService.getTasks();
    setTasks(all);
    setPermStatus(await getPermissionStatus());
  }

  const upcoming = tasks.filter((t) => isUpcoming(t.dueDate));
  const withNotif = tasks.filter((t) => t.notificationEnabled);

  async function handleTest() {
    setTestLoading(true);
    try {
      const id = await scheduleNotification('test', 'Test Notification', 'TaskNotify is working!', new Date(Date.now() + 3000));
      Alert.alert('Scheduled', id ? 'Notification in 3 seconds!' : 'Failed to schedule.');
    } finally { setTestLoading(false); }
  }

  const statusColor = permStatus === 'granted' ? '#16a34a' : permStatus === 'denied' ? '#dc2626' : '#d97706';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Ionicons name="checkmark-circle" size={40} color="#2563EB" />
        <Text style={s.title}>TaskNotify</Text>
        <Text style={s.subtitle}>Stay on top of your tasks</Text>
      </View>

      <View style={s.statsRow}>
        {[
          { icon: 'list', color: '#2563EB', value: tasks.length, label: 'Total' },
          { icon: 'time', color: '#f59e0b', value: upcoming.length, label: 'Upcoming' },
          { icon: 'notifications', color: '#16a34a', value: withNotif.length, label: 'Alerts' },
        ].map((item) => (
          <View key={item.label} style={s.statCard}>
            <Ionicons name={item.icon as any} size={20} color={item.color} />
            <Text style={s.statNum}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.statusCard}>
        <Ionicons name="shield-checkmark" size={16} color={statusColor} />
        <Text style={s.statusText}>
          Notifications: <Text style={[s.statusBold, { color: statusColor }]}>{permStatus.toUpperCase()}</Text>
        </Text>
      </View>

      <Text style={s.section}>Quick Actions</Text>

      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('AddTask')}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={s.btnText}>Add New Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.btnOutline, testLoading && s.disabled]} onPress={handleTest} disabled={testLoading}>
        {testLoading ? <ActivityIndicator size="small" color="#2563EB" /> : <Ionicons name="notifications-outline" size={20} color="#2563EB" />}
        <Text style={s.btnOutlineText}>Test Local Notification</Text>
      </TouchableOpacity>

      {upcoming.length > 0 && (
        <>
          <Text style={s.section}>Upcoming Tasks</Text>
          {upcoming.slice(0, 3).map((task) => (
            <TouchableOpacity key={task.id} style={s.taskRow} onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>
              <Ionicons name={task.notificationEnabled ? 'notifications' : 'notifications-off-outline'} size={16} color={task.notificationEnabled ? '#2563EB' : '#9ca3af'} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={s.taskTitle}>{task.title}</Text>
                <Text style={s.taskDate}>Due: {formatDateTime(task.dueDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statusCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 1 },
  statusText: { fontSize: 14, color: '#374151' },
  statusBold: { fontWeight: '600' },
  section: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 },
  btn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnOutline: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: '#bfdbfe' },
  btnOutlineText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  taskRow: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, elevation: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  taskDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
