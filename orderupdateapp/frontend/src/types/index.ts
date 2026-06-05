// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered';

export interface Order {
  id:           string;
  customerName: string;
  item:         string;
  status:       OrderStatus;
  deviceId:     string;
  createdAt:    string;
  updatedAt:    string | null;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  MainTabs:    undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Orders:      undefined;
  PlaceOrder:  undefined;
  Admin:       undefined;
  Settings:    undefined;
};

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationData {
  orderId?: string;
  status?:  OrderStatus;
  screen?:  string;
}
