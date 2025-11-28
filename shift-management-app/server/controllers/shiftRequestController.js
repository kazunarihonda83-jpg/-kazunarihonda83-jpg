import db from '../db/sqlite.js';
import { randomUUID as uuidv4 } from 'crypto';

// Get shift requests by user and month
export const getShiftRequests = (req, res) => {
  try {
    const { userId, month, storeId } = req.query;
    
    let query = `
      SELECT 
        sr.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email,
        p.name as position_name,
        p.color as position_color,
        approver.first_name || ' ' || approver.last_name as approved_by_name
      FROM shift_requests sr
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN positions p ON sr.preferred_position_id = p.id
      LEFT JOIN users approver ON sr.approved_by = approver.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userId) {
      query += ' AND sr.user_id = ?';
      params.push(userId);
    }
    
    if (month) {
      query += ' AND sr.request_month = ?';
      params.push(month);
    }
    
    if (storeId) {
      query += ' AND sr.store_id = ?';
      params.push(storeId);
    }
    
    query += ' ORDER BY sr.request_date ASC, sr.preferred_start_time ASC';
    
    const stmt = db.prepare(query);
    const requests = stmt.all(...params);
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching shift requests:', error);
    res.status(500).json({ message: 'Failed to fetch shift requests' });
  }
};

// Get shift request by ID
export const getShiftRequestById = (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare(`
      SELECT 
        sr.*,
        u.first_name || ' ' || u.last_name as user_name,
        p.name as position_name
      FROM shift_requests sr
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN positions p ON sr.preferred_position_id = p.id
      WHERE sr.id = ?
    `);
    
    const request = stmt.get(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Shift request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching shift request:', error);
    res.status(500).json({ message: 'Failed to fetch shift request' });
  }
};

// Create shift request
export const createShiftRequest = (req, res) => {
  try {
    const {
      userId,
      storeId,
      requestMonth,
      requestDate,
      preferredStartTime,
      preferredEndTime,
      preferredPositionId,
      availability,
      priority,
      notes
    } = req.body;
    
    // Validation
    if (!userId || !storeId || !requestMonth || !requestDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if request already exists
    const existingStmt = db.prepare(
      'SELECT id FROM shift_requests WHERE user_id = ? AND request_date = ? AND status != ?'
    );
    const existing = existingStmt.get(userId, requestDate, 'rejected');
    
    if (existing) {
      return res.status(400).json({ message: 'Shift request already exists for this date' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO shift_requests (
        id, user_id, store_id, request_month, request_date,
        preferred_start_time, preferred_end_time, preferred_position_id,
        availability, priority, notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `);
    
    stmt.run(
      id, userId, storeId, requestMonth, requestDate,
      preferredStartTime, preferredEndTime, preferredPositionId,
      availability, priority, notes, now, now
    );
    
    // Return created request
    const selectStmt = db.prepare('SELECT * FROM shift_requests WHERE id = ?');
    const newRequest = selectStmt.get(id);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating shift request:', error);
    res.status(500).json({ message: 'Failed to create shift request' });
  }
};

