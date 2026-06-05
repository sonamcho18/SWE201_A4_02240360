import { OrderStatus } from '../types';

// ─── Color palette ────────────────────────────────────────────────────────────
export const Colors = {
  background:    '#0A0E1A',
  surface:       '#131929',
  surfaceAlt:    '#1A2235',
  border:        '#1E2D45',
  primary:       '#F97316',
  secondary:     '#3B82F6',
  success:       '#22C55E',
  warning:       '#EAB308',
  error:         '#EF4444',
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',
  white:         '#FFFFFF',
};

// ─── Status display config ────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; iconName: string; step: number }
> = {
  placed:           { label: 'Order Placed',     color: Colors.secondary, iconName: 'receipt-outline',          step: 1 },
  confirmed:        { label: 'Confirmed',         color: Colors.warning,   iconName: 'checkmark-circle-outline', step: 2 },
  preparing:        { label: 'Being Prepared',    color: Colors.warning,   iconName: 'restaurant-outline',       step: 3 },
  out_for_delivery: { label: 'Out for Delivery',  color: Colors.primary,   iconName: 'bicycle-outline',          step: 4 },
  delivered:        { label: 'Delivered',         color: Colors.success,   iconName: 'home-outline',             step: 5 },
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

// ─── Sample menu items ────────────────────────────────────────────────────────
export const MENU_ITEMS = [
  'Butter Chicken with Naan',
  'Margherita Pizza (Large)',
  'Beef Burger Combo',
  'Pad Thai Noodles',
  'Sushi Platter (12 pcs)',
  'Caesar Salad Bowl',
  'BBQ Ribs Half Rack',
  'Veggie Wrap Deluxe',
];
