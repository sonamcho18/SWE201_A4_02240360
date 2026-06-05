/**
 * screens/PlaceOrderScreen.tsx
 * Lets the user enter their name, select a menu item, and place a new order.
 * On success, the order is created in the backend and the user is prompted
 * to check the Orders tab.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons }   from '@expo/vector-icons';
import AsyncStorage   from '@react-native-async-storage/async-storage';
import { createOrder } from '../api';
import { Colors, MENU_ITEMS } from '../constants';

export default function PlaceOrderScreen() {
  const [customerName, setCustomerName] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [placed, setPlaced]             = useState(false);

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to place an order.');
      return;
    }
    if (!selectedItem) {
      Alert.alert('Item Required', 'Please select a menu item.');
      return;
    }

    setLoading(true);
    try {
      const deviceId = (await AsyncStorage.getItem('app_device_id')) || 'unknown-device';
      await createOrder(customerName.trim(), selectedItem, deviceId);
      setPlaced(true);
      setCustomerName('');
      setSelectedItem(null);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to place order. Check your connection and .env settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name input */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>YOUR NAME</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            value={customerName}
            onChangeText={setCustomerName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SELECT ITEM</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => {
            const selected = item === selectedItem;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.menuItem, selected && styles.menuItemSelected]}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="fast-food-outline"
                  size={16}
                  color={selected ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.menuItemText, selected && styles.menuItemTextSelected]}>
                  {item}
                </Text>
                {selected && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Place order button */}
      <TouchableOpacity
        style={[styles.placeBtn, (loading || !customerName || !selectedItem) && styles.placeBtnDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading || !customerName.trim() || !selectedItem}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <>
              <Ionicons name="bag-check-outline" size={20} color={Colors.white} />
              <Text style={styles.placeBtnText}>Place Order</Text>
            </>
        }
      </TouchableOpacity>

      {/* Success banner */}
      {placed && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.successText}>Order placed! Check the Orders tab to track it.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 20, gap: 24, paddingBottom: 40 },

  section:      {},
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 15, color: Colors.textPrimary },

  menuGrid: { gap: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  menuItemSelected:     { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  menuItemText:         { flex: 1, fontSize: 14, color: Colors.textSecondary },
  menuItemTextSelected: { color: Colors.textPrimary, fontWeight: '600' },

  placeBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16 },
  placeBtnDisabled: { opacity: 0.4 },
  placeBtnText:     { color: Colors.white, fontSize: 16, fontWeight: '700' },

  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.success + '20',
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.success + '40',
  },
  successText: { flex: 1, fontSize: 13, color: Colors.success },
});
