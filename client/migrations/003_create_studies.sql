-- Migration: 003_create_studies
-- Description: Create studies table for storing survey/study data launched by insight companies
-- Created: 2026-01-30
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create the studies table
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Study metadata
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),

  -- Targeting
  audience VARCHAR(255) NOT NULL,
  targeting_criteria JSONB DEFAULT '{}',

  -- Study configuration
  target_completes INTEGER NOT NULL DEFAULT 500,
  survey_length INTEGER NOT NULL DEFAULT 15,  -- in minutes
  survey_method VARCHAR(50) NOT NULL CHECK (survey_method IN ('create', 'external')),
  external_url VARCHAR(500),

  -- Pricing
  cpi DECIMAL(10, 2) NOT NULL DEFAULT 7.50,  -- cost per interview
  total_cost DECIMAL(10, 2),
  payout DECIMAL(10, 2),  -- amount paid to panelist

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  is_urgent BOOLEAN DEFAULT false,

  -- Progress tracking
  current_completes INTEGER DEFAULT 0,

  -- Owner (insight company user)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  launched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_studies_created_by ON studies(created_by);
CREATE INDEX idx_studies_audience ON studies(audience);
CREATE INDEX idx_studies_created_at ON studies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on studies" ON studies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at on row update
CREATE TRIGGER update_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create study_tags table for survey tags/criteria display
CREATE TABLE study_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_tags_study_id ON study_tags(study_id);

-- Enable RLS on study_tags
ALTER TABLE study_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on study_tags" ON study_tags
  FOR ALL
  USING (true)
  WITH CHECK (true);
