/**
 * api/index.ts
 * All HTTP calls to the OrderUpdateApp backend.
 * BASE_URL and API_KEY are read from environment variables.
 */

import { Order, OrderStatus } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY  = process.env.EXPO_PUBLIC_API_KEY  || '';

/** Generic authenticated request helper */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    API_KEY,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Token ────────────────────────────────────────────────────────────────────

/** Register this device's Expo push token with the backend */
export async function registerToken(deviceId: string, token: string): Promise<void> {
  await fetch(`${BASE_URL}/tokens`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ deviceId, token }),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(
  customerName: string,
  item:         string,
  deviceId:     string,
): Promise<Order> {
  const data = await fetch(`${BASE_URL}/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ customerName, item, deviceId }),
  });
  const json = await data.json();
  return json.order as Order;
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await fetch(`${BASE_URL}/orders`);
  const json = await data.json();
  return (json.orders || []) as Order[];
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const data = await fetch(`${BASE_URL}/orders/${orderId}`);
  const json = await data.json();
  return json.order as Order;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status:  OrderStatus,
): Promise<{ order: Order }> {
  return request<{ order: Order }>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body:   JSON.stringify({ status }),
  });
}

export async function sendBroadcast(title: string, body: string): Promise<void> {
  await request('/notify/broadcast', {
    method: 'POST',
    body:   JSON.stringify({ title, body }),
  });
}

export async function sendToDevice(
  deviceId: string,
  title:    string,
  body:     string,
): Promise<void> {
  await request('/notify/device', {
    method: 'POST',
    body:   JSON.stringify({ deviceId, title, body }),
  });
}
