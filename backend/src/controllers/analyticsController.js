import { Survey } from '../models/index.js';

// @desc    Get overview analytics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalSurveys,
            todaySurveys,
            weekSurveys,
            monthSurveys,
            byStatus,
            bySource,
            recentSurveys
        ] = await Promise.all([
            Survey.countDocuments(),
            Survey.countDocuments({ 'meta.submittedAt': { $gte: startOfToday } }),
            Survey.countDocuments({ 'meta.submittedAt': { $gte: startOfWeek } }),
            Survey.countDocuments({ 'meta.submittedAt': { $gte: startOfMonth } }),
            Survey.aggregate([
                { $group: { _id: '$meta.status', count: { $sum: 1 } } }
            ]),
            Survey.aggregate([
                { $group: { _id: '$meta.source', count: { $sum: 1 } } }
            ]),
            Survey.find()
                .select('surveyId business.name business.industry meta.submittedAt meta.status')
                .sort('-meta.submittedAt')
                .limit(10)
        ]);

        res.json({
            success: true,
            data: {
                totals: {
                    all: totalSurveys,
                    today: todaySurveys,
                    thisWeek: weekSurveys,
                    thisMonth: monthSurveys
                },
                byStatus: byStatus.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                bySource: bySource.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                recentSurveys
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get industry-wise analytics
// @route   GET /api/analytics/by-industry
// @access  Private
export const getByIndustry = async (req, res, next) => {
    try {
        const analytics = await Survey.aggregate([
            {
                $group: {
                    _id: {
                        industry: '$business.industry',
                        subCategory: '$business.subCategory'
                    },
                    count: { $sum: 1 },
                    avgBudgetMin: { $avg: '$currentProcurement.monthlyBudget.min' },
                    avgBudgetMax: { $avg: '$currentProcurement.monthlyBudget.max' },
                    avgCreditPeriod: { $avg: '$currentProcurement.preferredCreditPeriod' }
                }
            },
            {
                $group: {
                    _id: '$_id.industry',
                    total: { $sum: '$count' },
                    subCategories: {
                        $push: {
                            name: '$_id.subCategory',
                            count: '$count',
                            avgBudgetMin: '$avgBudgetMin',
                            avgBudgetMax: '$avgBudgetMax'
                        }
                    },
                    avgCreditPeriod: { $avg: '$avgCreditPeriod' }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get location analytics
// @route   GET /api/analytics/by-location
// @access  Private
export const getByLocation = async (req, res, next) => {
    try {
        const { level = 'city' } = req.query;

        const groupField = level === 'state'
            ? '$business.address.state'
            : '$business.address.city';

        const analytics = await Survey.aggregate([
            {
                $match: {
                    [level === 'state' ? 'business.address.state' : 'business.address.city']: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: groupField,
                    count: { $sum: 1 },
                    industries: { $addToSet: '$business.industry' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);

        // Get geo coordinates for map
        const geoData = await Survey.aggregate([
            {
                $match: {
                    'business.location.coordinates.0': { $ne: 0 }
                }
            },
            {
                $project: {
                    coordinates: '$business.location.coordinates',
                    industry: '$business.industry',
                    city: '$business.address.city'
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                distribution: analytics,
                geoPoints: geoData
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get procurement patterns analytics
// @route   GET /api/analytics/procurement
// @access  Private
export const getProcurement = async (req, res, next) => {
    try {
        const [
            paymentMethods,
            creditPeriods,
            painPoints,
            switchWillingness,
            budgetRanges
        ] = await Promise.all([
            // Payment methods distribution
            Survey.aggregate([
                { $unwind: '$currentProcurement.paymentMethods' },
                { $group: { _id: '$currentProcurement.paymentMethods', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Credit period preferences
            Survey.aggregate([
                { $match: { 'currentProcurement.preferredCreditPeriod': { $exists: true } } },
                {
                    $bucket: {
                        groupBy: '$currentProcurement.preferredCreditPeriod',
                        boundaries: [0, 7, 15, 30, 45, 60, 90, Infinity],
                        default: 'Other',
                        output: { count: { $sum: 1 } }
                    }
                }
            ]),

            // Pain points
            Survey.aggregate([
                { $unwind: '$currentProcurement.painPoints' },
                { $group: { _id: '$currentProcurement.painPoints', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Willingness to switch
            Survey.aggregate([
                { $group: { _id: '$currentProcurement.willingToSwitch', count: { $sum: 1 } } }
            ]),

            // Budget ranges by industry
            Survey.aggregate([
                { $match: { 'currentProcurement.monthlyBudget.min': { $exists: true } } },
                {
                    $group: {
                        _id: '$business.industry',
                        avgMin: { $avg: '$currentProcurement.monthlyBudget.min' },
                        avgMax: { $avg: '$currentProcurement.monthlyBudget.max' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                paymentMethods,
                creditPeriods,
                painPoints,
                switchWillingness: switchWillingness.reduce((acc, curr) => {
                    acc[curr._id || 'not_answered'] = curr.count;
                    return acc;
                }, {}),
                budgetRanges
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get time-series analytics
// @route   GET /api/analytics/timeline
// @access  Private
export const getTimeline = async (req, res, next) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const timeline = await Survey.aggregate([
            {
                $match: {
                    'meta.submittedAt': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$meta.submittedAt' },
                        month: { $month: '$meta.submittedAt' },
                        day: { $dayOfMonth: '$meta.submittedAt' }
                    },
                    count: { $sum: 1 },
                    industries: { $addToSet: '$business.industry' }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    count: 1,
                    industryCount: { $size: '$industries' }
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.json({
            success: true,
            data: timeline
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export surveys data
// @route   GET /api/analytics/export
// @access  Private/Admin
export const exportData = async (req, res, next) => {
    try {
        const { format = 'json', industry, city, state, startDate, endDate } = req.query;

        const query = {};
        if (industry) query['business.industry'] = industry;
        if (city) query['business.address.city'] = new RegExp(city, 'i');
        if (state) query['business.address.state'] = new RegExp(state, 'i');
        if (startDate || endDate) {
            query['meta.submittedAt'] = {};
            if (startDate) query['meta.submittedAt'].$gte = new Date(startDate);
            if (endDate) query['meta.submittedAt'].$lte = new Date(endDate);
        }

        const surveys = await Survey.find(query)
            .populate('meta.collectedBy', 'name email')
            .sort('-meta.submittedAt')
            .lean();

        if (format === 'csv') {
            // Flatten for CSV export
            const flatData = surveys.map(s => ({
                surveyId: s.surveyId,
                businessName: s.business?.name,
                industry: s.business?.industry,
                subCategory: s.business?.subCategory,
                ownerName: s.business?.ownerName,
                phone: s.business?.contactPhone,
                email: s.business?.contactEmail,
                city: s.business?.address?.city,
                state: s.business?.address?.state,
                pincode: s.business?.address?.pincode,
                monthlyBudgetMin: s.currentProcurement?.monthlyBudget?.min,
                monthlyBudgetMax: s.currentProcurement?.monthlyBudget?.max,
                preferredCreditPeriod: s.currentProcurement?.preferredCreditPeriod,
                willingToSwitch: s.currentProcurement?.willingToSwitch,
                painPoints: s.currentProcurement?.painPoints?.join('; '),
                source: s.meta?.source,
                status: s.meta?.status,
                submittedAt: s.meta?.submittedAt,
                collectedBy: s.meta?.collectedBy?.name
            }));

            // Convert to CSV
            const headers = Object.keys(flatData[0] || {});
            const csvRows = [
                headers.join(','),
                ...flatData.map(row =>
                    headers.map(h => {
                        const val = row[h];
                        if (val === null || val === undefined) return '';
                        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                        return val;
                    }).join(',')
                )
            ];

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=surveys-export.csv');
            return res.send(csvRows.join('\n'));
        }

        res.json({
            success: true,
            count: surveys.length,
            data: surveys
        });
    } catch (error) {
        next(error);
    }
};
