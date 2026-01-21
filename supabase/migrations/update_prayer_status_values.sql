-- Update prayer status values to match requirements: received / prayed / followed up
-- Also keep 'Pending' for initial state

-- First, drop the existing check constraint
ALTER TABLE prayers DROP CONSTRAINT IF EXISTS prayers_status_check;

-- Update existing statuses to new values
-- 'Pending' -> 'received' (new requests)
-- 'Approved' -> 'prayed' (prayed for)
-- 'Answered' -> 'followed up' (followed up)
-- 'Rejected' -> can be removed or set to 'received' for review
UPDATE prayers 
SET status = CASE 
  WHEN status = 'Pending' THEN 'received'
  WHEN status = 'Approved' THEN 'prayed'
  WHEN status = 'Answered' THEN 'followed up'
  WHEN status = 'Rejected' THEN 'received'
  ELSE 'received'
END;

-- Add new check constraint with updated status values
ALTER TABLE prayers 
ADD CONSTRAINT prayers_status_check 
CHECK (status IN ('received', 'prayed', 'followed up'));

-- Update default status
ALTER TABLE prayers ALTER COLUMN status SET DEFAULT 'received';
