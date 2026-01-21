-- Update only the status field constraint in the existing prayers table
-- This query safely updates the constraint without affecting other columns

-- Step 1: Drop the existing check constraint (if it exists)
-- Note: The constraint name might vary. Common names:
--   - prayers_status_check (most common)
--   - prayers_status_fkey (if it was a foreign key)
--   - Check constraint might be auto-named by PostgreSQL
ALTER TABLE prayers DROP CONSTRAINT IF EXISTS prayers_status_check;

-- If the above doesn't work, find the constraint name first:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'prayers'::regclass AND contype = 'c';

-- Step 2: Update existing data to match new status values
-- This migrates old status values to new ones
UPDATE prayers 
SET status = CASE 
  WHEN status = 'Pending' THEN 'received'
  WHEN status = 'Approved' THEN 'prayed'
  WHEN status = 'Answered' THEN 'followed up'
  WHEN status = 'Rejected' THEN 'received'
  -- If status is already one of the new values, keep it
  WHEN status IN ('received', 'prayed', 'followed up') THEN status
  -- For any other unexpected values, default to 'received'
  ELSE 'received'
END
WHERE status IS NOT NULL;

-- Step 3: Add the new check constraint
ALTER TABLE prayers 
ADD CONSTRAINT prayers_status_check 
CHECK (status IN ('received', 'prayed', 'followed up'));

-- Step 4: Update the default value (optional, if you want new rows to default to 'received')
ALTER TABLE prayers 
ALTER COLUMN status SET DEFAULT 'received';

-- Verify the constraint was added
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'prayers'::regclass AND conname = 'prayers_status_check';
