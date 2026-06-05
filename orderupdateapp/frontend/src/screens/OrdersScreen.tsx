/**
 * screens/OrdersScreen.tsx
 * Displays all orders in a scrollable list, newest first.
 * Each card shows the item, customer name, status badge, and timestamp.
 * Tapping a card navigates to OrderDetailScreen.
 */

import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp }     from '@react-navigation/native-stack';
import { Ionicons }                      from '@expo/vector-icons';
import { fetchOrders }                   from '../api';
import { Order }                         from '../types';
import { Colors, STATUS_CONFIG }         from '../constants';
import { RootStackParamList }            from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function OrdersScreen() {
  const navigation               = useNavigation<Nav>();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload list every time this tab comes into focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item }: { item: Order }) => {
    const cfg = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: cfg.color + '22' }]}>
            <Ionicons name={cfg.iconName as any} size={22} color={cfg.color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.item}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '44' }]}>
            <View style={[styles.dot, { backgroundColor: cfg.color }]} />
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bag-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Place an order from the Order tab</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  list:           { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox:      { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo:     { flex: 1 },
  itemName:     { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  customerName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  badgeText:  { fontSize: 12, fontWeight: '600' },
  timeText:   { fontSize: 11, color: Colors.textMuted },

  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120, gap: 8 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary },
});
