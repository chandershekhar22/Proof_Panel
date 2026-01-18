-- Migration: 001_create_verified_panelists
-- Description: Create verified_panelists table for storing verification data
-- Created: 2026-01-18
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create the verified_panelists table
CREATE TABLE verified_panelists (
  id SERIAL PRIMARY KEY,
  hash_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,  -- 'verified' or 'failed'
  job_title VARCHAR(255),
  industry VARCHAR(255),
  company_size VARCHAR(255),
  job_function VARCHAR(255),
  employment_status VARCHAR(255),
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_verified_panelists_status ON verified_panelists(status);
CREATE INDEX idx_verified_panelists_hash_id ON verified_panelists(hash_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE verified_panelists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON verified_panelists
  FOR ALL
  USING (true)
  WITH CHECK (true);
