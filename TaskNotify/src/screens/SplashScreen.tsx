import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color="#fff" />
      </View>
      <Text style={styles.title}>TaskNotify</Text>
      <Text style={styles.subtitle}>Smart Task Reminders</Text>
      <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" style={{ marginTop: 48 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 110, height: 110, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 8 },
});
