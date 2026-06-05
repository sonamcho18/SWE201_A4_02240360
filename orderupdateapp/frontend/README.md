# OrderUpdateApp — Frontend

React Native app built with **Expo SDK 54** and **TypeScript**. Tracks food delivery orders with real-time push notifications.

---

## Screenshots

| Screen | What to show |
|--------|---------------|
| Alerts tab | Green "Granted" indicator + push token displayed |
| Orders list | List of orders with coloured status badges |
| Order Detail | 5-step status tracker + Set Reminder button |
| System tray | Push notification on the device |

![alt text](../image/alerts.png)
![alt text](../image/orderlist.png)
![alt text](../image/orderdetails.png)
![alt text](../image/pushnotification.png)

---

## Folder Structure

```
frontend/
├── App.tsx                        Entry point — notification listeners, device bootstrap
├── app.json                       Expo project config (name: OrderUpdateApp)
├── eas.json                       EAS Build config — Android APK only
├── src/
│   ├── api/index.ts               All HTTP calls to the backend
│   ├── constants/index.ts         Colors, status config, menu items
│   ├── navigation/index.tsx       Stack + tab navigator; exports navigationRef
│   ├── notifications/index.ts     All Expo Notifications logic
│   ├── screens/
│   │   ├── OrdersScreen.tsx       List all orders, pull-to-refresh
│   │   ├── OrderDetailScreen.tsx  Status tracker + local reminder
│   │   ├── PlaceOrderScreen.tsx   Create a new order
│   │   ├── AdminScreen.tsx        Advance status + broadcast push
│   │   └── SettingsScreen.tsx     Permission state, token display, cancel reminders
│   └── types/index.ts             Shared TypeScript types
└── assets/                        Icons and splash image
```

---

## Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
EXPO_PUBLIC_API_KEY=mysecretkey123
```

### 3. Start the app
```bash
npx expo start
```
Scan the QR code with **Expo Go** 

---

## EAS Build — Android APK

### One-time setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```
Copy the **EAS Project ID** printed by `eas build:configure` and paste it into `app.json`:
```json
"extra": { "eas": { "projectId": "PASTE_YOUR_ID_HERE" } }
```

### Build
```bash
eas build --platform android --profile preview
```
![alt text](../image/apk.png)
---

## Testing Notifications

1. Open **Alerts** tab → tap **Enable Notifications** → allow on your phone
2. Open **Order** tab → enter your name → select an item → **Place Order**
3. Open **Orders** tab → tap your order → **Order Detail** opens
4. Tap **Set 10s Reminder** → background the app → notification appears in ~10 seconds
5. Open **Admin** tab → find your order → tap the next lit status chip → push sent immediately
6. Tap the notification from the tray → app navigates to that order's detail screen

---

