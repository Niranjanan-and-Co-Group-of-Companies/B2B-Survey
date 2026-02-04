-- Add survey_photos table to store photos in database
-- Run this in your Supabase SQL Editor

-- Create survey_photos table
CREATE TABLE IF NOT EXISTS survey_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  survey_id VARCHAR(50) NOT NULL,  -- The human-readable survey ID (e.g., SF-XXXXX)
  filename VARCHAR(255),
  content_type VARCHAR(100) DEFAULT 'image/jpeg',
  photo_data TEXT NOT NULL,  -- Base64 encoded photo data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by survey_id
CREATE INDEX IF NOT EXISTS idx_survey_photos_survey_id ON survey_photos(survey_id);

-- Enable RLS but allow all operations (since we're bypassing auth for this table)
ALTER TABLE survey_photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert photos (for survey submissions)
CREATE POLICY "Anyone can insert photos" 
  ON survey_photos FOR INSERT WITH CHECK (true);

-- Allow anyone to select photos (for viewing in admin)
CREATE POLICY "Anyone can view photos" 
  ON survey_photos FOR SELECT USING (true);
