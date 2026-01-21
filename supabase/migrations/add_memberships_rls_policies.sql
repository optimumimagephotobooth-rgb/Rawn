-- Add RLS policies for memberships table

-- Memberships: Authenticated users can create membership applications
CREATE POLICY "Users can create membership applications" ON memberships
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Memberships: Users can view their own membership record
CREATE POLICY "Users can view own membership record" ON memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR email = get_user_email()
  );

-- Memberships: Admins can view memberships in their church
CREATE POLICY "Admins can view church memberships" ON memberships
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- Memberships: Admins can manage memberships in their church
CREATE POLICY "Admins can manage church memberships" ON memberships
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );
