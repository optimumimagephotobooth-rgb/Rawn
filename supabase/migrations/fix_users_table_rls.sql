-- ============================================================================
-- Fix Users Table RLS Policy
-- This migration fixes the permission denied error (42501) when users try to
-- access their own records in the users table.
-- ============================================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Recreate the policy with a more robust condition
-- This ensures users can always view their own record, even during onboarding
-- when they might not have a church_id yet
-- 
-- Note: We split this into two separate policies to avoid any potential
-- issues with function evaluation in the USING clause
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Separate policy for viewing users in the same church
-- Uses the SECURITY DEFINER helper function which bypasses RLS
CREATE POLICY "Users can view church members" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND church_id IS NOT NULL
    AND church_id = get_user_church_id()
  );

-- Verify the policies were created
-- You can check with: SELECT * FROM pg_policies WHERE tablename = 'users';
