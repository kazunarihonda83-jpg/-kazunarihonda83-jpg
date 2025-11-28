import express from 'express';
import {
  getShiftRequests,
  getShiftRequestById,
  createShiftRequest,
  createBulkShiftRequests,
  updateShiftRequest,
  submitShiftRequests,
  approveShiftRequests,
  deleteShiftRequest,
  getSubmissionStatus
} from '../controllers/shiftRequestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get submission status
router.get('/status', getSubmissionStatus);

// Get shift requests (filtered by query params)
router.get('/', getShiftRequests);

// Get single shift request
router.get('/:id', getShiftRequestById);

// Create single shift request (staff can create their own)
router.post('/', createShiftRequest);

// Create bulk shift requests (staff submitting monthly requests)
router.post('/bulk', createBulkShiftRequests);

// Submit shift requests for approval
router.post('/submit', submitShiftRequests);

// Approve shift requests (admin/manager only)
router.post('/approve', authorize('admin', 'manager'), approveShiftRequests);

// Update shift request
router.put('/:id', updateShiftRequest);

// Delete shift request
router.delete('/:id', deleteShiftRequest);

export default router;
