import express from 'express';
import {
    getIndustries,
    getIndustry,
    createIndustry,
    updateIndustry,
    deleteIndustry
} from '../controllers/industryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getIndustries);
router.get('/:key', getIndustry);

// Admin routes
router.post('/', protect, authorize('admin'), createIndustry);
router.put('/:key', protect, authorize('admin'), updateIndustry);
router.delete('/:key', protect, authorize('admin'), deleteIndustry);

export default router;
