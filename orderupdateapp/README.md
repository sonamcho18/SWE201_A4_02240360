# OrderUpdateApp

A full-stack food delivery order tracking application with real-time push notifications. The backend uses Node.js + Express with SQLite, and the frontend is built with React Native (Expo SDK 54) and TypeScript.

## Architecture Overview

- Frontend: React Native (Expo) mobile app
- Backend: Node.js + Express REST API
- Database: SQLite
- Notifications: Expo Push API

## Tech Stack

### Backend
- Node.js + Express
- better-sqlite3
- expo-server-sdk
- dotenv

### Frontend
- React Native (Expo SDK 54)
- TypeScript
- Expo Notifications
- Axios

## Folder Structure

```
OrderUpdateApp/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── db/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   └── pushService.js
│   │   ├── controllers/
│   │   │   ├── tokenController.js
│   │   │   ├── orderController.js
│   │   │   └── notifyController.js
│   │   └── routes/
│   │       ├── tokenRoutes.js
│   │       ├── orderRoutes.js
│   │       └── notifyRoutes.js
│   ├── data/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── App.tsx
│   ├── app.json
│   ├── eas.json
│   ├── src/
│   │   ├── api/
│   │   ├── constants/
│   │   ├── navigation/
│   │   ├── notifications/
│   │   ├── screens/
│   │   └── types/
│   └── .env.example
│
└── README.md
```

## Database Schema

SQLite file created at `backend/data/orderupdateapp.db`

```sql
tokens (
    device_id TEXT PRIMARY KEY,
    token TEXT,
    user_id TEXT,
    created_at TEXT
)

orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    item TEXT,
    status TEXT,
    device_id TEXT,
    created_at TEXT,
    updated_at TEXT
)
```

Valid order statuses: `placed`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=4000
API_KEY=mysecretkey123
```

4. Start the server:
```bash
npm run dev
# or
npm start
```

The server runs on `http://localhost:4000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
EXPO_PUBLIC_API_KEY=mysecretkey123
```

4. Start the app:
```bash
npx expo start
```

5. Scan QR code with Expo Go app on your phone

## API Endpoints

### Health Check
```
GET /health
```

### Tokens
```
POST /tokens/register
GET /tokens
```

### Orders
```
POST /orders
GET /orders
GET /orders/:id
PATCH /orders/:id/status
GET /orders/device/:deviceId
```

### Notifications (require API key header)
```
POST /notify/broadcast
POST /notify/device
```

## Testing with cURL

### Health check
```bash
curl http://localhost:4000/health
```

### Create an order
```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Sdgc","item":"Butter Chicken with Naan","deviceId":"device-123"}'
```

### Update order status
```bash
curl -X PATCH http://localhost:4000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretkey123" \
  -d '{"status":"out_for_delivery"}'
```

### Broadcast notification to all devices
```bash
curl -X POST http://localhost:4000/notify/broadcast \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretkey123" \
  -d '{"title":"Special Offer","body":"Free delivery today!"}'
```

### Send notification to a single device
```bash
curl -X POST http://localhost:4000/notify/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecretkey123" \
  -d '{"deviceId":"device-123","title":"Order Update","body":"Your order is ready"}'
```

## Testing Notifications on Device

1. Open the app on your phone
2. Go to Alerts/Settings tab and enable notifications
3. Place a new order from the Order tab
4. View the order in Orders list and tap to see details
5. Use the Admin tab to update order status - push notification will be sent immediately
6. Tap the notification to navigate to the order detail screen

## Building Android APK

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS build:
```bash
eas build:configure
```

4. Copy the EAS Project ID and paste it into `app.json`:
```json
"extra": { "eas": { "projectId": "YOUR_PROJECT_ID" } }
```

5. Build the APK:
```bash
eas build --platform android --profile preview
```

For detailed information and screenshots, their is each readme for backend and frontend with all the required screenshots and information.

[frontend link](frontend/README.md)

[backend link](backend/README.md)