-- Migration: 004_add_professional_categories
-- Description: Add professional_categories to users and target_category to studies for survey filtering
-- Created: 2026-02-03
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Add professional_categories column to users table
-- This stores the categories selected during onboarding (e.g., ["technology", "healthcare"])
ALTER TABLE users
ADD COLUMN professional_categories JSONB DEFAULT '[]';

-- Create index for faster category-based queries
CREATE INDEX idx_users_professional_categories ON users USING GIN (professional_categories);

-- Add target_category column to studies table
-- This stores which professional category the survey targets
-- Valid values: 'technology', 'healthcare', 'financial', 'education', 'b2b', 'vehicle', 'all'
ALTER TABLE studies
ADD COLUMN target_category VARCHAR(50) DEFAULT 'all';

-- Create index for faster filtering
CREATE INDEX idx_studies_target_category ON studies(target_category);

-- Comment explaining the category mapping:
-- Category IDs (used in both users.professional_categories and studies.target_category):
--   'technology' - Technology Professionals (Developers, Engineers, IT Decision Makers)
--   'healthcare' - Healthcare Professionals (Physicians, Specialists, Allied Health)
--   'financial'  - Financial Professionals (Advisors, Wealth Managers, CFOs)
--   'education'  - Education Professionals (Teachers, Administrators, EdTech Users)
--   'b2b'        - B2B Decision Makers (C-Suite, VPs, Directors, Managers)
--   'vehicle'    - Vehicle Owners (Current Owners, Intenders, Lessees) - Can see ALL surveys
--   'all'        - Survey visible to all categories (default for studies)

-- Update existing studies to set target_category based on audience field
-- This maps the existing audience text to the new category system
UPDATE studies SET target_category =
  CASE
    WHEN LOWER(audience) LIKE '%technology%' OR LOWER(audience) LIKE '%developer%' OR LOWER(audience) LIKE '%tech%' THEN 'technology'
    WHEN LOWER(audience) LIKE '%healthcare%' OR LOWER(audience) LIKE '%health%' OR LOWER(audience) LIKE '%medical%' THEN 'healthcare'
    WHEN LOWER(audience) LIKE '%financial%' OR LOWER(audience) LIKE '%finance%' THEN 'financial'
    WHEN LOWER(audience) LIKE '%education%' OR LOWER(audience) LIKE '%teacher%' THEN 'education'
    WHEN LOWER(audience) LIKE '%b2b%' OR LOWER(audience) LIKE '%decision maker%' THEN 'b2b'
    WHEN LOWER(audience) LIKE '%vehicle%' OR LOWER(audience) LIKE '%automotive%' OR LOWER(audience) LIKE '%car%' THEN 'vehicle'
    ELSE 'all'
  END;
