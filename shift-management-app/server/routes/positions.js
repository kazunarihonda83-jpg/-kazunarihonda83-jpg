import express from 'express';
import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
} from '../controllers/positionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getPositions);
router.get('/:id', authenticate, getPositionById);
router.post('/', authenticate, authorize('admin', 'manager'), createPosition);
router.put('/:id', authenticate, authorize('admin', 'manager'), updatePosition);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deletePosition);

export default router;
