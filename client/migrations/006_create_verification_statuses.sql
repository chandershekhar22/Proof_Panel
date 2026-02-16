-- Migration: 006_create_verification_statuses
-- Description: Replaces the in-memory verifiedPanelistsStore Map for Vercel serverless compatibility
-- Separate from verified_panelists table (which stores permanent aggregation data)
-- Run this in Supabase SQL Editor

CREATE TABLE verification_statuses (
  id SERIAL PRIMARY KEY,
  hash_id VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  proof_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  linkedin_name VARCHAR(255),
  linkedin_email VARCHAR(255),
  auto_verified BOOLEAN DEFAULT false,
  fail_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_statuses_hash_id ON verification_statuses(hash_id);
CREATE INDEX idx_verification_statuses_proof_status ON verification_statuses(proof_status);

ALTER TABLE verification_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on verification_statuses" ON verification_statuses
  FOR ALL
  USING (true)
  WITH CHECK (true);
