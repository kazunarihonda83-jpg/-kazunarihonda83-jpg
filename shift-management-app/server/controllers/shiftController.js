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

// AI Shift Generation with Shift Requests Integration
function generateOptimalShifts(storeId, staff, requests, startDate, endDate, positions) {
  const shifts = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Index requests by date and user for quick lookup
  const requestsByDate = {};
  requests.forEach(req => {
    if (!requestsByDate[req.request_date]) {
      requestsByDate[req.request_date] = [];
    }
    requestsByDate[req.request_date].push(req);
  });
  
  // Filter available staff
  const availableStaff = staff.filter(s => s.role === 'staff' || s.role === 'manager');
  
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();
    const dayRequests = requestsByDate[dateStr] || [];
    
    // Get staff who requested to work this day
    const requestedStaff = dayRequests.filter(r => 
      r.availability === 'available' && (r.status === 'submitted' || r.status === 'approved')
    );
    
    // Get staff who are unavailable
    const unavailableUserIds = dayRequests
      .filter(r => r.availability === 'unavailable')
      .map(r => r.user_id);
    
    // Filter staff based on availability
    const dayAvailableStaff = availableStaff.filter(s => !unavailableUserIds.includes(s.id));
    
    // Determine shifts needed based on day
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const shiftsNeeded = isWeekend ? 6 : 4;
    
    // Priority 1: Create shifts for staff who explicitly requested this date
    requestedStaff.forEach(request => {
      const staffMember = availableStaff.find(s => s.id === request.user_id);
      if (!staffMember) return;
      
      const startTime = request.preferred_start_time || (shifts.filter(s => s.shiftDate === dateStr).length < shiftsNeeded / 2 ? '09:00' : '17:00');
      const endTime = request.preferred_end_time || (startTime === '09:00' ? '14:00' : '22:00');
      const positionId = request.preferred_position_id || positions[0]?.id;
      
      shifts.push({
        id: randomUUID(),
        storeId,
        userId: request.user_id,
        positionId,
        shiftDate: dateStr,
        startTime,
        endTime,
        breakMinutes: startTime === '09:00' ? 0 : 60,
        status: 'draft',
        notes: 'スタッフ希望に基づく'
      });
    });
    
    // Priority 2: Fill remaining slots with available staff
    const assignedCount = shifts.filter(s => s.shiftDate === dateStr).length;
    const remainingSlots = shiftsNeeded - assignedCount;
    
    if (remainingSlots > 0) {
      // Get staff not yet assigned today
      const assignedUserIds = shifts.filter(s => s.shiftDate === dateStr).map(s => s.userId);
      const unassignedStaff = dayAvailableStaff.filter(s => !assignedUserIds.includes(s.id));
      
      // Distribute remaining slots
      for (let i = 0; i < Math.min(remainingSlots, unassignedStaff.length); i++) {
        const staffMember = unassignedStaff[i];
        const position = positions[i % positions.length];
        const isMorningShift = i < remainingSlots / 2;
        
        shifts.push({
          id: randomUUID(),
          storeId,
          userId: staffMember.id,
          positionId: position.id,
          shiftDate: dateStr,
          startTime: isMorningShift ? '09:00' : '17:00',
          endTime: isMorningShift ? '14:00' : '22:00',
          breakMinutes: isMorningShift ? 0 : 60,
          status: 'draft'
        });
      }
    }
    
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
    
    // Get shift requests (submitted or approved only)
    const requests = db.prepare(`
      SELECT * FROM shift_requests 
      WHERE store_id = ? 
      AND request_date BETWEEN ? AND ? 
      AND status IN ('submitted', 'approved')
    `).all(storeId, startDate, endDate);
    
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
