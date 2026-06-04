# TaskNotify Backend — Express + MongoDB

**RESTful API for Push Notification and Task Management**

A Node.js + Express backend server that manages push tokens, stores tasks, and sends remote push notifications to connected mobile devices. Deployed on Render with MongoDB Atlas as the database.

---

## 🚀 Quick Links

- **Live API**: [https://tasknotify-backend-1gd7.onrender.com](https://tasknotify-backend-1gd7.onrender.com)
- **Frontend Repository**: [TaskNotify Frontend](https://github.com/sonamcho18/SWE201_A4_02240360)
- **Main Assignment Repo**: [SWE201_A4_02240360](https://github.com/sonamcho18/SWE201_A4_02240360)

---

##  Features

-  **Push Token Management** - Register, retrieve, and delete Expo push tokens
-  **Notification Management** - Send push notifications to registered devices
-  **Task Storage** - Store and manage tasks in MongoDB
-  **JWT Authentication** - Secure endpoints with token-based auth
-  **CORS Enabled** - Allows requests from frontend applications
-  **Error Handling** - Comprehensive error responses
-  **Environment Configuration** - Supports local and cloud deployment

---

##  Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 4.x |
| **Database** | MongoDB Atlas | Free Tier |
| **Authentication** | JWT (jsonwebtoken) | Latest |
| **Push Service** | Expo Push API | REST |
| **Hosting** | Render | Free Tier |
| **Environment** | dotenv | Latest |

---

##  Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier)
- Render account (optional, for deployment)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sonamcho18/tasknotify-backend.git
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tasknotify
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   EXPO_API_URL=https://exp.host/--/api/v2
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   Server will run on `http://localhost:3000`

---


## 🔌 API Endpoints

### Base URL
```
https://tasknotify-backend-1gd7.onrender.com
```

### Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Management

#### Register a Push Token
```
POST /api/tokens
Content-Type: application/json

Body:
{
  "expoToken": "ExponentPushToken[...]"
}

Response (200):
{
  "success": true,
  "message": "Token registered successfully",
  "token": {
    "_id": "507f1f77bcf86cd799439011",
    "expoToken": "ExponentPushToken[...]",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

#### Get Token Details
```
GET /api/tokens/:id

Response (200):
{
  "success": true,
  "token": {
    "_id": "507f1f77bcf86cd799439011",
    "expoToken": "ExponentPushToken[...]",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

#### Delete Token
```
DELETE /api/tokens/:id

Response (200):
{
  "success": true,
  "message": "Token deleted successfully"
}
```

### Notification Management

#### Send Push Notification
```
POST /api/notifications/send
Content-Type: application/json

Body:
{
  "expoToken": "ExponentPushToken[...]",
  "title": "Task Reminder",
  "body": "Your task is due soon!",
  "data": {
    "taskId": "123",
    "taskTitle": "Complete Assignment"
  }
}

Response (200):
{
  "success": true,
  "message": "Notification sent successfully",
  "ticketId": "ticket-id-from-expo"
}
```

#### Get Notification History
```
GET /api/notifications

Response (200):
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "expoToken": "ExponentPushToken[...]",
      "title": "Task Reminder",
      "body": "Your task is due soon!",
      "status": "sent",
      "sentAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

##  Database Schema

### PushToken Model
```javascript
{
  expoToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

##  Authentication

### JWT Token Generation
The backend expects a valid JWT token. Generate one using:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 'user-id-here' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('Token:', token);
```

Use this token in all API requests:
```
curl -X GET http://localhost:3000/api/tokens \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

##  Deployment on Render

### Steps

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Connect Repository**
   - Create new Web Service
   - Connect your GitHub repo
   - Select the backend repository

3. **Configure Environment**
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
   - Add environment variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`

4. **Deploy**
   - Click Deploy
   - Render will build and deploy automatically

5. **Verify**
   ```bash
   curl https://tasknotify-backend-1gd7.onrender.com/api/tokens \
     -H "Authorization: Bearer <token>"
   ```

---

##  Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development / production |
| `MONGODB_URI` | MongoDB connection string | mongodb+srv://... |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `EXPO_API_URL` | Expo Push Service API | https://exp.host/--/api/v2 |
| `CORS_ORIGIN` | Allowed origins | http://localhost:3000 |

---

##  Testing

### Test Local Server
```bash
# Start server
npm start

# Test token registration (in another terminal)
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "expoToken": "ExponentPushToken[example123]"
  }'
```

### Test in Production
```bash
curl -X POST https://tasknotify-backend-1gd7.onrender.com/api/tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "expoToken": "ExponentPushToken[your-actual-token]"
  }'
```

---

##  Troubleshooting

### MongoDB Connection Error
-  Verify `MONGODB_URI` is correct in `.env`
-  Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for Render)
-  Ensure database user has correct password

### Render Deployment Failed
-  Check Render deployment logs
-  Verify environment variables are set
-  Ensure `npm install` completes successfully

### Notifications Not Sending
-  Verify Expo token format is correct
-  Check token is active in PushToken collection
-  Ensure JWT token has not expired

### CORS Issues
-  Check CORS is enabled in Express middleware
-  Verify frontend origin is in CORS whitelist
-  Test with `curl` to rule out browser-specific issues

---

##  API Integration with Frontend

The TaskNotify frontend integrates with this backend for:

1. **Token Registration**
   - On app launch, send Expo Push Token to backend
   - Store token ID locally for future reference

2. **Sending Notifications**
   - User triggers notification in app
   - Frontend sends request to `/api/notifications/send`
   - Backend sends via Expo Push Service
   - Notification delivered to device

3. **Error Handling**
   - Retry failed requests with exponential backoff
   - Display user-friendly error messages
   - Log errors for debugging

---

##  Screenshots & Live Deployment

### Running Locally
*Screenshots from running the backend locally:*
```
$ npm start
Server running on http://localhost:3000
```
- **Local Server Running**: ![Local Server](../image/renderlocally.png)

### Live on Render
*Screenshots from Render deployment:*
- **Render Dashboard Status**: ![Render Dashboard](../image/renderback.png)
- **Health Check Response**: ![Health Check](../image/renderhealth.png)
- **Live API Response**: ![Live API Response](../image/render-api.png)

**How to Add Screenshots:**
1. Take screenshots of your local server and Render deployment
2. Save them as PNG files in the `image/` folder (in the parent TaskNotify directory)
3. File names: `renderlocally.png`, `local-api.png`, `renderback.png`, `renderhealth.png`, `render-api.png`
4. Commit and push to GitHub
5. The images will automatically display in this README

---

