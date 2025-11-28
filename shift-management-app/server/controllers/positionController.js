import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';

// Get all positions
export const getPositions = (req, res) => {
  try {
    const { storeId } = req.query;
    
    let query = 'SELECT * FROM positions WHERE 1=1';
    const params = [];
    
    if (storeId) {
      query += ' AND store_id = ?';
      params.push(storeId);
    }
    
    query += ' ORDER BY sort_order, name';
    
    const positions = db.prepare(query).all(...params);
    
    res.json(positions);
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
};

// Get position by ID
export const getPositionById = (req, res) => {
  try {
    const { id } = req.params;
    
    const position = db.prepare('SELECT * FROM positions WHERE id = ?').get(id);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json(position);
  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ error: 'Failed to fetch position' });
  }
};

// Create position
export const createPosition = (req, res) => {
  try {
    const { storeId, name, code, description, color = '#3B82F6', sortOrder = 0 } = req.body;
    
    if (!storeId || !name || !code) {
      return res.status(400).json({ error: 'storeId, name, and code are required' });
    }
    
    const positionId = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO positions (id, store_id, name, code, description, color, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    
    stmt.run(positionId, storeId, name, code, description, color, sortOrder);
    
    const position = db.prepare('SELECT * FROM positions WHERE id = ?').get(positionId);
    
    res.status(201).json(position);
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({ error: 'Failed to create position' });
  }
};

// Update position
export const updatePosition = (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, color, sortOrder, isActive } = req.body;
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      params.push(code);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (sortOrder !== undefined) {
      updates.push('sort_order = ?');
      params.push(sortOrder);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE positions SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    const position = db.prepare('SELECT * FROM positions WHERE id = ?').get(id);
    
    res.json(position);
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
};

// Delete position
export const deletePosition = (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM positions WHERE id = ?').run(id);
    
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
};
