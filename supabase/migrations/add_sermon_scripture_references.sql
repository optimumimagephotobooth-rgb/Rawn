-- Migration: Add scripture_references field and update constraints for sermons table
-- Run this on existing databases to add the new field

-- Step 1: Add scripture_references column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sermons' AND column_name = 'scripture_references'
  ) THEN
    ALTER TABLE sermons ADD COLUMN scripture_references TEXT[];
  END IF;
END $$;

-- Step 2: Add category CHECK constraint (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sermons_category_check' 
    AND table_name = 'sermons'
  ) THEN
    ALTER TABLE sermons 
    ADD CONSTRAINT sermons_category_check 
    CHECK (category IS NULL OR category IN ('Prophetic', 'Prayer', 'Discipleship', 'Healing', 'Leadership'));
  END IF;
END $$;

-- Step 3: Add full-text search index (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_sermons_search'
  ) THEN
    CREATE INDEX idx_sermons_search ON sermons 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(speaker, '')));
  END IF;
END $$;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  udt_name
FROM information_schema.columns 
WHERE table_name = 'sermons' 
AND column_name = 'scripture_references';
