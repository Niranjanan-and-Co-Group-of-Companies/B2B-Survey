import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'B2B Survey API is running!',
        timestamp: new Date().toISOString(),
        database: process.env.SUPABASE_URL ? 'Supabase connected' : 'No database configured'
    });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }
    });
});

// ============================================
// INDUSTRIES ROUTES
// ============================================
app.get('/api/industries', async (req, res) => {
    try {
        const { data: industries, error } = await supabase
            .from('industries')
            .select(`
        *,
        sub_categories (*)
      `)
            .order('display_name');

        if (error) throw error;

        res.json({ success: true, data: industries });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/industries/:key', async (req, res) => {
    try {
        const { data: industry, error } = await supabase
            .from('industries')
            .select(`
        *,
        sub_categories (*),
        industry_questions (*)
      `)
            .eq('industry_key', req.params.key)
            .single();

        if (error) throw error;

        res.json({ success: true, data: industry });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Industry not found' });
    }
});

// Create new industry
app.post('/api/industries', authenticate, async (req, res) => {
    try {
        const { industry_key, display_name, icon, description, is_active } = req.body;

        const { data: industry, error } = await supabase
            .from('industries')
            .insert([{ industry_key, display_name, icon, description, is_active }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data: industry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update industry
app.put('/api/industries/:id', authenticate, async (req, res) => {
    try {
        const { display_name, icon, description, is_active } = req.body;

        const { data: industry, error } = await supabase
            .from('industries')
            .update({ display_name, icon, description, is_active })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data: industry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete industry
app.delete('/api/industries/:id', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('industries')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'Industry deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// INDUSTRY QUESTIONS ROUTES
// ============================================

// Get questions for an industry
app.get('/api/industries/:id/questions', authenticate, async (req, res) => {
    try {
        const { data: questions, error } = await supabase
            .from('industry_questions')
            .select('*')
            .eq('industry_id', req.params.id)
            .order('display_order');

        if (error) throw error;

        res.json({ success: true, data: questions || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add question to industry
app.post('/api/industries/:id/questions', authenticate, async (req, res) => {
    try {
        const { question_key, question_text, question_type, options, is_required } = req.body;

        // Get max display_order
        const { data: existing } = await supabase
            .from('industry_questions')
            .select('display_order')
            .eq('industry_id', req.params.id)
            .order('display_order', { ascending: false })
            .limit(1);

        const display_order = (existing?.[0]?.display_order || 0) + 1;

        const { data: question, error } = await supabase
            .from('industry_questions')
            .insert([{
                industry_id: req.params.id,
                question_key,
                question_text,
                question_type,
                options: options || [],
                is_required,
                display_order
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update question
app.put('/api/industries/:industryId/questions/:questionId', authenticate, async (req, res) => {
    try {
        const { question_key, question_text, question_type, options, is_required } = req.body;

        const { data: question, error } = await supabase
            .from('industry_questions')
            .update({ question_key, question_text, question_type, options, is_required })
            .eq('id', req.params.questionId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete question
app.delete('/api/industries/:industryId/questions/:questionId', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('industry_questions')
            .delete()
            .eq('id', req.params.questionId);

        if (error) throw error;

        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// USERS ROUTES
// ============================================

// Get all users
app.get('/api/users', authenticate, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, is_active, last_active, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: users || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new user
app.post('/api/users', authenticate, async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ email, name, password_hash, role, is_active: true }])
            .select('id, email, name, role, is_active, created_at')
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user
app.put('/api/users/:id', authenticate, async (req, res) => {
    try {
        const { name, role, is_active, password } = req.body;

        const updates = { name, role, is_active };
        if (password) {
            updates.password_hash = await bcrypt.hash(password, 10);
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select('id, email, name, role, is_active, created_at')
            .single();

        if (error) throw error;

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SURVEYS ROUTES
// ============================================

// Submit survey (public)
app.post('/api/surveys', async (req, res) => {
    try {
        const { business, currentProcurement, industryData, meta } = req.body;

        // Validate required data
        if (!business || !business.name) {
            return res.status(400).json({
                success: false,
                error: 'Business name is required'
            });
        }

        // Generate survey ID
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const surveyId = `SRV-${timestamp}-${random}`;

        // Get industry ID from key
        let industryId = null;
        if (business.industry) {
            const { data: industry } = await supabase
                .from('industries')
                .select('id')
                .eq('industry_key', business.industry)
                .single();
            industryId = industry?.id;
        }

        const surveyData = {
            survey_id: surveyId,
            business_name: business.name,
            industry_id: industryId,
            sub_category: business.subCategory || null,
            owner_name: business.ownerName || null,
            contact_phone: business.contactPhone || null,
            contact_email: business.contactEmail || null,
            city: business.address?.city || null,
            state: business.address?.state || null,
            pincode: business.address?.pincode || null,
            street: business.address?.street || null,
            location_source: business.locationSource || 'not_provided',
            years_in_operation: business.yearsInOperation || null,
            employees_count: business.employeeCount || business.employeesCount || null,
            current_method: currentProcurement?.method || null,
            monthly_budget_min: currentProcurement?.monthlyBudget?.min || null,
            monthly_budget_max: currentProcurement?.monthlyBudget?.max || null,
            preferred_credit_period: currentProcurement?.preferredCreditPeriod || null,
            pain_points: currentProcurement?.painPoints || null,
            willing_to_switch: currentProcurement?.willingToSwitch || null,
            industry_data: industryData || {},
            source: meta?.source || 'website',
            status: 'submitted'
        };

        // Handle location if provided
        if (business.location?.coordinates && Array.isArray(business.location.coordinates)) {
            const [lng, lat] = business.location.coordinates;
            if (lng && lat) {
                surveyData.location = `POINT(${lng} ${lat})`;
            }
        }

        const { data: survey, error } = await supabase
            .from('surveys')
            .insert([surveyData])
            .select()
            .single();

        if (error) {
            console.error('Survey insert error:', error);
            throw error;
        }

        res.status(201).json({
            success: true,
            data: {
                surveyId: survey.survey_id,
                id: survey.id
            }
        });
    } catch (error) {
        console.error('Survey submission error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get surveys (protected)
app.get('/api/surveys', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, industry, city, status } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('surveys')
            .select(`
        *,
        industries (display_name, icon)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (industry) query = query.eq('industry_id', industry);
        if (city) query = query.ilike('city', `%${city}%`);
        if (status) query = query.eq('status', status);

        const { data: surveys, count, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: surveys,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single survey
app.get('/api/surveys/:id', authenticate, async (req, res) => {
    try {
        const { data: survey, error } = await supabase
            .from('surveys')
            .select(`
        *,
        industries (*)
      `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        res.json({ success: true, data: survey });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Survey not found' });
    }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Overview stats - now with direct queries if views don't exist
app.get('/api/analytics/overview', authenticate, async (req, res) => {
    try {
        const { industry, state } = req.query;

        // Build base query with filters
        const buildQuery = (baseQuery) => {
            let query = baseQuery;
            if (industry) {
                // Need to join with industries to filter by industry_key
                query = query.eq('industries.industry_key', industry);
            }
            if (state) {
                query = query.eq('state', state);
            }
            return query;
        };

        // Calculate stats directly from surveys table with filters
        let baseQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true });
        if (industry) baseQuery = baseQuery.eq('industries.industry_key', industry);
        if (state) baseQuery = baseQuery.eq('state', state);
        const { count: total } = await baseQuery;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).gte('created_at', today.toISOString());
        if (industry) todayQuery = todayQuery.eq('industries.industry_key', industry);
        if (state) todayQuery = todayQuery.eq('state', state);
        const { count: todayCount } = await todayQuery;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        let weekQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
        if (industry) weekQuery = weekQuery.eq('industries.industry_key', industry);
        if (state) weekQuery = weekQuery.eq('state', state);
        const { count: weekCount } = await weekQuery;

        let submittedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'submitted');
        if (industry) submittedQuery = submittedQuery.eq('industries.industry_key', industry);
        if (state) submittedQuery = submittedQuery.eq('state', state);
        const { count: submitted } = await submittedQuery;

        let verifiedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'verified');
        if (industry) verifiedQuery = verifiedQuery.eq('industries.industry_key', industry);
        if (state) verifiedQuery = verifiedQuery.eq('state', state);
        const { count: verified } = await verifiedQuery;

        let rejectedQuery = supabase.from('surveys').select('*, industries!inner(industry_key)', { count: 'exact', head: true }).eq('status', 'rejected');
        if (industry) rejectedQuery = rejectedQuery.eq('industries.industry_key', industry);
        if (state) rejectedQuery = rejectedQuery.eq('state', state);
        const { count: rejected } = await rejectedQuery;

        // Get source counts (without filters for now)
        const { count: fromWeb } = await supabase.from('surveys').select('*', { count: 'exact', head: true }).eq('source', 'website');
        const { count: fromMobile } = await supabase.from('surveys').select('*', { count: 'exact', head: true }).eq('source', 'mobile_app');

        res.json({
            success: true,
            data: {
                totals: {
                    all: total || 0,
                    today: todayCount || 0,
                    thisWeek: weekCount || 0,
                    thisMonth: total || 0
                },
                byStatus: {
                    submitted: submitted || 0,
                    verified: verified || 0,
                    rejected: rejected || 0
                },
                bySource: {
                    website: fromWeb || 0,
                    mobile_app: fromMobile || 0
                }
            }
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Industry distribution for charts
app.get('/api/analytics/by-industry', authenticate, async (req, res) => {
    try {
        const { state } = req.query;

        // Manual aggregation with optional state filter
        let query = supabase.from('surveys').select('industry_id, industries(display_name, icon)');
        if (state) query = query.eq('state', state);

        const { data: surveys } = await query;

        const counts = {};
        (surveys || []).forEach(s => {
            const name = s.industries?.display_name || 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        });

        const data = Object.entries(counts).map(([name, count]) => ({ name, count }));
        data.sort((a, b) => b.count - a.count);

        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Timeline data for line chart (past 30 days)
app.get('/api/analytics/timeline', authenticate, async (req, res) => {
    try {
        const { industry, state } = req.query;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let query = supabase
            .from('surveys')
            .select('created_at, industries!inner(industry_key)')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at');

        if (industry) query = query.eq('industries.industry_key', industry);
        if (state) query = query.eq('state', state);

        const { data: surveys } = await query;

        // Group by date
        const dailyCounts = {};
        (surveys || []).forEach(s => {
            const date = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        // Generate all dates in range
        const result = [];
        const current = new Date(thirtyDaysAgo);
        const now = new Date();
        while (current <= now) {
            const dateStr = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            result.push({
                date: dateStr,
                count: dailyCounts[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Location distribution
app.get('/api/analytics/by-location', authenticate, async (req, res) => {
    try {
        const { industry } = req.query;

        // Query with optional industry filter
        let query = supabase.from('surveys').select('state, industries!inner(industry_key)');
        if (industry) query = query.eq('industries.industry_key', industry);

        const { data: surveys } = await query;

        // Group by state
        const counts = {};
        (surveys || []).forEach(s => {
            const state = s.state || 'Unknown';
            counts[state] = (counts[state] || 0) + 1;
        });

        const data = Object.entries(counts).map(([state, count]) => ({ state, count }));
        data.sort((a, b) => b.count - a.count);

        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update survey status (verify/reject)
app.put('/api/surveys/:id/status', authenticate, async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['submitted', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const updates = {
            status,
            verified_at: status === 'verified' ? new Date().toISOString() : null,
            verified_by: status === 'verified' ? req.user.id : null
        };

        if (notes) {
            updates.notes = notes;
        }

        const { data: survey, error } = await supabase
            .from('surveys')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data: survey });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PER-QUESTION ANALYTICS
// ============================================
app.get('/api/analytics/per-question', authenticate, async (req, res) => {
    try {
        // Get all industry questions
        const { data: questions, error: qError } = await supabase
            .from('industry_questions')
            .select(`
                id,
                field_key,
                label,
                field_type,
                options,
                industry_id,
                industries (display_name)
            `)
            .order('display_order');

        if (qError) throw qError;

        // Get all surveys with industry data
        const { data: surveys, error: sError } = await supabase
            .from('surveys')
            .select('industry_data, industry_id');

        if (sError) throw sError;

        // Analyze each question
        const analysis = questions?.map(q => {
            // Find surveys that answer this question
            const relevantSurveys = surveys?.filter(s =>
                s.industry_id === q.industry_id &&
                s.industry_data &&
                s.industry_data[q.field_key] !== undefined
            ) || [];

            const responses = relevantSurveys.length;
            const values = relevantSurveys.map(s => s.industry_data[q.field_key]);

            let data = [];
            let stats = null;

            if (q.field_type === 'number') {
                // Calculate number stats
                const numericValues = values.filter(v => typeof v === 'number');
                if (numericValues.length > 0) {
                    stats = {
                        avg: Math.round(numericValues.reduce((a, b) => a + b, 0) / numericValues.length),
                        min: Math.min(...numericValues),
                        max: Math.max(...numericValues)
                    };
                    // Create histogram buckets
                    const range = stats.max - stats.min;
                    const bucketSize = range > 0 ? Math.ceil(range / 5) : 1;
                    const buckets = {};
                    numericValues.forEach(v => {
                        const bucket = Math.floor((v - stats.min) / bucketSize) * bucketSize + stats.min;
                        const label = `${bucket}-${bucket + bucketSize}`;
                        buckets[label] = (buckets[label] || 0) + 1;
                    });
                    data = Object.entries(buckets).map(([label, value]) => ({ label, value }));
                }
            } else if (q.field_type === 'select' || q.field_type === 'boolean') {
                // Count occurrences
                const counts = {};
                values.forEach(v => {
                    const label = String(v);
                    counts[label] = (counts[label] || 0) + 1;
                });
                data = Object.entries(counts).map(([label, value]) => ({ label, value }));
            } else if (q.field_type === 'multiselect') {
                // Count each selection
                const counts = {};
                values.forEach(v => {
                    if (Array.isArray(v)) {
                        v.forEach(item => {
                            counts[item] = (counts[item] || 0) + 1;
                        });
                    }
                });
                data = Object.entries(counts).map(([label, value]) => ({ label, value }));
            }

            return {
                questionKey: q.field_key,
                questionText: q.label,
                questionType: q.field_type,
                responses,
                data,
                stats
            };
        }).filter(q => q.responses > 0) || [];

        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Per-question analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PHOTO UPLOAD
// ============================================
app.post('/api/upload/photo', async (req, res) => {
    try {
        const { photo, surveyId, filename } = req.body;

        if (!photo || !surveyId) {
            return res.status(400).json({
                success: false,
                error: 'Photo and surveyId are required'
            });
        }

        // Photo is base64 encoded
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const fileExt = filename?.split('.').pop() || 'jpg';
        const filePath = `surveys/${surveyId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('survey-photos')
            .upload(filePath, buffer, {
                contentType: `image/${fileExt}`,
                upsert: false
            });

        if (error) {
            // If bucket doesn't exist, return helpful error
            if (error.message.includes('bucket')) {
                return res.status(400).json({
                    success: false,
                    error: 'Photo storage not configured. Create a bucket named "survey-photos" in Supabase Storage.'
                });
            }
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('survey-photos')
            .getPublicUrl(filePath);

        res.json({
            success: true,
            data: {
                path: filePath,
                url: publicUrl
            }
        });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get photos for a survey
app.get('/api/surveys/:id/photos', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // List files in the survey folder
        const { data, error } = await supabase.storage
            .from('survey-photos')
            .list(`surveys/${id}`);

        if (error) throw error;

        // Get public URLs
        const photos = data?.map(file => {
            const { data: { publicUrl } } = supabase.storage
                .from('survey-photos')
                .getPublicUrl(`surveys/${id}/${file.name}`);
            return {
                name: file.name,
                url: publicUrl,
                createdAt: file.created_at
            };
        }) || [];

        res.json({ success: true, data: photos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🚀 B2B Survey API Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local:    http://localhost:${PORT}
📍 Health:   http://localhost:${PORT}/api/health
📍 API Docs: http://localhost:${PORT}/api/industries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
