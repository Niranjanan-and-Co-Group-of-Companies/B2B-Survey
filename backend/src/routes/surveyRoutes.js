import express from 'express';
import {
    createSurvey,
    getSurveys,
    getSurvey,
    updateSurvey,
    deleteSurvey,
    verifySurvey,
    bulkCreateSurveys
} from '../controllers/surveyController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route for website submissions
router.post('/', optionalAuth, createSurvey);

// Protected routes
router.get('/', protect, getSurveys);
router.get('/:id', protect, getSurvey);
router.put('/:id', protect, updateSurvey);
router.delete('/:id', protect, authorize('admin'), deleteSurvey);
router.put('/:id/verify', protect, authorize('admin'), verifySurvey);

// Mobile app sync
router.post('/bulk', protect, bulkCreateSurveys);

export default router;
