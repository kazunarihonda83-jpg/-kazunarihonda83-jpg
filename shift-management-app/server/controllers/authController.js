import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone, role = 'staff', hourlyWage = 0, hourly_wage } = req.body;
    
    // Support both name (single field) and firstName/lastName (separate fields)
    let fName = firstName;
    let lName = lastName;
    if (name && !firstName && !lastName) {
      const nameParts = name.split(' ');
      lName = nameParts[0] || ''; // Japanese: last name first
      fName = nameParts.slice(1).join(' ') || '';
    }
    const wage = hourly_wage || hourlyWage || 0;

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

    stmt.run(userId, email, passwordHash, fName, lName, phone, role, wage);

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

export const getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, first_name, last_name, phone, role, hourly_wage, 
             created_at, updated_at, 
             (first_name || ' ' || last_name) as name,
             1 as is_active,
             SUBSTR(created_at, 1, 10) as hire_date
      FROM users 
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, hourly_wage, phone, hire_date } = req.body;

    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updates = [];
    const values = [];

    if (name) {
      const nameParts = name.split(' ');
      const lName = nameParts[0] || '';
      const fName = nameParts.slice(1).join(' ') || '';
      updates.push('first_name = ?', 'last_name = ?');
      values.push(fName, lName);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (role && req.user.role === 'admin') {
      updates.push('role = ?');
      values.push(role);
    }

    if (hourly_wage !== undefined) {
      updates.push('hourly_wage = ?');
      values.push(hourly_wage);
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    if (updates.length > 1) { // more than just updated_at
      const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }

    const updatedUser = db.prepare(`
      SELECT id, email, first_name, last_name, phone, role, hourly_wage,
             (first_name || ' ' || last_name) as name
      FROM users WHERE id = ?
    `).get(id);

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
