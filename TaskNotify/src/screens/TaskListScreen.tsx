import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../services/storageService';
import { cancelNotification } from '../notifications/notificationService';
import { Task, RootStackParamList } from '../types';
import { formatDate, formatDateTime } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TaskListScreen() {
  const navigation = useNavigation<Nav>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    const all = await StorageService.getTasks();
    setTasks(all.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setLoading(false);
  }

  async function handleDelete(task: Task) {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (task.notificationId) await cancelNotification(task.notificationId);
          await StorageService.deleteTask(task.id);
          load();
        },
      },
    ]);
  }

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="clipboard-outline" size={56} color="#d1d5db" />
            <Text style={s.emptyTitle}>No Tasks Yet</Text>
            <Text style={s.emptyText}>Tap + to create your first task</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPast = new Date(item.dueDate) < new Date();
          return (
            <View style={s.card}>
              <TouchableOpacity style={s.cardTop} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
                <View style={[s.dot, isPast ? s.dotPast : s.dotUp]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.cardMeta}><Ionicons name="calendar-outline" size={11} /> {formatDate(item.dueDate)}</Text>
                  <Text style={s.cardMeta}><Ionicons name="alarm-outline" size={11} /> {formatDateTime(item.reminderDate)}</Text>
                </View>
                <View style={s.badge}>
                  <Ionicons name={item.notificationEnabled ? 'notifications' : 'notifications-off-outline'} size={14} color={item.notificationEnabled ? '#2563EB' : '#9ca3af'} />
                  <Text style={[s.badgeText, { color: item.notificationEnabled ? '#2563EB' : '#9ca3af' }]}>
                    {item.notificationEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('EditTask', { taskId: item.id })}>
                  <Ionicons name="create-outline" size={17} color="#2563EB" />
                  <Text style={[s.actionText, { color: '#2563EB' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={17} color="#dc2626" />
                  <Text style={[s.actionText, { color: '#dc2626' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddTask')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 10 },
  dotUp: { backgroundColor: '#2563EB' },
  dotPast: { backgroundColor: '#9ca3af' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  actionText: { fontSize: 13, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#9ca3af', marginTop: 6 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
