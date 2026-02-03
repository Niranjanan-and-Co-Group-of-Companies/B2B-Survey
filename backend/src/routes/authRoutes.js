import express from 'express';
import { register, login, getMe, updatePassword, getUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.get('/users', protect, authorize('admin'), getUsers);

export default router;
