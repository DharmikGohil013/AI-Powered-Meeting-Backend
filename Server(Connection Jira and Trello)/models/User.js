const bcrypt = require('bcryptjs');

/**
 * User Model (In-Memory Storage)
 * In production, replace with a database (MongoDB, PostgreSQL, etc.)
 */

class UserStore {
  constructor() {
    // In-memory storage for users
    this.users = new Map();
    this.usersByEmail = new Map();
  }

  /**
   * Create a new user
   */
  async create(userData) {
    const { email, password, name, role = 'user' } = userData;

    // Check if user already exists
    if (this.usersByEmail.has(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: this.generateId(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      jiraConfig: null,
      trelloConfig: null
    };

    this.users.set(user.id, user);
    this.usersByEmail.set(email, user);

    return this.sanitizeUser(user);
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    const user = this.users.get(id);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const user = this.usersByEmail.get(email);
    return user || null;
  }

  /**
   * Update user data
   */
  async update(id, updates) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'jiraConfig', 'trelloConfig', 'isActive'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    user.updatedAt = new Date();
    this.users.set(id, user);

    return this.sanitizeUser(user);
  }

  /**
   * Update user password
   */
  async updatePassword(id, newPassword) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    this.users.set(id, user);

    return this.sanitizeUser(user);
  }

  /**
   * Verify user password
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  /**
   * Get all users (admin only)
   */
  async findAll() {
    return Array.from(this.users.values()).map(user => this.sanitizeUser(user));
  }

  /**
   * Delete user
   */
  async delete(id) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    this.users.delete(id);
    this.usersByEmail.delete(user.email);

    return true;
  }

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Generate unique user ID
   */
  generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user statistics
   */
  getStats() {
    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.isActive).length
    };
  }
}

// Export singleton instance
module.exports = new UserStore();
