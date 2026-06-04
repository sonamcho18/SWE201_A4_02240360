import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StorageService } from '../services/storageService';
import { scheduleNotification, cancelNotification } from '../notifications/notificationService';
import { RootStackParamList, Task } from '../types';

type EditRoute = RouteProp<RootStackParamList, 'EditTask'>;

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const { taskId } = useRoute<EditRoute>().params;

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDue, setShowDue] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    StorageService.getTaskById(taskId).then((t) => {
      if (t) {
        setTask(t); setTitle(t.title); setDescription(t.description);
        setDueDate(new Date(t.dueDate)); setReminderDate(new Date(t.reminderDate));
        setNotifEnabled(t.notificationEnabled);
      }
    });
  }, [taskId]);

  const fmt = (d: Date) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Required', 'Title is required.'); return; }
    if (!task) return;
    setLoading(true);
    try {
      if (task.notificationId) await cancelNotification(task.notificationId);
      let newId: string | undefined;
      if (notifEnabled) {
        const id = await scheduleNotification(task.id, `Reminder: ${title.trim()}`, description.trim() || 'Task due soon!', reminderDate);
        if (id) newId = id;
      }
      const updated: Task = { ...task, title: title.trim(), description: description.trim(), dueDate: dueDate.toISOString(), reminderDate: reminderDate.toISOString(), notificationEnabled: notifEnabled, notificationId: newId, updatedAt: new Date().toISOString() };
      await StorageService.updateTask(updated);
      Alert.alert('Updated!', 'Task saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  if (!task) return <View style={s.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.label}>TITLE *</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor="#9ca3af" />

      <Text style={s.label}>DESCRIPTION</Text>
      <TextInput style={[s.input, s.textarea]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top" />

      <Text style={s.label}>DUE DATE & TIME</Text>
      <TouchableOpacity style={s.dateBtn} onPress={() => setShowDue(true)}>
        <Ionicons name="calendar-outline" size={18} color="#2563EB" />
        <Text style={s.dateText}>{fmt(dueDate)}</Text>
        <Ionicons name="chevron-down" size={16} color="#9ca3af" />
      </TouchableOpacity>
      {showDue && (
        <DateTimePicker value={dueDate} mode="datetime" display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={(_, d) => { setShowDue(false); if (d) setDueDate(d); }} />
      )}

      <Text style={s.label}>REMINDER DATE & TIME</Text>
      <TouchableOpacity style={s.dateBtn} onPress={() => setShowReminder(true)}>
        <Ionicons name="alarm-outline" size={18} color="#2563EB" />
        <Text style={s.dateText}>{fmt(reminderDate)}</Text>
        <Ionicons name="chevron-down" size={16} color="#9ca3af" />
      </TouchableOpacity>
      {showReminder && (
        <DateTimePicker value={reminderDate} mode="datetime" display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={(_, d) => { setShowReminder(false); if (d) setReminderDate(d); }} />
      )}

      <View style={s.toggle}>
        <View>
          <Text style={s.toggleLabel}>Enable Reminder</Text>
          <Text style={s.toggleSub}>Reschedule notification</Text>
        </View>
        <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: '#d1d5db', true: '#bfdbfe' }} thumbColor={notifEnabled ? '#2563EB' : '#9ca3af'} />
      </View>

      <TouchableOpacity style={[s.saveBtn, loading && s.disabled]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="save-outline" size={20} color="#fff" />}
        <Text style={s.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 16, marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  textarea: { height: 80 },
  dateBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  dateText: { flex: 1, fontSize: 14, color: '#111827' },
  toggle: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
