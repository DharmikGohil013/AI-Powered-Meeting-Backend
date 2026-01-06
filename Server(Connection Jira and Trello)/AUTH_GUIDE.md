# Multi-User Authentication System Guide

## 🚀 Overview

This system now supports **multi-user concurrent access** with a complete authentication system, real-time WebSocket connections, and session management.

## ✨ New Features

### 1. **User Authentication**
- ✅ User registration (signup)
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ User profile management

### 2. **Multi-User Support**
- ✅ Multiple users can use the system simultaneously
- ✅ Real-time connection tracking
- ✅ User session management
- ✅ Activity monitoring

### 3. **Real-Time Features**
- ✅ WebSocket connections for live updates
- ✅ Task processing notifications
- ✅ Active user count tracking
- ✅ Connection status monitoring

### 4. **Security**
- ✅ JWT token-based authentication
- ✅ Password strength validation
- ✅ Rate limiting
- ✅ Session expiration (24 hours)

## 📋 Installation

1. **Install new dependencies:**
```bash
npm install
```

2. **Set environment variables:**
Create/update `.env` file:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this
CORS_ORIGIN=*
NODE_ENV=development
```

3. **Start the server:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

## 🔐 Authentication API Endpoints

### Register New User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_xxx",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "session_xxx"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "session_xxx",
    "expiresIn": "24h"
  }
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_xxx",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "jiraConfig": null,
      "trelloConfig": null
    },
    "activeSessions": 1,
    "currentSession": "session_xxx"
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "jiraConfig": {
    "domain": "mycompany.atlassian.net",
    "email": "john@example.com",
    "apiToken": "xxx",
    "projectKey": "PROJ"
  },
  "trelloConfig": {
    "apiKey": "xxx",
    "apiToken": "xxx",
    "boardId": "xxx"
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 📊 Status & Monitoring APIs

### System Status
```http
GET /api/status/system

Response:
{
  "success": true,
  "data": {
    "server": {
      "status": "online",
      "uptime": 3600,
      "timestamp": "2026-01-06T...",
      "version": "2.0.0"
    },
    "sessions": {
      "totalSessions": 5,
      "activeSessions": 3,
      "connectedUsers": 2,
      "socketConnections": 2
    },
    "users": {
      "totalUsers": 10,
      "activeUsers": 8
    },
    "memory": {
      "used": 45,
      "total": 128,
      "unit": "MB"
    }
  }
}
```

### Active Users
```http
GET /api/status/users
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "activeUsersCount": 3,
    "connectedUsers": 2,
    "totalSessions": 5,
    "currentUser": "user_xxx"
  }
}
```

## 🔌 WebSocket Connection

### Client-Side Connection
```javascript
const socket = io('http://localhost:5000');

// Authenticate the socket connection
socket.emit('authenticate', {
  token: 'your-jwt-token',
  sessionId: 'your-session-id'
});

// Listen for authentication success
socket.on('authenticated', (data) => {
  console.log('Connected:', data);
});

// Listen for task processing updates
socket.on('task_processing', (data) => {
  console.log('Task processing:', data);
});

// Listen for task completion
socket.on('task_complete', (data) => {
  console.log('Task completed:', data);
});

// Listen for user statistics updates
socket.on('user_stats', (data) => {
  console.log('Active users:', data.activeUsers);
});

// Heartbeat to keep connection alive
setInterval(() => {
  socket.emit('ping');
}, 30000);

socket.on('pong', (data) => {
  console.log('Server responded:', data.timestamp);
});
```

## 🎯 Task API with Authentication

All task endpoints now support authentication (optional):

```http
POST /api/tasks/extract
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "transcriptText": "Meeting transcript...",
  "useAI": true
}

