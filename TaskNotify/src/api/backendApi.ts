import * as Device from 'expo-device';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function registerTokenWithBackend(expoPushToken: string): Promise<void> {
  try {
    const deviceId = Device.modelId ?? Device.deviceName ?? 'unknown-device';
    const res = await fetch(`${API_URL}/api/register-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, expoPushToken }),
    });
    if (!res.ok) console.warn('Token registration failed:', await res.text());
  } catch (e) {
    console.warn('Backend registration error:', e);
  }
}
