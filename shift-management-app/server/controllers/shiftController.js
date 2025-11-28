import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';
import { format, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// Get all shifts with filtering
export const getShifts = (req, res) => {
  try {
    const { storeId, userId, startDate, endDate, status } = req.query;
    
    let query = `
      SELECT 
        s.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.hourly_wage,
        p.name as position_name,
        p.color as position_color
      FROM shifts s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN positions p ON s.position_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (storeId) {
      query += ' AND s.store_id = ?';
      params.push(storeId);
    }
    
    if (userId) {
      query += ' AND s.user_id = ?';
      params.push(userId);
    }
    
    if (startDate) {
      query += ' AND s.shift_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND s.shift_date <= ?';
      params.push(endDate);
    }
    
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY s.shift_date, s.start_time';
    
    const shifts = db.prepare(query).all(...params);
    
    res.json(shifts);
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
};

// Get shift by ID
export const getShiftById = (req, res) => {
  try {
    const { id } = req.params;
    
    const shift = db.prepare(`
      SELECT 
        s.*,
        u.first_name || ' ' || u.last_name as user_name,
        p.name as position_name,
        p.color as position_color
      FROM shifts s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN positions p ON s.position_id = p.id
      WHERE s.id = ?
    `).get(id);
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    console.error('Get shift error:', error);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
};

// Create shift
export const createShift = (req, res) => {
  try {
    const { storeId, userId, positionId, shiftDate, startTime, endTime, breakMinutes = 0, notes, status = 'draft' } = req.body;
    
    const shiftId = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO shifts (id, store_id, user_id, position_id, shift_date, start_time, end_time, break_minutes, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(shiftId, storeId, userId, positionId, shiftDate, startTime, endTime, breakMinutes, notes, status);
    
    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(shiftId);
    
    res.status(201).json(shift);
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ error: 'Failed to create shift' });
  }
};

// Update shift
export const updateShift = (req, res) => {
  try {
    const { id } = req.params;
    const { userId, positionId, shiftDate, startTime, endTime, breakMinutes, notes, status } = req.body;
    
    const updates = [];
    const params = [];
    
    if (userId !== undefined) {
      updates.push('user_id = ?');
      params.push(userId);
    }
    if (positionId !== undefined) {
      updates.push('position_id = ?');
      params.push(positionId);
    }
    if (shiftDate !== undefined) {
      updates.push('shift_date = ?');
      params.push(shiftDate);
    }
    if (startTime !== undefined) {
      updates.push('start_time = ?');
      params.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('end_time = ?');
      params.push(endTime);
    }
    if (breakMinutes !== undefined) {
      updates.push('break_minutes = ?');
      params.push(breakMinutes);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE shifts SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
    
    res.json(shift);
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({ error: 'Failed to update shift' });
  }
};

// Delete shift
export const deleteShift = (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM shifts WHERE id = ?').run(id);
    
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({ error: 'Failed to delete shift' });
  }
};

// AI Shift Generation
function generateOptimalShifts(storeId, staff, requests, startDate, endDate, positions) {
  const shifts = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Group staff by their availability
  const availableStaff = staff.filter(s => s.role === 'staff' || s.role === 'manager');
  
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();
    
    // Skip if Sunday (0) - adjust based on business needs
    if (dayOfWeek === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // Determine shifts needed based on day
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const shiftsPerDay = isWeekend ? 6 : 4;
    
    // Morning shift (09:00-14:00)
    const morningStaff = availableStaff.slice(0, Math.ceil(shiftsPerDay / 2));
    morningStaff.forEach((person, idx) => {
      const position = positions[idx % positions.length];
      shifts.push({
        id: randomUUID(),
        storeId,
        userId: person.id,
        positionId: position.id,
        shiftDate: dateStr,
        startTime: '09:00',
        endTime: '14:00',
        breakMinutes: 0,
        status: 'draft'
      });
    });
    
    // Evening shift (17:00-22:00)
    const eveningStaff = availableStaff.slice(Math.ceil(shiftsPerDay / 2), shiftsPerDay);
    eveningStaff.forEach((person, idx) => {
      const position = positions[idx % positions.length];
      shifts.push({
        id: randomUUID(),
        storeId,
        userId: person.id,
        positionId: position.id,
        shiftDate: dateStr,
        startTime: '17:00',
        endTime: '22:00',
        breakMinutes: 60,
        status: 'draft'
      });
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return shifts;
}

// Generate shifts endpoint
export const generateShifts = (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.body;
    
    if (!storeId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get staff
    const staff = db.prepare('SELECT * FROM users WHERE role IN (?, ?)').all('staff', 'manager');
    
    // Get positions
    const positions = db.prepare('SELECT * FROM positions WHERE store_id = ? AND is_active = 1').all(storeId);
    
    if (positions.length === 0) {
      return res.status(400).json({ error: 'No positions found for this store' });
    }
    
    // Get shift requests
    const requests = db.prepare('SELECT * FROM shift_requests WHERE request_date BETWEEN ? AND ?').all(startDate, endDate);
    
    // Generate optimal shifts
    const generatedShifts = generateOptimalShifts(storeId, staff, requests, startDate, endDate, positions);
    
    // Insert shifts
    const stmt = db.prepare(`
      INSERT INTO shifts (id, store_id, user_id, position_id, shift_date, start_time, end_time, break_minutes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((shifts) => {
      for (const shift of shifts) {
        stmt.run(
          shift.id,
          shift.storeId,
          shift.userId,
          shift.positionId,
          shift.shiftDate,
          shift.startTime,
          shift.endTime,
          shift.breakMinutes,
          shift.status
        );
      }
    });
    
    insertMany(generatedShifts);
    
    res.json({ 
      message: 'Shifts generated successfully', 
      count: generatedShifts.length,
      shifts: generatedShifts
    });
  } catch (error) {
    console.error('Generate shifts error:', error);
    res.status(500).json({ error: 'Failed to generate shifts' });
  }
};

// Publish shifts
export const publishShifts = (req, res) => {
  try {
    const { shiftIds } = req.body;
    
    if (!shiftIds || !Array.isArray(shiftIds)) {
      return res.status(400).json({ error: 'Invalid shift IDs' });
    }
    
    const placeholders = shiftIds.map(() => '?').join(',');
    const stmt = db.prepare(`UPDATE shifts SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`);
    
    const result = stmt.run(...shiftIds);
    
    res.json({ 
      message: 'Shifts published successfully',
      count: result.changes
    });
  } catch (error) {
    console.error('Publish shifts error:', error);
    res.status(500).json({ error: 'Failed to publish shifts' });
  }
};

// Simulate labor cost
export const simulateLaborCost = (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;
    
    const shifts = db.prepare(`
      SELECT 
        s.*,
        u.hourly_wage,
        u.first_name || ' ' || u.last_name as user_name
      FROM shifts s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.store_id = ? AND s.shift_date BETWEEN ? AND ?
    `).all(storeId, startDate, endDate);
    
    let totalCost = 0;
    const dailyCosts = {};
    
    shifts.forEach(shift => {
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const startMinute = parseInt(shift.start_time.split(':')[1]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      const endMinute = parseInt(shift.end_time.split(':')[1]);
      
      const workMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute) - (shift.break_minutes || 0);
      const workHours = workMinutes / 60;
      const cost = workHours * (shift.hourly_wage || 0);
      
      totalCost += cost;
      
      if (!dailyCosts[shift.shift_date]) {
        dailyCosts[shift.shift_date] = 0;
      }
      dailyCosts[shift.shift_date] += cost;
    });
    
    res.json({
      totalCost: Math.round(totalCost),
      dailyCosts,
      shiftCount: shifts.length
    });
  } catch (error) {
    console.error('Simulate labor cost error:', error);
    res.status(500).json({ error: 'Failed to simulate labor cost' });
  }
};