Response (with authentication):
{
  "success": true,
  "message": "Tasks extracted successfully",
  "count": 3,
  "tasks": [...],
  "user": {
    "id": "user_xxx",
    "name": "John Doe"
  }
}
```

## 🌐 Frontend Integration

### What Frontend Should Use:

1. **Connection Status**
   - GET `/api/status/system` - Server health and stats
   - GET `/api/status/health` - Quick health check
   - GET `/api/status/users` - Active users count

2. **User Information**
   - User name, email, role from token
   - Active sessions count
   - User preferences (Jira/Trello configs)

3. **Real-Time Updates**
   - WebSocket connection for live notifications
   - Task processing status
   - Other users' activities
   - Connection status changes

4. **Authentication Flow**
   ```
   Login → Store Token → Connect WebSocket → Use APIs → Logout
   ```

### Frontend Example (HTML/JavaScript):
```javascript
// Store auth data
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Make authenticated requests
fetch('/api/tasks/extract', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ transcriptText: '...' })
});

// Connect WebSocket
const socket = io('http://localhost:5000');
socket.emit('authenticate', {
  token: localStorage.getItem('token'),
  sessionId: localStorage.getItem('sessionId')
});
```

## 📝 Key Frontend Data Points

The frontend should display:

1. **User Info**
   - Username
   - Email
   - Active sessions count
   - Login time

2. **Connection Status**
   - Server online/offline
   - WebSocket connected/disconnected
   - Number of active users
   - User's connection strength

3. **System Status**
   - Server uptime
   - Total users
   - Active sessions
   - Memory usage

4. **Notifications**
   - Task processing started
   - Task completed
   - Other users joined/left
   - System alerts

## 🔒 Security Best Practices

1. **Password Requirements:**
   - Minimum 6 characters
   - Recommend: Mix of letters, numbers, symbols

2. **Token Security:**
   - Tokens expire after 24 hours
   - Store securely (localStorage or httpOnly cookies)
   - Never expose in URLs

3. **Rate Limiting:**
   - Login/Signup: 10 requests per minute
   - General API: 100 requests per minute

## 🧪 Testing

1. **Visit login page:**
   - http://localhost:5000/login.html

2. **Create an account:**
   - Use valid email format
   - Password minimum 6 characters

3. **Test multi-user:**
   - Open multiple browser tabs
   - Login with different accounts
   - See real-time user count updates

4. **Test WebSocket:**
   - Open browser console
   - Watch for WebSocket events
   - Process tasks and see live updates

## 📦 File Structure

```
Server/
├── models/
│   ├── User.js           # User data management
│   └── Session.js        # Session management
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── authRoutes.js     # Authentication endpoints
│   └── taskRoutes.js     # Task endpoints (updated)
├── public/
│   ├── login.html        # Login/Signup page
│   └── dashboard.html    # Main dashboard
└── server.js             # Main server (updated)
```

## 🎨 Customization

### Change Token Expiry:
In `.env`:
```env
JWT_EXPIRY=7d  # Options: 1h, 24h, 7d, 30d
```

### Add User Roles:
In `models/User.js`, modify role field:
```javascript
role = 'admin' // or 'user', 'manager', etc.
```

Then use authorization middleware:
```javascript
router.get('/admin-only', authenticate, authorize('admin'), handler);
```

## 🐛 Troubleshooting

1. **"Invalid token" error:**
   - Token may have expired (24 hours)
   - Re-login to get new token

2. **"Server offline" status:**
   - Check if server is running
   - Verify PORT in .env matches frontend

3. **WebSocket not connecting:**
   - Ensure server supports WebSocket (Socket.IO)
   - Check CORS configuration
   - Verify firewall settings

4. **Multiple users not working:**
   - Check SessionManager is singleton
   - Verify WebSocket events are broadcasting
   - Check browser console for errors

## 📚 Additional Resources

- JWT Documentation: https://jwt.io/
- Socket.IO Documentation: https://socket.io/docs/
- bcrypt Documentation: https://github.com/kelektiv/node.bcrypt.js

## 🤝 Support

For issues or questions, check:
1. Server logs in terminal
2. Browser console (F12)
3. Network tab for API responses

---

**Version:** 2.0.0  
**Last Updated:** January 6, 2026  
**Status:** ✅ Production Ready
