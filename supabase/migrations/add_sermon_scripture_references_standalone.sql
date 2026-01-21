-- ============================================================================
-- Migration Queries for Sermons Table Updates
-- Run these queries separately on your existing database
-- ============================================================================

-- Query 1: Add scripture_references column
ALTER TABLE sermons 
ADD COLUMN IF NOT EXISTS scripture_references TEXT[];

-- Query 2: Add category CHECK constraint (only if constraint doesn't exist)
-- Note: If you already have a different constraint, you may need to drop it first
-- Check existing constraints first:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'sermons' AND constraint_type = 'CHECK';

-- Drop existing category constraint if it exists (optional - only if needed)
-- ALTER TABLE sermons DROP CONSTRAINT IF EXISTS sermons_category_check;

-- Add the new category constraint
ALTER TABLE sermons 
ADD CONSTRAINT sermons_category_check 
CHECK (category IS NULL OR category IN ('Prophetic', 'Prayer', 'Discipleship', 'Healing', 'Leadership'));

-- Query 3: Add full-text search index
CREATE INDEX IF NOT EXISTS idx_sermons_search 
ON sermons 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(speaker, '')));

-- ============================================================================
-- Verification Queries (optional - to check the changes)
-- ============================================================================

-- Check if scripture_references column exists
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'sermons' 
AND column_name = 'scripture_references';

-- Check category constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'sermons_category_check';

-- Check if search index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sermons' 
AND indexname = 'idx_sermons_search';
