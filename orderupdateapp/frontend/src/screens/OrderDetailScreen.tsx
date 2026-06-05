/**
 * screens/OrderDetailScreen.tsx
 * Shows the full details of one order including:
 *  - Order ID, item, customer, timestamp
 *  - Step-by-step status tracker
 *  - Local reminder notification scheduling / cancellation
 *
 * This screen is also the deep-link destination when the user taps a push notification.
 */

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrder } from '../api';
import { Order }      from '../types';
import { Colors, STATUS_CONFIG, ORDER_STATUS_SEQUENCE } from '../constants';
import { RootStackParamList } from '../types';
import {
  scheduleOrderReminder,
  cancelScheduledNotification,
  getAllScheduled,
} from '../notifications';

type Route = RouteProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const route             = useRoute<Route>();
  const { orderId }       = route.params;

  const [order, setOrder]             = useState<Order | null>(null);
  const [loading, setLoading]         = useState(true);
  const [scheduledId, setScheduledId] = useState<string | null>(null);
  const [scheduling, setScheduling]   = useState(false);

  const load = useCallback(async () => {
    try {
      const o = await fetchOrder(orderId);
      setOrder(o);
    } catch {
      Alert.alert('Error', 'Could not load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  /** Check whether a local reminder is already scheduled for this order */
  const checkScheduled = useCallback(async () => {
    const all   = await getAllScheduled();
    const found = all.find((n) => (n.content.data as any)?.orderId === orderId);
    setScheduledId(found ? found.identifier : null);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
      checkScheduled();
    }, [load, checkScheduled]),
  );

  const handleScheduleReminder = async () => {
    if (!order) return;
    setScheduling(true);
    try {
      // 10 seconds for easy demo — in production this would be minutes/hours
      const id = await scheduleOrderReminder(order.id, order.item, 10);
      setScheduledId(id);
      Alert.alert('Reminder Set', 'You will be reminded about this order in 10 seconds.');
    } catch {
      Alert.alert('Error', 'Could not schedule reminder.');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelReminder = async () => {
    if (!scheduledId) return;
    setScheduling(true);
    try {
      await cancelScheduledNotification(scheduledId);
      setScheduledId(null);
      Alert.alert('Cancelled', 'The order reminder has been removed.');
    } catch {
      Alert.alert('Error', 'Could not cancel reminder.');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStep = STATUS_CONFIG[order.status].step;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Order summary card ────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>ORDER ID</Text>
            <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[order.status].color + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_CONFIG[order.status].color }]}>
              {STATUS_CONFIG[order.status].label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Ionicons name="fast-food-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.detailText}>{order.item}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.detailText}>{order.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.detailText}>
            {new Date(order.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* ── Status tracker ────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Progress</Text>

        {ORDER_STATUS_SEQUENCE.map((status, idx) => {
          const cfg       = STATUS_CONFIG[status];
          const isDone    = cfg.step < currentStep;
          const isCurrent = cfg.step === currentStep;
          const isLast    = idx === ORDER_STATUS_SEQUENCE.length - 1;

          return (
            <View key={status} style={styles.stepRow}>
              <View style={styles.stepLineCol}>
                <View style={[
                  styles.stepCircle,
                  isDone    && styles.stepDone,
                  isCurrent && { backgroundColor: cfg.color, borderColor: cfg.color },
                ]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={14} color={Colors.white} />
                    : <Ionicons name={cfg.iconName as any} size={14} color={isCurrent ? Colors.white : Colors.textMuted} />
                  }
                </View>
                {!isLast && (
                  <View style={[styles.stepLine, { backgroundColor: isDone ? Colors.success : Colors.border }]} />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepLabel,
                  isDone    && { color: Colors.success },
                  isCurrent && { color: cfg.color, fontWeight: '700' },
                  !isDone && !isCurrent && { color: Colors.textMuted },
                ]}>
                  {cfg.label}
                </Text>
                {isCurrent && <Text style={styles.stepSubLabel}>Current status</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Local reminder ────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Local Reminder</Text>
        <Text style={styles.reminderDesc}>
          Schedule a local notification reminder for this order. Fires after 10 seconds (demo).
        </Text>

        {scheduledId ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={handleCancelReminder}
            disabled={scheduling}
          >
            {scheduling
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <>
                  <Ionicons name="notifications-off-outline" size={18} color={Colors.white} />
                  <Text style={styles.btnText}>Cancel Reminder</Text>
                </>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btn}
            onPress={handleScheduleReminder}
            disabled={scheduling}
          >
            {scheduling
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <>
                  <Ionicons name="notifications-outline" size={18} color={Colors.white} />
                  <Text style={styles.btnText}>Set 10s Reminder</Text>
                </>
            }
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 16, gap: 14, paddingBottom: 40 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12 },
  errorText: { fontSize: 16, color: Colors.error },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },

  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label:       { fontSize: 11, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  orderId:     { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText:  { fontSize: 12, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: Colors.border },

  row:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },

  stepRow:     { flexDirection: 'row', gap: 12, minHeight: 52 },
  stepLineCol: { alignItems: 'center', width: 32 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  stepDone:    { backgroundColor: Colors.success, borderColor: Colors.success },
  stepLine:    { flex: 1, width: 2, marginVertical: 2 },
  stepContent: { flex: 1, paddingTop: 6 },
  stepLabel:   { fontSize: 14, fontWeight: '500' },
  stepSubLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    borderRadius: 12, paddingVertical: 13, marginTop: 4,
  },
  btnDanger: { backgroundColor: Colors.error },
  btnText:   { color: Colors.white, fontSize: 15, fontWeight: '700' },

  reminderDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
