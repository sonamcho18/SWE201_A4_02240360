/**
 * screens/AdminScreen.tsx
 * Admin panel for:
 *  - Advancing an order's status (each step triggers a remote push notification)
 *  - Sending a broadcast push to all registered devices
 */

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { useFocusEffect }   from '@react-navigation/native';
import { Ionicons }         from '@expo/vector-icons';
import { fetchOrders, updateOrderStatus, sendBroadcast } from '../api';
import { Order, OrderStatus } from '../types';
import { Colors, STATUS_CONFIG, ORDER_STATUS_SEQUENCE } from '../constants';

export default function AdminScreen() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [bTitle, setBTitle]             = useState('');
  const [bBody, setBBody]               = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId + status);
    try {
      await updateOrderStatus(orderId, status);
      Alert.alert('Updated', `Status changed to "${STATUS_CONFIG[status].label}" and push notification sent.`);
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Update failed. Check your API key in .env');
    } finally {
      setUpdating(null);
    }
  };

  const handleBroadcast = async () => {
    if (!bTitle.trim() || !bBody.trim()) {
      Alert.alert('Missing Fields', 'Please enter both a title and body.');
      return;
    }
    setBroadcasting(true);
    try {
      await sendBroadcast(bTitle.trim(), bBody.trim());
      Alert.alert('Sent', 'Broadcast notification sent to all registered devices.');
      setBTitle('');
      setBBody('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Broadcast failed. Check your API key in .env');
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Broadcast panel ──────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="megaphone-outline" size={18} color={Colors.primary} />
          <Text style={styles.cardTitle}>Broadcast to All Devices</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Notification title"
          placeholderTextColor={Colors.textMuted}
          value={bTitle}
          onChangeText={setBTitle}
        />
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Notification body"
          placeholderTextColor={Colors.textMuted}
          value={bBody}
          onChangeText={setBBody}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.actionBtn, (broadcasting || !bTitle || !bBody) && styles.actionBtnDisabled]}
          onPress={handleBroadcast}
          disabled={broadcasting || !bTitle.trim() || !bBody.trim()}
        >
          {broadcasting
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <>
                <Ionicons name="send-outline" size={16} color={Colors.white} />
                <Text style={styles.actionBtnText}>Send to All Devices</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* ── Order list ───────────────────────────────────────── */}
      <Text style={styles.sectionHeader}>MANAGE ORDERS</Text>

      {orders.length === 0 && (
        <Text style={styles.emptyText}>No orders to manage yet.</Text>
      )}

      {orders.map((order) => {
        const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(order.status);

        return (
          <View key={order.id} style={styles.card}>
            <View style={styles.orderHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.orderMeta} numberOfLines={1}>
                  {order.customerName} · {order.item}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_CONFIG[order.status].color + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_CONFIG[order.status].color }]}>
                  {STATUS_CONFIG[order.status].label}
                </Text>
              </View>
            </View>

            <Text style={styles.chipLabel}>ADVANCE TO NEXT STATUS</Text>

            {/* Status chips — only the next status is tappable */}
            <View style={styles.statusRow}>
              {ORDER_STATUS_SEQUENCE.map((status, idx) => {
                const cfg        = STATUS_CONFIG[status];
                const isNext     = idx === currentIdx + 1;
                const isPast     = idx <= currentIdx;
                const isUpdating = updating === order.id + status;

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusChip,
                      isPast  && styles.statusChipPast,
                      isNext  && { backgroundColor: cfg.color + '22', borderColor: cfg.color },
                    ]}
                    disabled={!isNext || !!updating}
                    onPress={() => handleStatusUpdate(order.id, status)}
                  >
                    {isUpdating
                      ? <ActivityIndicator color={cfg.color} size="small" />
                      : <Ionicons
                          name={cfg.iconName as any}
                          size={18}
                          color={isPast ? Colors.textMuted : isNext ? cfg.color : Colors.textMuted}
                        />
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.hint}>Tap the lit chip to advance status and send a push notification</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, gap: 14, paddingBottom: 40 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

  sectionHeader: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4 },
  emptyText:     { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 14, gap: 10,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle:    { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  input: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: Colors.textPrimary,
  },
  inputMulti: { height: 72, textAlignVertical: 'top' },

  actionBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12 },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText:     { color: Colors.white, fontSize: 14, fontWeight: '700' },

  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderId:        { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  orderMeta:      { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:      { fontSize: 11, fontWeight: '700' },

  chipLabel:  { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  statusRow:  { flexDirection: 'row', gap: 8 },
  statusChip: {
    flex: 1, height: 44, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center', alignItems: 'center',
  },
  statusChipPast: { opacity: 0.3 },
  hint:           { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
});
