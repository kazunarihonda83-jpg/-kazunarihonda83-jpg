import express from 'express';
import { register, login, getCurrentUser, changePassword, getAllUsers, updateUser, deleteUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);

// User management (admin/manager only)
router.get('/users', authenticate, authorize('admin', 'manager'), getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, authorize('admin', 'manager'), deleteUser);

export default router;
