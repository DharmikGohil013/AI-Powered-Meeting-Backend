const jwt = require('jsonwebtoken');
const UserStore = require('../models/User');
const SessionManager = require('../models/Session');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from store
    const user = await UserStore.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account disabled',
        message: 'Your account has been deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    // Update session activity if session ID is provided
    if (decoded.sessionId) {
      SessionManager.updateActivity(decoded.sessionId);
      req.sessionId = decoded.sessionId;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error.message
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserStore.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
        
        if (decoded.sessionId) {
          SessionManager.updateActivity(decoded.sessionId);
          req.sessionId = decoded.sessionId;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Generate JWT Token
 */
const generateToken = (userId, sessionId = null) => {
  const payload = {
    userId,
    sessionId,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiting
 */
const rateLimitStore = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    
    const userRequests = rateLimitStore.get(identifier) || [];
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    recentRequests.push(now);
    rateLimitStore.set(identifier, recentRequests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, times] of rateLimitStore.entries()) {
        const validTimes = times.filter(time => now - time < windowMs);
        if (validTimes.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, validTimes);
        }
      }
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  generateToken,
  rateLimit,
  JWT_SECRET,
  JWT_EXPIRY
};
