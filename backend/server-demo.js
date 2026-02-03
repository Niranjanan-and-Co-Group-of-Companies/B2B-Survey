import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'demo-secret-key';

// In-memory storage for demo
const surveys = [];
const industries = [
    { id: '1', industry_key: 'hotel_with_rooms', display_name: 'Hotel (With Rooms)', icon: '🏨', description: 'Hotels and resorts' },
    { id: '2', industry_key: 'hotel_without_rooms', display_name: 'Restaurant', icon: '🍽️', description: 'Restaurants and cafes' },
    { id: '3', industry_key: 'hospital', display_name: 'Hospital', icon: '🏥', description: 'Hospitals' },
    { id: '4', industry_key: 'clinic_with_beds', display_name: 'Clinic (With Beds)', icon: '🩺', description: 'Clinics with beds' },
    { id: '5', industry_key: 'clinic_without_beds', display_name: 'Clinic (OPD)', icon: '👨‍⚕️', description: 'OPD clinics' },
    { id: '6', industry_key: 'school', display_name: 'School', icon: '🏫', description: 'Schools' },
    { id: '7', industry_key: 'college', display_name: 'College', icon: '🎓', description: 'Colleges' },
    { id: '8', industry_key: 'coaching_center', display_name: 'Coaching Center', icon: '📚', description: 'Coaching centers' },
    { id: '9', industry_key: 'wedding_planner', display_name: 'Wedding Planner', icon: '💒', description: 'Wedding planners' },
    { id: '10', industry_key: 'event_management', display_name: 'Event Management', icon: '🎪', description: 'Event management' },
    { id: '11', industry_key: 'workshop', display_name: 'Auto Workshop', icon: '🔧', description: 'Vehicle workshops' },
    { id: '12', industry_key: 'salon', display_name: 'Salon', icon: '💇', description: 'Salons and parlours' },
    { id: '13', industry_key: 'gym', display_name: 'Gym', icon: '🏋️', description: 'Gyms and fitness centers' },
    { id: '14', industry_key: 'grocery', display_name: 'Grocery Store', icon: '🛒', description: 'Grocery stores' },
    { id: '15', industry_key: 'bakery', display_name: 'Bakery', icon: '🥖', description: 'Bakeries' },
    { id: '16', industry_key: 'corporate_office', display_name: 'Corporate Office', icon: '🏢', description: 'Offices' },
    { id: '17', industry_key: 'religious_place', display_name: 'Religious Place', icon: '🛕', description: 'Religious places' },
];

const users = [
    {
        id: '1',
        email: 'admin@b2bsurvey.com',
        password_hash: '$2a$10$xjcij9A/TJXyhRrDXII52.0sFMoqedXCcvQE3205ZC4CLTsRglxyi', // admin123
        name: 'Admin User',
        role: 'admin'
    }
];

// Auth middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = users.find(u => u.id === decoded.id);
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// HEALTH
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🚀 B2B Survey API is running!',
        mode: 'Demo (In-Memory)',
        surveys: surveys.length,
        industries: industries.length
    });
});

// AUTH
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
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
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        }
    });
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
});

// INDUSTRIES
app.get('/api/industries', (req, res) => {
    res.json({ success: true, data: industries });
});

app.get('/api/industries/:key', (req, res) => {
    const industry = industries.find(i => i.industry_key === req.params.key);
    if (!industry) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: industry });
});

// SURVEYS
app.post('/api/surveys', (req, res) => {
    const { business, currentProcurement, industryData, meta } = req.body;

    const survey = {
        id: `SRV-${Date.now()}`,
        survey_id: `SRV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        business_name: business?.name,
        industry: business?.industry,
        sub_category: business?.subCategory,
        owner_name: business?.ownerName,
        contact_phone: business?.contactPhone,
        city: business?.address?.city,
        state: business?.address?.state,
        monthly_budget_min: currentProcurement?.monthlyBudget?.min,
        monthly_budget_max: currentProcurement?.monthlyBudget?.max,
        willing_to_switch: currentProcurement?.willingToSwitch,
        industry_data: industryData,
        source: meta?.source || 'website',
        status: 'submitted',
        created_at: new Date().toISOString()
    };

    surveys.push(survey);

    res.status(201).json({
        success: true,
        data: { surveyId: survey.survey_id, id: survey.id }
    });
});

app.get('/api/surveys', authenticate, (req, res) => {
    res.json({
        success: true,
        data: surveys.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        pagination: { total: surveys.length, page: 1, pages: 1 }
    });
});

// ANALYTICS
app.get('/api/analytics/overview', authenticate, (req, res) => {
    const now = new Date();
    const today = surveys.filter(s => new Date(s.created_at).toDateString() === now.toDateString()).length;
    const thisWeek = surveys.filter(s => (now - new Date(s.created_at)) < 7 * 24 * 60 * 60 * 1000).length;

    res.json({
        success: true,
        data: {
            totals: { all: surveys.length, today, thisWeek, thisMonth: surveys.length },
            byStatus: {
                submitted: surveys.filter(s => s.status === 'submitted').length,
                verified: surveys.filter(s => s.status === 'verified').length
            },
            bySource: {
                website: surveys.filter(s => s.source === 'website').length,
                mobile_app: surveys.filter(s => s.source === 'mobile_app').length
            }
        }
    });
});

app.get('/api/analytics/by-industry', authenticate, (req, res) => {
    const counts = {};
    surveys.forEach(s => {
        counts[s.industry] = (counts[s.industry] || 0) + 1;
    });

    const data = industries.map(i => ({
        industry: i.display_name,
        icon: i.icon,
        count: counts[i.industry_key] || 0
    }));

    res.json({ success: true, data });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 B2B Survey API - Demo Mode                            ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║   📍 Server:  http://localhost:${PORT}                       ║
║   📍 Health:  http://localhost:${PORT}/api/health             ║
║   📍 Industries: http://localhost:${PORT}/api/industries      ║
║                                                            ║
║   🔐 Admin Login:                                          ║
║      Email: admin@b2bsurvey.com                            ║
║      Pass:  admin123                                       ║
║                                                            ║
║   ⚠️  Data stored in memory (resets on restart)            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
