import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storageService';
import { scheduleNotification, cancelNotification } from '../notifications/notificationService';
import { Task, RootStackParamList } from '../types';
import { formatDateTime } from '../utils/helpers';

type DetailRoute = RouteProp<RootStackParamList, 'TaskDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TaskDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { taskId } = useRoute<DetailRoute>().params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => { load(); }, [taskId]);

  async function load() {
    setLoading(true);
    const t = await StorageService.getTaskById(taskId);
    setTask(t ?? null);
    setLoading(false);
  }

  async function handleUpdateReminder() {
    if (!task) return;
    setActing(true);
    try {
      if (task.notificationId) await cancelNotification(task.notificationId);
      const id = await scheduleNotification(task.id, `Reminder: ${task.title}`, task.description || 'Task due soon!', new Date(task.reminderDate));
      const updated = { ...task, notificationEnabled: true, notificationId: id ?? undefined, updatedAt: new Date().toISOString() };
      await StorageService.updateTask(updated);
      setTask(updated);
      Alert.alert('Updated', 'Reminder rescheduled!');
    } finally { setActing(false); }
  }

  async function handleCancelReminder() {
    if (!task) return;
    setActing(true);
    try {
      if (task.notificationId) await cancelNotification(task.notificationId);
      const updated = { ...task, notificationEnabled: false, notificationId: undefined, updatedAt: new Date().toISOString() };
      await StorageService.updateTask(updated);
      setTask(updated);
      Alert.alert('Cancelled', 'Reminder removed.');
    } finally { setActing(false); }
  }

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  if (!task) return <View style={s.center}><Ionicons name="alert-circle-outline" size={48} color="#dc2626" /><Text style={s.notFound}>Task not found</Text></View>;

  const isPast = new Date(task.dueDate) < new Date();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.headerCard}>
        <View style={s.statusRow}>
          <View style={[s.dot, isPast ? s.dotPast : s.dotUp]} />
          <Text style={s.statusLabel}>{isPast ? 'Past Due' : 'Upcoming'}</Text>
        </View>
        <Text style={s.taskTitle}>{task.title}</Text>
        <Text style={task.description ? s.desc : s.noDesc}>{task.description || 'No description provided'}</Text>
      </View>

      <View style={s.detailCard}>
        {[
          { icon: 'calendar', label: 'Due Date', value: formatDateTime(task.dueDate) },
          { icon: 'alarm', label: 'Reminder', value: formatDateTime(task.reminderDate) },
          { icon: task.notificationEnabled ? 'notifications' : 'notifications-off', label: 'Notifications', value: task.notificationEnabled ? 'Enabled' : 'Disabled', color: task.notificationEnabled ? '#16a34a' : '#dc2626' },
          { icon: 'time', label: 'Created', value: formatDateTime(task.createdAt) },
        ].map((row, i) => (
          <React.Fragment key={row.label}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.detailRow}>
              <View style={s.detailLeft}>
                <Ionicons name={row.icon as any} size={15} color="#6b7280" />
                <Text style={s.detailLabel}>{row.label}</Text>
              </View>
              <Text style={[s.detailValue, row.color ? { color: row.color } : {}]}>{row.value}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditTask', { taskId: task.id })}>
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={s.editBtnText}>Edit Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.reminderBtn, acting && s.disabled]} onPress={handleUpdateReminder} disabled={acting}>
        {acting ? <ActivityIndicator size="small" color="#2563EB" /> : <Ionicons name="refresh-circle-outline" size={18} color="#2563EB" />}
        <Text style={s.reminderBtnText}>Update Reminder</Text>
      </TouchableOpacity>

      {task.notificationEnabled && (
        <TouchableOpacity style={[s.cancelBtn, acting && s.disabled]} onPress={handleCancelReminder} disabled={acting}>
          <Ionicons name="notifications-off-outline" size={18} color="#dc2626" />
          <Text style={s.cancelBtnText}>Cancel Reminder</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#dc2626', marginTop: 12 },
  headerCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, elevation: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotUp: { backgroundColor: '#2563EB' },
  dotPast: { backgroundColor: '#9ca3af' },
  statusLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  taskTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  noDesc: { fontSize: 14, color: '#9ca3af', fontStyle: 'italic' },
  detailCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#111827', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#f3f4f6' },
  editBtn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  reminderBtn: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, borderWidth: 1, borderColor: '#bfdbfe' },
  reminderBtnText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fecaca' },
  cancelBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
