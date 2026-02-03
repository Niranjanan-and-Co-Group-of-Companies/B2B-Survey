import express from 'express';
import {
    getOverview,
    getByIndustry,
    getByLocation,
    getProcurement,
    getTimeline,
    exportData
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes are protected
router.use(protect);

router.get('/overview', getOverview);
router.get('/by-industry', getByIndustry);
router.get('/by-location', getByLocation);
router.get('/procurement', getProcurement);
router.get('/timeline', getTimeline);
router.get('/export', authorize('admin'), exportData);

export default router;
