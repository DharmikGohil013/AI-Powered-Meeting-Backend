require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const SessionManager = require('./models/Session');
const { authenticate, optionalAuth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML test interface)
app.use(express.static('public'));

// Attach io to requests for use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', optionalAuth, taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    message: 'Meeting Task Automation Backend',
    version: '2.0.0',
    features: ['Multi-user support', 'Authentication', 'Real-time connections'],
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile'
      },
      tasks: {
        extractTasks: 'POST /api/tasks/extract',
        createJiraIssue: 'POST /api/tasks/jira',
        createTrelloCard: 'POST /api/tasks/trello',
        createBoth: 'POST /api/tasks/create-all'
      },
      status: {
        system: 'GET /api/status/system',
        health: 'GET /api/status/health',
        users: 'GET /api/status/users'
      }
    }
  });
});

// System Status API
app.get('/api/status/system', optionalAuth, (req, res) => {
  const sessionStats = SessionManager.getStats();
  const UserStore = require('./models/User');
  const userStats = UserStore.getStats();

  res.json({
    success: true,
    data: {
      server: {
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date(),
        version: '2.0.0'
      },
      sessions: sessionStats,
      users: userStats,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    }
  });
});

// Health check endpoint
app.get('/api/status/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date()
  });
});

// Active users endpoint
app.get('/api/status/users', authenticate, (req, res) => {
  const activeUsers = SessionManager.getActiveUsers();
  const stats = SessionManager.getStats();

  res.json({
    success: true,
    data: {
      activeUsersCount: activeUsers.length,
      connectedUsers: stats.connectedUsers,
      totalSessions: stats.activeSessions,
      currentUser: req.user.id
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle authentication
  socket.on('authenticate', async (data) => {
    try {
      const { token, sessionId } = data;

      if (!token || !sessionId) {
        socket.emit('auth_error', { error: 'Token and sessionId required' });
        return;
      }

      // Link socket to session
      SessionManager.linkSocket(sessionId, socket.id);
      
      socket.sessionId = sessionId;
      socket.authenticated = true;

      const session = SessionManager.getSession(sessionId);
      
      // Notify user and broadcast
      socket.emit('authenticated', {
        success: true,
        sessionId: sessionId
      });

      // Broadcast active user count
      const stats = SessionManager.getStats();
      io.emit('user_stats', {
        activeUsers: stats.connectedUsers,
        totalSessions: stats.activeSessions
      });

      console.log(`✅ Client authenticated: ${socket.id} (Session: ${sessionId})`);
    } catch (error) {
      socket.emit('auth_error', { error: error.message });
    }
  });

  // Handle task processing events
  socket.on('task_processing', (data) => {
    if (!socket.authenticated) {
      socket.emit('error', { error: 'Not authenticated' });
      return;
    }

    // Broadcast to user's other sessions
    socket.broadcast.emit('task_update', {
      sessionId: socket.sessionId,
      status: 'processing',
      data: data
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.sessionId) {
      SessionManager.unlinkSocket(socket.id);
      
      const stats = SessionManager.getStats();
      io.emit('user_stats', {
        activeUsers: stats.connectedUsers,
        totalSessions: stats.activeSessions
      });
    }

    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  // Heartbeat to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date() });
  });
});

// Cleanup expired sessions every hour
setInterval(() => {
  SessionManager.cleanupExpired();
  console.log('🧹 Cleaned up expired sessions');
}, 60 * 60 * 1000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!', 
    message: err.message 
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}`);
  console.log(`🔐 Authentication enabled with multi-user support`);
  console.log(`🌐 WebSocket server ready for real-time connections`);
});
