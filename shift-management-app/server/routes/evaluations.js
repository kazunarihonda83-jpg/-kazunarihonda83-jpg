import express from 'express';
import {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  getFeedback,
  createFeedback,
  getGoals,
  createGoal,
  updateGoal,
  getMotivationStats
} from '../controllers/evaluationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getEvaluations);
router.get('/:id', authenticate, getEvaluationById);
router.post('/', authenticate, authorize('admin', 'manager'), createEvaluation);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateEvaluation);

router.get('/feedback/user/:userId', authenticate, getFeedback);
router.post('/feedback', authenticate, createFeedback);

router.get('/goals/user/:userId', authenticate, getGoals);
router.post('/goals', authenticate, createGoal);
router.put('/goals/:id', authenticate, updateGoal);

router.get('/motivation/user/:userId', authenticate, getMotivationStats);

export default router;
