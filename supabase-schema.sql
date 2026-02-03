-- B2B Procurement Survey Platform - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For GPS/location support

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'collector' CHECK (role IN ('admin', 'collector', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDUSTRIES TABLE
-- ============================================
CREATE TABLE industries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  industry_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUB-CATEGORIES TABLE
-- ============================================
CREATE TABLE sub_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  category_key VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  UNIQUE(industry_id, category_key)
);

-- ============================================
-- INDUSTRY QUESTIONS TABLE
-- ============================================
CREATE TABLE industry_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('number', 'text', 'select', 'multiselect', 'boolean', 'textarea')),
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  placeholder VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  UNIQUE(industry_id, field_key)
);

-- ============================================
-- SURVEYS TABLE
-- ============================================
CREATE TABLE surveys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  industry_id UUID REFERENCES industries(id),
  sub_category VARCHAR(100),
  owner_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contact_whatsapp VARCHAR(20),
  
  -- Address
  street TEXT,
  landmark VARCHAR(255),
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Location (PostGIS point)
  location GEOGRAPHY(POINT, 4326),
  location_source VARCHAR(50) CHECK (location_source IN ('gps_auto', 'gps_manual', 'address_geocoded', 'not_provided')),
  location_accuracy DECIMAL(10, 2),
  
  -- Business Details
  years_in_operation INTEGER,
  is_owner BOOLEAN,
  employees_count INTEGER,
  
  -- Procurement Details
  current_method VARCHAR(100),
  monthly_budget_min INTEGER,
  monthly_budget_max INTEGER,
  purchasing_frequency VARCHAR(50),
  primary_payment_method VARCHAR(100),
  preferred_credit_period INTEGER,
  pain_points TEXT[],
  willing_to_switch VARCHAR(20) CHECK (willing_to_switch IN ('yes', 'no', 'maybe')),
  
  -- Industry-specific data (flexible JSON)
  industry_data JSONB,
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'mobile_app', 'import')),
  collected_by UUID REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_surveys_industry ON surveys(industry_id);
CREATE INDEX idx_surveys_city ON surveys(city);
CREATE INDEX idx_surveys_state ON surveys(state);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_source ON surveys(source);
CREATE INDEX idx_surveys_created ON surveys(created_at DESC);
CREATE INDEX idx_surveys_location ON surveys USING GIST(location);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Public read access for industries
CREATE POLICY "Industries are viewable by everyone" 
  ON industries FOR SELECT USING (true);

-- Public can insert surveys (anonymous submissions)
CREATE POLICY "Anyone can submit surveys" 
  ON surveys FOR INSERT WITH CHECK (true);

-- Authenticated users can view surveys
CREATE POLICY "Authenticated users can view surveys" 
  ON surveys FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Admins can do anything
CREATE POLICY "Admins have full access to surveys" 
  ON surveys FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-generate survey ID
CREATE OR REPLACE FUNCTION generate_survey_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.survey_id := 'SRV-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_survey_id
  BEFORE INSERT ON surveys
  FOR EACH ROW
  WHEN (NEW.survey_id IS NULL)
  EXECUTE FUNCTION generate_survey_id();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA: INDUSTRIES
