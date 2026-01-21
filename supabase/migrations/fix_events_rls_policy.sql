-- Fix events RLS policy to include WITH CHECK clause for INSERT operations
-- The policy was missing WITH CHECK which is required for INSERT operations

DROP POLICY IF EXISTS "Admins can manage church events" ON events;

-- Events: Admins can manage events in their church
CREATE POLICY "Admins can manage church events" ON events
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  )
  WITH CHECK (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );
