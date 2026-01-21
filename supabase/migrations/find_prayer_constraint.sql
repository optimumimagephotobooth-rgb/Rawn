-- Query to find the exact constraint name for the prayers.status field
-- Run this first if DROP CONSTRAINT fails

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'prayers'::regclass 
  AND contype = 'c'  -- 'c' = check constraint
  AND pg_get_constraintdef(oid) LIKE '%status%';

-- Alternative: Find all constraints on prayers table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'prayers'::regclass
ORDER BY contype, conname;
