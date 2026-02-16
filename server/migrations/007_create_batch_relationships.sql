-- Migration: 007_create_batch_relationships
-- Description: Replaces the in-memory batchRelationshipsStore Map for Vercel serverless compatibility
-- Maps test account hashIds to their batch mate hashIds
-- Run this in Supabase SQL Editor

CREATE TABLE batch_relationships (
  id SERIAL PRIMARY KEY,
  test_hash_id VARCHAR(255) NOT NULL,
  mate_hash_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_hash_id, mate_hash_id)
);

CREATE INDEX idx_batch_relationships_test_hash_id ON batch_relationships(test_hash_id);
CREATE INDEX idx_batch_relationships_mate_hash_id ON batch_relationships(mate_hash_id);

ALTER TABLE batch_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on batch_relationships" ON batch_relationships
  FOR ALL
  USING (true)
  WITH CHECK (true);