-- ============================================
INSERT INTO industries (industry_key, display_name, icon, description) VALUES
  ('hotel_with_rooms', 'Hotel (With Rooms)', '🏨', 'Hotels, resorts, lodges with accommodation'),
  ('hotel_without_rooms', 'Restaurant', '🍽️', 'Restaurants, cafes, eateries'),
  ('hospital', 'Hospital', '🏥', 'Multi-specialty and general hospitals'),
  ('clinic_with_beds', 'Clinic (With Beds)', '🩺', 'Clinics with inpatient facilities'),
  ('clinic_without_beds', 'Clinic (OPD Only)', '👨‍⚕️', 'Outpatient clinics'),
  ('diagnostic_center', 'Diagnostic Center', '🔬', 'Labs and diagnostic facilities'),
  ('school', 'School', '🏫', 'Primary and secondary schools'),
  ('college', 'College/University', '🎓', 'Higher education institutions'),
  ('coaching_center', 'Coaching Center', '📚', 'Tuition and competitive exam coaching'),
  ('playschool', 'Play School', '🧒', 'Pre-schools and daycare'),
  ('wedding_planner', 'Wedding Planner', '💒', 'Wedding planning services'),
  ('event_management', 'Event Management', '🎪', 'Corporate and social events'),
  ('tent_house', 'Tent House', '⛺', 'Tent and furniture rentals'),
  ('workshop', 'Auto Workshop', '🔧', 'Vehicle service and repair'),
  ('salon', 'Salon/Parlour', '💇', 'Hair and beauty services'),
  ('gym', 'Gym/Fitness Center', '🏋️', 'Fitness and wellness'),
  ('grocery', 'Grocery Store', '🛒', 'Retail grocery and kirana'),
  ('bakery', 'Bakery', '🥖', 'Bakery and confectionery'),
  ('corporate_office', 'Corporate Office', '🏢', 'Offices and coworking spaces'),
  ('religious_place', 'Religious Place', '🛕', 'Temples, churches, mosques');

-- Sub-categories for key industries
INSERT INTO sub_categories (industry_id, category_key, display_name) 
SELECT id, 'luxury', 'Luxury (5-Star)' FROM industries WHERE industry_key = 'hotel_with_rooms'
UNION ALL
SELECT id, 'budget', 'Budget' FROM industries WHERE industry_key = 'hotel_with_rooms'
UNION ALL
SELECT id, 'boutique', 'Boutique' FROM industries WHERE industry_key = 'hotel_with_rooms'
UNION ALL
SELECT id, 'resort', 'Resort' FROM industries WHERE industry_key = 'hotel_with_rooms';

INSERT INTO sub_categories (industry_id, category_key, display_name) 
SELECT id, 'fine_dining', 'Fine Dining' FROM industries WHERE industry_key = 'hotel_without_rooms'
UNION ALL
SELECT id, 'casual', 'Casual Dining' FROM industries WHERE industry_key = 'hotel_without_rooms'
UNION ALL
SELECT id, 'fast_food', 'Fast Food' FROM industries WHERE industry_key = 'hotel_without_rooms'
UNION ALL
SELECT id, 'cafe', 'Cafe' FROM industries WHERE industry_key = 'hotel_without_rooms'
UNION ALL
SELECT id, 'cloud_kitchen', 'Cloud Kitchen' FROM industries WHERE industry_key = 'hotel_without_rooms';

INSERT INTO sub_categories (industry_id, category_key, display_name) 
SELECT id, 'men', 'Men Only' FROM industries WHERE industry_key = 'salon'
UNION ALL
SELECT id, 'women', 'Women Only' FROM industries WHERE industry_key = 'salon'
UNION ALL
SELECT id, 'unisex', 'Unisex' FROM industries WHERE industry_key = 'salon';

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- ============================================
-- Note: Password is 'admin123' (hashed with bcrypt)
-- You should change this password immediately!
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@b2bsurvey.com', '$2a$10$rQZxVfhWIJ/qWq8wRvDxkOzGqGq6bDrR8y9yGN3VYqGwWwJ3qKVGi', 'Admin User', 'admin');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================
CREATE OR REPLACE VIEW survey_stats AS
SELECT 
  COUNT(*) as total_surveys,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as this_week,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as this_month,
  COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending,
  COUNT(CASE WHEN source = 'website' THEN 1 END) as from_website,
  COUNT(CASE WHEN source = 'mobile_app' THEN 1 END) as from_mobile
FROM surveys;

CREATE OR REPLACE VIEW surveys_by_industry AS
SELECT 
  i.display_name as industry,
  i.icon,
  COUNT(s.id) as count
FROM industries i
LEFT JOIN surveys s ON s.industry_id = i.id
GROUP BY i.id, i.display_name, i.icon
ORDER BY count DESC;

CREATE OR REPLACE VIEW surveys_by_city AS
SELECT 
  city,
  state,
  COUNT(*) as count
FROM surveys
WHERE city IS NOT NULL
GROUP BY city, state
ORDER BY count DESC
LIMIT 20;
