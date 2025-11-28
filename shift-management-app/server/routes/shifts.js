import express from 'express';
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  generateShifts,
  publishShifts,
  simulateLaborCost
} from '../controllers/shiftController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getShifts);
router.get('/simulate/labor-cost', authenticate, authorize('admin', 'manager'), simulateLaborCost);
router.get('/:id', authenticate, getShiftById);
router.post('/', authenticate, authorize('admin', 'manager'), createShift);
router.post('/generate', authenticate, authorize('admin', 'manager'), generateShifts);
router.post('/publish', authenticate, authorize('admin', 'manager'), publishShifts);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateShift);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteShift);

export default router;
