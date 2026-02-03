import { IndustryConfig } from '../models/index.js';

// @desc    Get all industries
// @route   GET /api/industries
// @access  Public
export const getIndustries = async (req, res, next) => {
    try {
        const { active } = req.query;

        const query = active !== 'false' ? { isActive: true } : {};

        const industries = await IndustryConfig.find(query)
            .select('industryKey displayName icon description subCategories')
            .sort('displayName');

        res.json({
            success: true,
            count: industries.length,
            data: industries
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single industry with full details
// @route   GET /api/industries/:key
// @access  Public
export const getIndustry = async (req, res, next) => {
    try {
        const industry = await IndustryConfig.findOne({
            industryKey: req.params.key
        });

        if (!industry) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found'
            });
        }

        res.json({
            success: true,
            data: industry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create industry config
// @route   POST /api/industries
// @access  Private/Admin
export const createIndustry = async (req, res, next) => {
    try {
        const industry = await IndustryConfig.create(req.body);

        res.status(201).json({
            success: true,
            data: industry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update industry config
// @route   PUT /api/industries/:key
// @access  Private/Admin
export const updateIndustry = async (req, res, next) => {
    try {
        const industry = await IndustryConfig.findOneAndUpdate(
            { industryKey: req.params.key },
            req.body,
            { new: true, runValidators: true }
        );

        if (!industry) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found'
            });
        }

        res.json({
            success: true,
            data: industry
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete industry config
// @route   DELETE /api/industries/:key
// @access  Private/Admin
export const deleteIndustry = async (req, res, next) => {
    try {
        const industry = await IndustryConfig.findOneAndDelete({
            industryKey: req.params.key
        });

        if (!industry) {
            return res.status(404).json({
                success: false,
                error: 'Industry not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
