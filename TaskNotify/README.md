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
EXPO_PUBLIC_API_URL=(https://tasknotify-backend-1gd7.onrender.com)
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

> Screenshots are stored in the `image/` folder at the root of TaskNotify directory.

### 1. Permission Request
![Permission Request](image/01-permission-request.png)
*First launch — system dialog requesting notification permission.*

### 2. Permission Granted
![Permission Granted](image/02-permission-granted.png)
*Settings screen showing permission status as GRANTED in green.*

### 3. Add Task
![Add Task](image/03-add-task.png)
*Add Task screen with title, description, due date, reminder, and toggle filled.*

### 4. Task List
![Task List](image/04-task-list.png)
*Task List showing tasks with notification ON/OFF badge, edit and delete actions.*

### 5. Task Detail
![Task Detail](image/05-task-detail.png)
*Task Detail showing due date, reminder, notification status, and action buttons.*

### 6. Local Notification (Foreground)
![Local Notification](image/06-local-notification.png)
*Foreground alert dialog showing notification title and body with View Task button.*

### 7. Remote Notification (System Tray)
![Remote Notification](image/07-remote-notification.png)
*Android notification tray showing remote push notification from backend.*

### 8. Notification Tap → Task Detail
![Notification Navigation](image/08-notification-navigation.png)
*App opened directly to Task Detail after tapping the notification.*

### 9. Postman Request
![Postman](image/09-postman.png)
*Postman showing POST /api/send-notification with 200 OK and results.*

### 10. MongoDB Token
![alt text](image/db.png)


### 11. Render Deployment
![Render](image/renderback.png)


---

