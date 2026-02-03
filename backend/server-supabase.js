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
            .select('id, email, name, role, is_active, last_login, created_at')
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
            business_name: business.name,
            industry_id: industryId,
            sub_category: business.subCategory,
            owner_name: business.ownerName,
            contact_phone: business.contactPhone,
            contact_email: business.contactEmail,
            city: business.address?.city,
            state: business.address?.state,
            pincode: business.address?.pincode,
            street: business.address?.street,
            location_source: business.locationSource || 'not_provided',
            years_in_operation: business.yearsInOperation,
            employees_count: business.employeesCount,
            current_method: currentProcurement?.method,
            monthly_budget_min: currentProcurement?.monthlyBudget?.min,
            monthly_budget_max: currentProcurement?.monthlyBudget?.max,
            preferred_credit_period: currentProcurement?.preferredCreditPeriod,
            pain_points: currentProcurement?.painPoints,
            willing_to_switch: currentProcurement?.willingToSwitch,
            industry_data: industryData || {},
            source: meta?.source || 'website',
            status: 'submitted'
        };

        // Handle location if provided
        if (business.location?.coordinates) {
            const [lng, lat] = business.location.coordinates;
            surveyData.location = `POINT(${lng} ${lat})`;
        }

        const { data: survey, error } = await supabase
            .from('surveys')
            .insert([surveyData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: {
                surveyId: survey.survey_id,
                id: survey.id
            }
        });
    } catch (error) {
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
        // Try to get from view first
        let stats = null;
        try {
            const { data } = await supabase.from('survey_stats').select('*').single();
            stats = data;
        } catch (e) {
            // View doesn't exist, calculate manually
        }

        if (!stats) {
            // Calculate stats directly from surveys table
            const { count: total } = await supabase.from('surveys').select('*', { count: 'exact', head: true });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todayCount } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const { count: weekCount } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', weekAgo.toISOString());

            const { count: submitted } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'submitted');

            const { count: verified } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'verified');

            const { count: rejected } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'rejected');

            const { count: fromWeb } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .eq('source', 'website');

            const { count: fromMobile } = await supabase
                .from('surveys')
                .select('*', { count: 'exact', head: true })
                .eq('source', 'mobile_app');

            stats = {
                total_surveys: total || 0,
                today: todayCount || 0,
                this_week: weekCount || 0,
                this_month: total || 0,
                pending: submitted || 0,
                verified: verified || 0,
                rejected: rejected || 0,
                from_website: fromWeb || 0,
                from_mobile: fromMobile || 0
            };
        }

        res.json({
            success: true,
            data: {
                totals: {
                    all: stats.total_surveys || 0,
                    today: stats.today || 0,
                    thisWeek: stats.this_week || 0,
                    thisMonth: stats.this_month || 0
                },
                byStatus: {
                    submitted: stats.pending || 0,
                    verified: stats.verified || 0,
                    rejected: stats.rejected || 0
                },
                bySource: {
                    website: stats.from_website || 0,
                    mobile_app: stats.from_mobile || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Industry distribution for charts
app.get('/api/analytics/by-industry', authenticate, async (req, res) => {
    try {
        // Try view first, fallback to manual query
        let data = null;
        try {
            const { data: viewData } = await supabase.from('surveys_by_industry').select('*');
            data = viewData;
        } catch (e) { }

        if (!data || data.length === 0) {
            // Manual aggregation
            const { data: surveys } = await supabase
                .from('surveys')
                .select('industry_id, industries(display_name, icon)');

            const counts = {};
            (surveys || []).forEach(s => {
                const name = s.industries?.display_name || 'Unknown';
                counts[name] = (counts[name] || 0) + 1;
            });

            data = Object.entries(counts).map(([name, count]) => ({ name, count }));
        }

        res.json({ success: true, data: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Timeline data for line chart (past 30 days)
app.get('/api/analytics/timeline', authenticate, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: surveys } = await supabase
            .from('surveys')
            .select('created_at')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at');

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
        let data = null;
        try {
            const { data: viewData } = await supabase.from('surveys_by_city').select('*');
            data = viewData;
        } catch (e) { }

        if (!data || data.length === 0) {
            const { data: surveys } = await supabase.from('surveys').select('city, state');
            const counts = {};
            (surveys || []).forEach(s => {
                const city = s.city || 'Unknown';
                counts[city] = (counts[city] || 0) + 1;
            });
            data = Object.entries(counts).map(([city, count]) => ({ city, count }));
        }

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
