import { Survey, User } from '../models/index.js';

// @desc    Create new survey
// @route   POST /api/surveys
// @access  Public (website) or Private (app)
export const createSurvey = async (req, res, next) => {
    try {
        const surveyData = {
            ...req.body,
            meta: {
                ...req.body.meta,
                source: req.body.meta?.source || 'website',
                collectedBy: req.user?._id,
                submittedAt: new Date()
            }
        };

        const survey = await Survey.create(surveyData);

        // Update collector's survey count if from app
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { surveysCollected: 1 }
            });
        }

        res.status(201).json({
            success: true,
            data: survey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all surveys with filters
// @route   GET /api/surveys
// @access  Private
export const getSurveys = async (req, res, next) => {
    try {
        const {
            industry,
            subCategory,
            city,
            state,
            status,
            source,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 20,
            sort = '-meta.submittedAt'
        } = req.query;

        // Build query
        const query = {};

        if (industry) query['business.industry'] = industry;
        if (subCategory) query['business.subCategory'] = subCategory;
        if (city) query['business.address.city'] = new RegExp(city, 'i');
        if (state) query['business.address.state'] = new RegExp(state, 'i');
        if (status) query['meta.status'] = status;
        if (source) query['meta.source'] = source;

        if (startDate || endDate) {
            query['meta.submittedAt'] = {};
            if (startDate) query['meta.submittedAt'].$gte = new Date(startDate);
            if (endDate) query['meta.submittedAt'].$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { 'business.name': new RegExp(search, 'i') },
                { 'business.ownerName': new RegExp(search, 'i') },
                { 'business.contactPhone': new RegExp(search, 'i') },
                { surveyId: new RegExp(search, 'i') }
            ];
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [surveys, total] = await Promise.all([
            Survey.find(query)
                .populate('meta.collectedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Survey.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: surveys.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: surveys
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single survey
// @route   GET /api/surveys/:id
// @access  Private
export const getSurvey = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.params.id)
            .populate('meta.collectedBy', 'name email')
            .populate('meta.verifiedBy', 'name email');

        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        res.json({
            success: true,
            data: survey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update survey
// @route   PUT /api/surveys/:id
// @access  Private
export const updateSurvey = async (req, res, next) => {
    try {
        let survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        survey = await Survey.findByIdAndUpdate(
            req.params.id,
            { ...req.body, 'meta.updatedAt': new Date() },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: survey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete survey
// @route   DELETE /api/surveys/:id
// @access  Private/Admin
export const deleteSurvey = async (req, res, next) => {
    try {
        const survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        await survey.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify survey
// @route   PUT /api/surveys/:id/verify
// @access  Private/Admin
export const verifySurvey = async (req, res, next) => {
    try {
        const { status, rejectionReason, internalNotes } = req.body;

        const survey = await Survey.findByIdAndUpdate(
            req.params.id,
            {
                'meta.status': status,
                'meta.verifiedBy': req.user._id,
                'meta.verifiedAt': new Date(),
                'meta.rejectionReason': rejectionReason,
                'meta.internalNotes': internalNotes
            },
            { new: true }
        );

        if (!survey) {
            return res.status(404).json({
                success: false,
                error: 'Survey not found'
            });
        }

        res.json({
            success: true,
            data: survey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk create surveys (for mobile app sync)
// @route   POST /api/surveys/bulk
// @access  Private
export const bulkCreateSurveys = async (req, res, next) => {
    try {
        const { surveys } = req.body;

        if (!Array.isArray(surveys) || surveys.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of surveys'
            });
        }

        // Add collector info to all surveys
        const surveysWithMeta = surveys.map(survey => ({
            ...survey,
            meta: {
                ...survey.meta,
                collectedBy: req.user._id,
                submittedAt: survey.meta?.submittedAt || new Date()
            }
        }));

        const createdSurveys = await Survey.insertMany(surveysWithMeta, {
            ordered: false // Continue on error
        });

        // Update collector's survey count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { surveysCollected: createdSurveys.length }
        });

        res.status(201).json({
            success: true,
            count: createdSurveys.length,
            data: createdSurveys.map(s => ({ id: s._id, surveyId: s.surveyId }))
        });
    } catch (error) {
        next(error);
    }
};
