const express = require('express');
const router = express.Router();
const UserStore = require('../models/User');
const SessionManager = require('../models/Session');
const userConfigService = require('../services/userConfigService');
const { generateToken, authenticate, authorize, rateLimit } = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', rateLimit(10, 60000), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['email', 'password', 'name']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Create user
    const user = await UserStore.create({ email, password, name });

    // Create session
    const session = SessionManager.createSession(user.id, {
      signupDate: new Date(),
      userAgent: req.headers['user-agent']
    });

    // Generate token
    const token = generateToken(user.id, session.sessionId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        sessionId: session.sessionId
      }
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and get token
 */
router.post('/login', rateLimit(10, 60000), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await UserStore.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await UserStore.verifyPassword(user, password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated',
        message: 'Please contact administrator'
      });
    }

    // Create session
    const session = SessionManager.createSession(user.id, {
      loginDate: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // Generate token
    const token = generateToken(user.id, session.sessionId);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: UserStore.sanitizeUser(user),
        token,
        sessionId: session.sessionId,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Terminate user session
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    if (req.sessionId) {
      SessionManager.terminateSession(req.sessionId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await UserStore.findById(req.user.id);
    
    const sessions = SessionManager.getUserSessions(req.user.id);

    res.json({
      success: true,
      data: {
        user,
        activeSessions: sessions.length,
        currentSession: req.sessionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, jiraConfig, trelloConfig } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (jiraConfig) updates.jiraConfig = jiraConfig;
    if (trelloConfig) updates.trelloConfig = trelloConfig;

    const updatedUser = await UserStore.update(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Update failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Verify current password
    const user = await UserStore.findByEmail(req.user.email);
    const isValid = await UserStore.verifyPassword(user, currentPassword);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    await UserStore.updatePassword(req.user.id, newPassword);

    // Terminate all other sessions
    SessionManager.terminateUserSessions(req.user.id);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Password change failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/sessions
 * Get all active sessions for current user
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = SessionManager.getUserSessions(req.user.id);

    res.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          createdAt: s.createdAt,
          lastActivity: s.lastActivity,
          isConnected: !!s.socketId,
          metadata: s.metadata
        })),
        currentSession: req.sessionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

/**
 * DELETE /api/auth/sessions/:sessionId
 * Terminate a specific session
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = SessionManager.getSession(sessionId);

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    SessionManager.terminateSession(sessionId);

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to terminate session',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/users (Admin only)
 * Get all users
 */
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await UserStore.findAll();
    const stats = UserStore.getStats();

    res.json({
      success: true,
      data: {
        users,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/config/status
 * Get user's configuration status
 */
router.get('/config/status', authenticate, async (req, res) => {
  try {
    const status = userConfigService.getUserConfigStatus(req.user);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get config status',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/config/jira
 * Update user's Jira configuration
 */
router.post('/config/jira', authenticate, async (req, res) => {
  try {
    const { domain, email, apiToken, projectKey } = req.body;

    if (!domain || !email || !apiToken || !projectKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['domain', 'email', 'apiToken', 'projectKey']
      });
    }

    const jiraConfig = { domain, email, apiToken, projectKey };

    // Test the configuration
    const testResult = await userConfigService.testJiraConnection(jiraConfig);

    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Jira configuration',
        message: testResult.error
      });
    }

    // Update user's Jira config
    const updatedUser = await UserStore.update(req.user.id, { jiraConfig });

    res.json({
      success: true,
      message: 'Jira configuration updated successfully',
      data: {
        user: updatedUser,
        testResult: testResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update Jira config',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/config/trello
 * Update user's Trello configuration
 */
router.post('/config/trello', authenticate, async (req, res) => {
  try {
    const { apiKey, apiToken, boardId, listId } = req.body;

    if (!apiKey || !apiToken || !boardId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['apiKey', 'apiToken', 'boardId']
      });
    }

    const trelloConfig = { apiKey, apiToken, boardId, listId };

    // Test the configuration
    const testResult = await userConfigService.testTrelloConnection(trelloConfig);

    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Trello configuration',
        message: testResult.error
      });
    }

    // Update user's Trello config
    const updatedUser = await UserStore.update(req.user.id, { trelloConfig });

    res.json({
      success: true,
      message: 'Trello configuration updated successfully',
      data: {
        user: updatedUser,
        testResult: testResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update Trello config',
      message: error.message
    });
  }
});

/**
 * DELETE /api/auth/config/jira
 * Remove user's Jira configuration
 */
router.delete('/config/jira', authenticate, async (req, res) => {
  try {
    const updatedUser = await UserStore.update(req.user.id, { jiraConfig: null });

    res.json({
      success: true,
      message: 'Jira configuration removed',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove Jira config',
      message: error.message
    });
  }
});

/**
 * DELETE /api/auth/config/trello
 * Remove user's Trello configuration
 */
router.delete('/config/trello', authenticate, async (req, res) => {
  try {
    const updatedUser = await UserStore.update(req.user.id, { trelloConfig: null });

    res.json({
      success: true,
      message: 'Trello configuration removed',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove Trello config',
      message: error.message
    });
  }
});

module.exports = router;
