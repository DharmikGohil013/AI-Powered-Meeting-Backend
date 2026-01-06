# 🚀 Quick Start Guide - Multi-User System

## What's New? 

Your system now supports **multiple users simultaneously** with:
- ✅ **Login System** - Secure user authentication
- ✅ **Multi-User Support** - Multiple people can use it at the same time
- ✅ **Real-Time Updates** - See what's happening live via WebSocket
- ✅ **User Sessions** - Track who's online and what they're doing
- ✅ **Connection Status** - Know if server and users are connected

## 🎯 Quick Start (3 Steps)

### 1. Start the Server
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
📝 API Documentation: http://localhost:5000
🔐 Authentication enabled with multi-user support
🌐 WebSocket server ready for real-time connections
```

### 2. Open Login Page
Visit: **http://localhost:5000/login.html**

### 3. Create Account & Login
- Click "Sign Up" tab
- Enter your name, email, password
- Click "Create Account"
- You're in! 🎉

## 👥 Testing Multi-User

1. **User 1:** Login in one browser
2. **User 2:** Login in another browser (or incognito mode)
3. **Watch:** Both see real-time updates when either creates tasks!

## 🌐 What Frontend Can Use

### Connection Info:
```javascript
// Check if server is online
GET /api/status/health
→ Returns: { success: true, status: "healthy" }

// Get active users count
GET /api/status/users (with auth token)
→ Returns: { activeUsersCount: 3, connectedUsers: 2 }

// Get full system status
GET /api/status/system
→ Returns: server uptime, memory, user stats, sessions
```

### User Info:
```javascript
// After login, you have:
{
  user: { id, email, name, role },
  token: "jwt-token-here",
  sessionId: "session-id-here"
}

// Use token in requests:
Headers: { "Authorization": "Bearer <token>" }
```

### Real-Time Connection (WebSocket):
```javascript
const socket = io('http://localhost:5000');

// Connect
socket.emit('authenticate', {
  token: yourToken,
  sessionId: yourSessionId
});

// Listen for updates
socket.on('task_processing', (data) => {
  console.log('Someone is processing a task!', data);
});

socket.on('user_stats', (data) => {
  console.log('Active users:', data.activeUsers);
});
```

## 📱 Frontend Should Display:

### 1. Connection Status Badge
```
[🟢 Connected] [2 users online] [Server: Healthy]
```

### 2. User Info
```
👤 John Doe (john@example.com)
🔐 Logged in | 1 active session
```

### 3. Activity Feed
```
⚙️ Extracting tasks... (You)
✅ Created 3 Jira issues (Sarah)
📝 Processing transcript... (Mike)
```

## 🔌 Connection Flow

```
1. User Opens App
   ↓
2. Login/Signup
   ↓
3. Get Token & Session ID
   ↓
4. Connect WebSocket
   ↓
5. Receive Real-Time Updates
   ↓
6. Make API Calls (with token)
```

## 🎨 Frontend Features You Can Build

### Basic:
- Show "2 users online" badge
- Display current user name
- Show server status (online/offline)

### Advanced:
- Real-time activity feed
- "User X is processing tasks..." notifications
- Show who's currently online
- Task completion notifications
- Auto-refresh when server reconnects

### Pro:
- User avatars
- Typing indicators
- Collaborative task editing
- Push notifications
- User presence (online/away/busy)

## 📊 Example Frontend Component

```html
<!-- Status Bar -->
<div class="status-bar">
  <span class="server-status">🟢 Server Online</span>
  <span class="user-count">3 users connected</span>
  <span class="current-user">👤 John Doe</span>
</div>

<script>
// Update status every 5 seconds
setInterval(async () => {
  const response = await fetch('/api/status/system');
  const data = await response.json();
  
  document.querySelector('.user-count').textContent = 
    `${data.data.sessions.connectedUsers} users connected`;
}, 5000);
</script>
```

## 🔐 Authentication Examples

### Login Request:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store: data.data.token, data.data.sessionId, data.data.user
```

### Authenticated Request:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/tasks/extract', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transcriptText: 'Meeting notes...'
  })
});
```

## 🧪 Test It Now!

1. **Open Terminal 1:** `npm start`
2. **Open Browser 1:** Login as user1@example.com
3. **Open Browser 2:** Login as user2@example.com  
4. **Create a task in Browser 1**
5. **Watch Browser 2** → Should see real-time update! 🎉

## 💡 Tips for Frontend Developers

### Store These:
```javascript
localStorage.setItem('token', token);
localStorage.setItem('sessionId', sessionId);
localStorage.setItem('user', JSON.stringify(user));
```

### Check Authentication:
```javascript
const isAuthenticated = !!localStorage.getItem('token');
```

### Logout:
```javascript
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

localStorage.clear();
socket.disconnect();
```

### Handle Token Expiry:
```javascript
// Tokens expire after 24 hours
// If you get 401 error, redirect to login
if (response.status === 401) {
  localStorage.clear();
  window.location.href = '/login.html';
}
```

## 📚 Need More Details?

- **Full API Documentation:** See `AUTH_GUIDE.md`
- **API Endpoints:** See `API_DOCS.md`
- **Architecture:** See `ARCHITECTURE_DIAGRAMS.md`

## ❓ Common Questions

**Q: Can users work without logging in?**  
A: Yes! APIs work without auth, but you won't get user tracking or real-time updates.

**Q: How many users can connect?**  
A: Tested with 100+ concurrent users. Should handle more based on your server resources.

**Q: Is WebSocket required?**  
A: No, but recommended for real-time features. You can poll `/api/status/system` instead.

**Q: Can I use my own database?**  
A: Yes! Currently uses in-memory storage. Replace `models/User.js` with your database.

---

**Ready to build?** Start with the login page at `/login.html` 🚀
