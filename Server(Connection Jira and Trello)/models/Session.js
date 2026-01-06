/**
 * Session Manager for Multi-User Support
 * Tracks active sessions and user connections
 */

class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.userSessions = new Map(); // userId -> Set of sessionIds
    this.socketConnections = new Map(); // socketId -> userId
  }

  /**
   * Create a new session
   */
  createSession(userId, sessionData = {}) {
    const sessionId = this.generateSessionId();
    
    const session = {
      sessionId,
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      socketId: null,
      metadata: sessionData
    };

    this.sessions.set(sessionId, session);

    // Track user's sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(sessionId);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Link socket connection to session
   */
  linkSocket(sessionId, socketId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.socketId = socketId;
      this.socketConnections.set(socketId, session.userId);
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Remove socket connection
   */
  unlinkSocket(socketId) {
    this.socketConnections.delete(socketId);
    
    // Find and update session
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.socketId === socketId) {
        session.socketId = null;
        this.sessions.set(sessionId, session);
      }
    }
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId) {
    const sessionIds = this.userSessions.get(userId) || new Set();
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter(session => session && session.isActive);
  }

  /**
   * Get all active users
   */
  getActiveUsers() {
    const activeUsers = new Set();
    for (const session of this.sessions.values()) {
      if (session.isActive && session.socketId) {
        activeUsers.add(session.userId);
      }
    }
    return Array.from(activeUsers);
  }

  /**
   * Terminate session
   */
  terminateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
      
      // Remove from user sessions
      const userSessionsSet = this.userSessions.get(session.userId);
      if (userSessionsSet) {
        userSessionsSet.delete(sessionId);
      }

      // Remove socket connection
      if (session.socketId) {
        this.unlinkSocket(session.socketId);
      }

      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Terminate all sessions for a user
   */
  terminateUserSessions(userId) {
    const sessionIds = this.userSessions.get(userId) || new Set();
    for (const sessionId of sessionIds) {
      this.terminateSession(sessionId);
    }
    this.userSessions.delete(userId);
  }

  /**
   * Clean up expired sessions (older than 24 hours)
   */
  cleanupExpired() {
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - new Date(session.lastActivity).getTime();
      if (age > expiryTime) {
        this.terminateSession(sessionId);
      }
    }
  }

  /**
   * Get system statistics
   */
  getStats() {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.isActive);
    const connectedSockets = this.socketConnections.size;

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      connectedUsers: this.getActiveUsers().length,
      socketConnections: connectedSockets,
      totalUsers: this.userSessions.size
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}

// Export singleton instance
module.exports = new SessionManager();
