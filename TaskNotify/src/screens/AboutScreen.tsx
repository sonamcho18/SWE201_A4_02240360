import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STACK = [
  { icon: 'logo-react', label: 'React Native 0.81', sub: 'Mobile framework' },
  { icon: 'code-slash', label: 'Expo SDK 54', sub: 'Development platform' },
  { icon: 'notifications', label: 'Expo Notifications', sub: 'Push & local notifications' },
  { icon: 'git-network', label: 'React Navigation', sub: 'Stack + Tab navigation' },
  { icon: 'server', label: 'Node.js + Express', sub: 'Backend REST API' },
  { icon: 'leaf', label: 'MongoDB Atlas', sub: 'Cloud database (Free tier)' },
  { icon: 'cloud', label: 'Render', sub: 'Backend hosting (Free tier)' },
  { icon: 'save', label: 'AsyncStorage', sub: 'Local task persistence' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.logoSection}>
        <View style={s.logoIcon}>
          <Ionicons name="checkmark-circle" size={52} color="#fff" />
        </View>
        <Text style={s.appName}>TaskNotify</Text>
        <Text style={s.version}>Version 1.0.0</Text>
      </View>

      <View style={s.infoCard}>
        {[
          { label: 'Project', value: 'TaskNotify' },
          { label: 'Assignment', value: 'SWE201 — Assignment 4' },
          { label: 'Category', value: 'Push Notification Mobile App' },
          { label: 'Platform', value: 'Android (Expo SDK 54)' },
        ].map((row, i, arr) => (
          <React.Fragment key={row.label}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{row.label}</Text>
              <Text style={s.infoValue}>{row.value}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.divider} />}
          </React.Fragment>
        ))}
      </View>

      <Text style={s.sectionTitle}>TECHNOLOGY STACK</Text>
      <View style={s.stackCard}>
        {STACK.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.stackRow}>
              <View style={s.stackIcon}>
                <Ionicons name={item.icon as any} size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={s.stackLabel}>{item.label}</Text>
                <Text style={s.stackSub}>{item.sub}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoIcon: { width: 90, height: 90, borderRadius: 22, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 12 },
  appName: { fontSize: 26, fontWeight: '700', color: '#111827' },
  version: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  divider: { height: 1, backgroundColor: '#f3f4f6' },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8, letterSpacing: 0.5 },
  stackCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1, marginBottom: 24 },
  stackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  stackIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stackLabel: { fontSize: 14, fontWeight: '500', color: '#111827' },
  stackSub: { fontSize: 12, color: '#6b7280', marginTop: 1 },
});
