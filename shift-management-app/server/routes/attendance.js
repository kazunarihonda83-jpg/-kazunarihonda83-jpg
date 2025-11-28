import express from 'express';
import {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/clock-in', authenticate, clockIn);
router.post('/clock-out', authenticate, clockOut);
router.get('/today', authenticate, getTodayAttendance);
router.get('/history', authenticate, getAttendanceHistory);
router.get('/all', authenticate, authorize('admin', 'manager'), getAllAttendance);
router.get('/stats', authenticate, getAttendanceStats);

export default router;
