import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';
import { format } from 'date-fns';

// Clock in
export const clockIn = (req, res) => {
  try {
    const userId = req.user.id;
    const { method = 'manual', location } = req.body;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check if already clocked in today
    const existing = db.prepare(`
      SELECT * FROM attendances 
      WHERE user_id = ? AND DATE(clock_in) = ? AND status != 'completed'
    `).get(userId, today);
    
    if (existing) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }
    
    const attendanceId = randomUUID();
    const clockInTime = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO attendances (id, user_id, clock_in, clock_in_method, clock_in_location, status)
      VALUES (?, ?, ?, ?, ?, 'working')
    `);
    
    stmt.run(attendanceId, userId, clockInTime, method, location || null);
    
    const attendance = db.prepare('SELECT * FROM attendances WHERE id = ?').get(attendanceId);
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
};

// Clock out
export const clockOut = (req, res) => {
  try {
    const userId = req.user.id;
    const { breakMinutes = 0, method = 'manual', location } = req.body;
    
    // Find today's active attendance
    const attendance = db.prepare(`
      SELECT * FROM attendances 
      WHERE user_id = ? AND status = 'working'
      ORDER BY clock_in DESC
      LIMIT 1
    `).get(userId);
    
    if (!attendance) {
      return res.status(400).json({ error: 'No active clock-in found' });
    }
    
    const clockOutTime = new Date().toISOString();
    const clockInTime = new Date(attendance.clock_in);
    const clockOut = new Date(clockOutTime);
    
    // Calculate work hours in minutes
    const totalMinutes = Math.floor((clockOut - clockInTime) / 1000 / 60);
    const workMinutes = totalMinutes - breakMinutes;
    
    const stmt = db.prepare(`
      UPDATE attendances 
      SET clock_out = ?, 
          clock_out_method = ?,
          clock_out_location = ?,
          break_minutes = ?, 
          work_hours = ?, 
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(clockOutTime, method, location || null, breakMinutes, workMinutes, attendance.id);
    
    const updated = db.prepare('SELECT * FROM attendances WHERE id = ?').get(attendance.id);
    
    res.json(updated);
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
};

// Get today's attendance
export const getTodayAttendance = (req, res) => {
  try {
    const userId = req.user.id;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const attendance = db.prepare(`
      SELECT * FROM attendances 
      WHERE user_id = ? AND DATE(clock_in) = ?
      ORDER BY clock_in DESC
      LIMIT 1
    `).get(userId, today);
    
    res.json(attendance || null);
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get attendance history
export const getAttendanceHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM attendances WHERE user_id = ?';
    const params = [userId];
    
    if (startDate) {
      query += ' AND DATE(clock_in) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(clock_in) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY clock_in DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const attendances = db.prepare(query).all(...params);
    
    res.json(attendances);
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};

// Get all staff attendance (admin/manager only)
export const getAllAttendance = (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.hourly_wage
      FROM attendances a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(a.clock_in) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(a.clock_in) <= ?';
      params.push(endDate);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY a.clock_in DESC';
    
    const attendances = db.prepare(query).all(...params);
    
    res.json(attendances);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get attendance stats
export const getAttendanceStats = (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    
    let dateFilter = '';
    const params = [userId];
    
    if (month) {
      dateFilter = "AND strftime('%Y-%m', clock_in) = ?";
      params.push(month);
    } else {
      dateFilter = "AND strftime('%Y-%m', clock_in) = strftime('%Y-%m', 'now')";
    }
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as worked_days,
        SUM(work_hours) as total_minutes,
        AVG(work_hours) as avg_minutes
      FROM attendances 
      WHERE user_id = ? AND status = 'completed' ${dateFilter}
    `).get(...params);
    
    // Get hourly wage
    const user = db.prepare('SELECT hourly_wage FROM users WHERE id = ?').get(userId);
    
    res.json({
      workedDays: stats.worked_days || 0,
      totalHours: stats.total_minutes ? (stats.total_minutes / 60).toFixed(1) : '0.0',
      averageHours: stats.avg_minutes ? (stats.avg_minutes / 60).toFixed(1) : '0.0',
      hourlyWage: user.hourly_wage || 0
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
