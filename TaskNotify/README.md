# TaskNotify — SWE201 Assignment 4

**Push Notification–Enabled Task Reminder App**
Expo SDK 54 · React Native 0.81 · TypeScript · Node.js · MongoDB Atlas

---

## Features

- Create, edit, delete tasks with due dates and reminder times
- Local scheduled notifications via expo-notifications
- Remote push notifications triggered from Express backend
- Notification tap → navigates directly to Task Detail screen
- Foreground, background, and cold-start notification handling
- Android notification channel: `task-reminders` (HIGH importance)
- Expo Push Token registered with backend on launch
- AsyncStorage for local task persistence
- Permission request, status display, and Settings link if denied

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.81 + Expo SDK 54 |
| Notifications | expo-notifications ~0.32.11 |
| Navigation | React Navigation 6 (Stack + Bottom Tabs) |
| Local Storage | AsyncStorage |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Free) |
| Hosting | Render (Free) |
| Build | EAS Build → Android APK |

---

## Project Structure

```
TaskNotify/
├── App.tsx
├── app.json
├── eas.json
├── package.json
├── src/
│   ├── api/backendApi.ts
│   ├── navigation/AppNavigator.tsx
│   ├── notifications/
│   │   ├── notificationChannels.ts
│   │   ├── notificationService.ts
│   │   └── notificationListeners.ts
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   ├── AddTaskScreen.tsx
│   │   ├── EditTaskScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AboutScreen.tsx
│   ├── services/storageService.ts
│   ├── types/index.ts
│   └── utils/helpers.ts
├── assets/screenshots/        ← put your screenshots here
└── backend/
    ├── server.js
    ├── models/PushToken.js
    ├── controllers/
    ├── middleware/auth.js
    └── routes/
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| POST | `/api/register-token` | None | Register device token |
| GET | `/api/tokens` | None | List all tokens |
| POST | `/api/send-notification` | `x-api-key` header | Send push notification |

---

## Environment Variables

**Frontend** — `TaskNotify/.env`
```
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
EXPO_PUBLIC_PROJECT_ID=your-eas-project-id
```

**Backend** — `TaskNotify/backend/.env`
```
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tasknotify?retryWrites=true&w=majority
API_KEY=your-secret-key
```

---

## Postman — Send Remote Notification

```
POST https://your-backend.onrender.com/api/send-notification
Headers:
  Content-Type: application/json
  x-api-key: your-secret-key

Body:
{
  "title": "Task Due Soon",
  "body": "Complete your assignment",
  "broadcast": true,
  "data": { "taskId": "your-task-id", "screen": "TaskDetail" }
}
```

---

## Screenshots

> Place screenshots in `assets/screenshots/` with the exact filenames below.

### 1. Permission Request
![Permission Request](assets/screenshots/01-permission-request.png)
*First launch — system dialog requesting notification permission.*

### 2. Permission Granted
![Permission Granted](assets/screenshots/02-permission-granted.png)
*Settings screen showing permission status as GRANTED in green.*

### 3. Add Task
![Add Task](assets/screenshots/03-add-task.png)
*Add Task screen with title, description, due date, reminder, and toggle filled.*

### 4. Task List
![Task List](assets/screenshots/04-task-list.png)
*Task List showing tasks with notification ON/OFF badge, edit and delete actions.*

### 5. Task Detail
![Task Detail](assets/screenshots/05-task-detail.png)
*Task Detail showing due date, reminder, notification status, and action buttons.*

### 6. Local Notification (Foreground)
![Local Notification](assets/screenshots/06-local-notification.png)
*Foreground alert dialog showing notification title and body with View Task button.*

### 7. Remote Notification (System Tray)
![Remote Notification](assets/screenshots/07-remote-notification.png)
*Android notification tray showing remote push notification from backend.*

### 8. Notification Tap → Task Detail
![Notification Navigation](assets/screenshots/08-notification-navigation.png)
*App opened directly to Task Detail after tapping the notification.*

### 9. Postman Request
![Postman](assets/screenshots/09-postman.png)
*Postman showing POST /api/send-notification with 200 OK and results.*

### 10. MongoDB Token
![MongoDB](assets/screenshots/10-mongodb-token.png)
*MongoDB Atlas — pushtokens collection with stored device push token.*

### 11. Render Deployment
![Render](assets/screenshots/11-render-deployment.png)
*Render dashboard showing backend service as Live and running.*

---

## Known Limitations

- Push tokens require a real Android device (not emulator)
- Render free tier sleeps after 15 min — first request takes ~30 sec to wake up
- `SCHEDULE_EXACT_ALARM` permission required on Android 13+