// Bulk create shift requests
export const createBulkShiftRequests = (req, res) => {
  try {
    const { userId, storeId, requestMonth, requests } = req.body;
    
    if (!userId || !storeId || !requestMonth || !Array.isArray(requests)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT INTO shift_requests (
        id, user_id, store_id, request_month, request_date,
        preferred_start_time, preferred_end_time, preferred_position_id,
        availability, priority, notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `);
    
    const createdIds = [];
    
    // Use transaction for bulk insert
    const transaction = db.transaction((requestsData) => {
      for (const req of requestsData) {
        const id = uuidv4();
        insertStmt.run(
          id, userId, storeId, requestMonth, req.requestDate,
          req.preferredStartTime, req.preferredEndTime, req.preferredPositionId,
          req.availability || 'available', req.priority || 1, req.notes,
          now, now
        );
        createdIds.push(id);
      }
    });
    
    transaction(requests);
    
    // Return created requests
    const selectStmt = db.prepare(`
      SELECT * FROM shift_requests WHERE id IN (${createdIds.map(() => '?').join(',')})
    `);
    const newRequests = selectStmt.all(...createdIds);
    
    res.status(201).json(newRequests);
  } catch (error) {
    console.error('Error creating bulk shift requests:', error);
    res.status(500).json({ message: 'Failed to create shift requests' });
  }
};

// Update shift request
export const updateShiftRequest = (req, res) => {
  try {
    const { id } = req.params;
    const {
      preferredStartTime,
      preferredEndTime,
      preferredPositionId,
      availability,
      priority,
      notes,
      status
    } = req.body;
    
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE shift_requests
      SET preferred_start_time = COALESCE(?, preferred_start_time),
          preferred_end_time = COALESCE(?, preferred_end_time),
          preferred_position_id = COALESCE(?, preferred_position_id),
          availability = COALESCE(?, availability),
          priority = COALESCE(?, priority),
          notes = COALESCE(?, notes),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      preferredStartTime, preferredEndTime, preferredPositionId,
      availability, priority, notes, status, now, id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Shift request not found' });
    }
    
    // Return updated request
    const selectStmt = db.prepare('SELECT * FROM shift_requests WHERE id = ?');
    const updatedRequest = selectStmt.get(id);
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating shift request:', error);
    res.status(500).json({ message: 'Failed to update shift request' });
  }
};

// Submit shift requests for a month
export const submitShiftRequests = (req, res) => {
  try {
    const { userId, month, storeId } = req.body;
    
    if (!userId || !month || !storeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE shift_requests
      SET status = 'submitted',
          submitted_at = ?,
          updated_at = ?
      WHERE user_id = ? AND request_month = ? AND store_id = ? AND status = 'pending'
    `);
    
    const result = stmt.run(now, now, userId, month, storeId);
    
    res.json({ 
      message: 'Shift requests submitted successfully',
      count: result.changes
    });
  } catch (error) {
    console.error('Error submitting shift requests:', error);
    res.status(500).json({ message: 'Failed to submit shift requests' });
  }
};

// Approve shift requests
export const approveShiftRequests = (req, res) => {
  try {
    const { requestIds, approvedBy } = req.body;
    
    if (!Array.isArray(requestIds) || !approvedBy) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE shift_requests
      SET status = 'approved',
          approved_at = ?,
          approved_by = ?,
          updated_at = ?
      WHERE id = ?
    `);
    
    const transaction = db.transaction((ids) => {
      for (const id of ids) {
        stmt.run(now, approvedBy, now, id);
      }
    });
    
    transaction(requestIds);
    
    res.json({ 
      message: 'Shift requests approved successfully',
      count: requestIds.length
    });
  } catch (error) {
    console.error('Error approving shift requests:', error);
    res.status(500).json({ message: 'Failed to approve shift requests' });
  }
};

// Delete shift request
export const deleteShiftRequest = (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM shift_requests WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Shift request not found' });
    }
    
    res.json({ message: 'Shift request deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift request:', error);
    res.status(500).json({ message: 'Failed to delete shift request' });
  }
};

// Get submission status for a user and month
export const getSubmissionStatus = (req, res) => {
  try {
    const { userId, month, storeId } = req.query;
    
    if (!userId || !month || !storeId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        MAX(submitted_at) as last_submitted_at
      FROM shift_requests
      WHERE user_id = ? AND request_month = ? AND store_id = ?
    `);
    
    const status = stmt.get(userId, month, storeId);
    
    res.json({
      ...status,
      can_submit: status.pending_count > 0,
      is_submitted: status.submitted_count > 0 || status.approved_count > 0
    });
  } catch (error) {
    console.error('Error fetching submission status:', error);
    res.status(500).json({ message: 'Failed to fetch submission status' });
  }
};
