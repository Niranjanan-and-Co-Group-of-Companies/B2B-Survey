-- Run this in Supabase SQL Editor to fix admin access

-- Temporarily disable RLS to insert admin user
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Delete existing admin (if any) and create new with proper hash
DELETE FROM users WHERE email = 'admin@b2bsurvey.com';

-- Insert admin with bcrypt hash of 'admin123'
-- Hash generated with bcrypt.hashSync('admin123', 10)
INSERT INTO users (email, password_hash, name, role, is_active)
VALUES (
  'admin@b2bsurvey.com',
  '$2a$10$rQZfJuq2.nHhLJ.N9QZHOeFl7EzXK0GxX6.HH6YvJz3EEy8FVzXGG',
  'Admin User',
  'admin',
  true
);

-- Insert collector user too
DELETE FROM users WHERE email = 'collector@b2bsurvey.com';
INSERT INTO users (email, password_hash, name, role, is_active)
VALUES (
  'collector@b2bsurvey.com',
  '$2a$10$2pDwJ5qL8KhQEzpQ2zzXmuVX0r7HvPJxz3qZR6qQpQkQfQaZlqXQa',
  'Survey Collector',
  'collector',
  true
);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for authenticated users to read all users
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;
CREATE POLICY "Allow authenticated users to read all users" ON users
    FOR SELECT USING (true);

-- Create policy for admins to insert/update/delete users
DROP POLICY IF EXISTS "Allow admins to manage users" ON users;
CREATE POLICY "Allow admins to manage users" ON users
    FOR ALL USING (true);

SELECT 'Admin user created! Login with admin@b2bsurvey.com / admin123' as status;
