# B2B Procurement Survey Platform

A comprehensive survey platform for collecting B2B procurement requirements across 20+ industries in India.

## 🚀 Features

- **Multi-Industry Support**: 20+ industry categories with custom survey questions
- **Admin Dashboard**: Real-time analytics, charts, and data export
- **Survey Management**: View, verify, and reject survey submissions
- **User Management**: Add, edit, and manage admin/collector users
- **Industry Questions**: Customizable questions per industry
- **Location Data**: GPS capture with all 28 states + 8 UTs of India
- **Mobile Ready**: Responsive design for all devices

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Frontend | Next.js 14, React 18 |
| Styling | CSS Variables, Modern Design |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

## 📦 Project Structure

```
b2b-survey-platform/
├── backend/                 # Express.js API server
│   ├── server-supabase.js   # Main server (Supabase)
│   ├── seed-supabase.js     # Database seeder
│   ├── .env.example         # Environment template
│   └── package.json
├── web/                     # Next.js frontend
│   ├── src/app/             # App router pages
│   │   ├── admin/           # Admin panel
│   │   └── survey/          # Public survey form
│   ├── .env.example         # Environment template
│   └── package.json
├── mobile/                  # React Native app (optional)
├── supabase-schema.sql      # Database schema
└── README.md
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/Niranjanan-and-Co-Group-of-Companies/B2B-Survey.git
cd B2B-Survey
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Copy your credentials from Project Settings → API

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
PORT=5001
JWT_SECRET=your-jwt-secret-from-supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Install dependencies and seed database:
```bash
npm install
npm run seed:supabase
```

Start the server:
```bash
npm run dev:supabase
```

### 4. Configure Frontend

```bash
cd ../web
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Install and run:
```bash
npm install
npm run dev
```

### 5. Access the Application

- **Public Survey**: http://localhost:3000/survey
- **Admin Panel**: http://localhost:3000/admin/login

Default credentials:
- Email: `admin@b2bsurvey.com`
- Password: `admin123`

## 📊 Admin Dashboard Features

| Feature | Description |
|---------|-------------|
| Overview Stats | Total surveys, verified, pending |
| Industry Chart | Pie chart of surveys by industry |
| Timeline Chart | 30-day submission trend |
| Recent Surveys | Quick view of latest submissions |
| Export CSV | Download all survey data |

## 🏭 Industries Supported

| Category | Industries |
|----------|------------|
| Hospitality | Hotels, Restaurants, Cafes |
| Healthcare | Hospitals, Clinics |
| Education | Schools, Colleges, Universities |
| Events | Wedding Planners, Event Managers |
| Wellness | Gyms, Salons, Spas |
| Corporate | Offices, Co-working Spaces |
| Retail | Stores, Supermarkets |
| Automotive | Workshops, Service Centers |
| Manufacturing | Factories, Warehouses |
| Religious | Temples, Churches, Mosques |
| Entertainment | Theatres, Cinemas |
| Fuel | Petrol Pumps |

## 🔒 Security

- JWT authentication with Supabase secret
- Password hashing with bcryptjs
- Row Level Security (RLS) in Supabase
- Environment variables for sensitive data

## 📝 API Endpoints

### Public
- `POST /api/surveys` - Submit survey
- `GET /api/industries` - List industries

### Protected (Require Auth)
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/:id` - Get survey details
- `PUT /api/surveys/:id/status` - Verify/reject
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/analytics/*` - Dashboard data

## 🚀 Deployment

### Backend (Railway/Render)
1. Connect GitHub repo
2. Set environment variables
3. Build command: `npm install`
4. Start command: `node server-supabase.js`

### Frontend (Vercel)
1. Import from GitHub
2. Set environment variables
3. Framework: Next.js
4. Build command: `npm run build`

## 📄 License

MIT License - feel free to use for your projects.

## 👥 Contributors

- Niranjanan and Co Group of Companies
