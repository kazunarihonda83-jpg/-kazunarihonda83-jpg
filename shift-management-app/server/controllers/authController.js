import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'staff', hourlyWage = 0 } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userId = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, hourly_wage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, email, passwordHash, firstName, lastName, phone, role, hourlyWage);

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    // Get created user
    const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, hourly_wage FROM users WHERE id = ?').get(userId);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ 
      user: userWithoutPassword, 
      token,
      stores: ['store-main'] // Default store
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({ 
      user: userWithoutPassword,
      stores: ['store-main'] // Default store
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verify current password
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, userId);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
