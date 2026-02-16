-- Migration: 005_create_respondent_attributes
-- Description: Replaces the in-memory respondentAttributesStore Map for Vercel serverless compatibility
-- Run this in Supabase SQL Editor

CREATE TABLE respondent_attributes (
  id SERIAL PRIMARY KEY,
  hash_id VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  location VARCHAR(255),
  employment_status VARCHAR(255),
  job_title VARCHAR(255),
  job_function VARCHAR(255),
  company_size VARCHAR(255),
  industry VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_respondent_attributes_hash_id ON respondent_attributes(hash_id);

ALTER TABLE respondent_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on respondent_attributes" ON respondent_attributes
  FOR ALL
  USING (true)
  WITH CHECK (true);
