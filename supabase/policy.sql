-- MinistryOS Row Level Security Policies
-- This file can be run to reset and recreate all RLS policies

-- ============================================================================
-- STEP 1: Drop all existing policies
-- ============================================================================

-- Churches policies
DROP POLICY IF EXISTS "Users can view own church" ON churches;
DROP POLICY IF EXISTS "Users can create churches" ON churches;
DROP POLICY IF EXISTS "Admins can update own church" ON churches;
DROP POLICY IF EXISTS "Users can view churches by owner email" ON churches;

-- Users policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view church members" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Admins can update church users" ON users;

-- Prayers policies
DROP POLICY IF EXISTS "Public can view approved prayers" ON prayers;
DROP POLICY IF EXISTS "Users can view church prayers" ON prayers;
DROP POLICY IF EXISTS "Anyone can insert prayers" ON prayers;
DROP POLICY IF EXISTS "Admins can update church prayers" ON prayers;

-- Sermons policies
DROP POLICY IF EXISTS "Public can view sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can manage church sermons" ON sermons;

-- Gamification policies
DROP POLICY IF EXISTS "Users can view own gamification" ON gamification;
DROP POLICY IF EXISTS "Admins can view church gamification" ON gamification;
DROP POLICY IF EXISTS "Users can insert own gamification" ON gamification;
DROP POLICY IF EXISTS "Users can update own gamification" ON gamification;
DROP POLICY IF EXISTS "Admins can manage church gamification" ON gamification;
DROP POLICY IF EXISTS "Admins can update church gamification" ON gamification;

-- BTC Wallets policies
DROP POLICY IF EXISTS "Users can view own wallet" ON btc_wallets;
DROP POLICY IF EXISTS "Admins can view church wallets" ON btc_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON btc_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON btc_wallets;
DROP POLICY IF EXISTS "Admins can manage church wallets" ON btc_wallets;
DROP POLICY IF EXISTS "Admins can update church wallets" ON btc_wallets;

-- Audit Logs policies
DROP POLICY IF EXISTS "Admins can view church audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON audit_logs;

-- Invitations policies
DROP POLICY IF EXISTS "Admins can view church invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view own invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can update church invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update own invitations" ON invitations;

-- Events policies
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Admins can manage church events" ON events;
DROP POLICY IF EXISTS "Users can view church events" ON events;

-- Event Registrations policies
DROP POLICY IF EXISTS "Public can register for events" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view church registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage church registrations" ON event_registrations;

-- Blog Posts policies
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage church blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view church blog posts" ON blog_posts;

-- Donations policies
DROP POLICY IF EXISTS "Public can create donations" ON donations;
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Admins can view church donations" ON donations;
DROP POLICY IF EXISTS "Admins can update church donations" ON donations;

-- Volunteers policies
DROP POLICY IF EXISTS "Public can create volunteer signups" ON volunteers;
DROP POLICY IF EXISTS "Users can view own volunteer record" ON volunteers;
DROP POLICY IF EXISTS "Admins can view church volunteers" ON volunteers;
DROP POLICY IF EXISTS "Admins can manage church volunteers" ON volunteers;

-- Email Subscriptions policies
DROP POLICY IF EXISTS "Public can subscribe" ON email_subscriptions;
DROP POLICY IF EXISTS "Public can unsubscribe with token" ON email_subscriptions;
DROP POLICY IF EXISTS "Admins can view church subscriptions" ON email_subscriptions;

-- Social Media Posts policies
DROP POLICY IF EXISTS "Public can view social media posts" ON social_media_posts;
DROP POLICY IF EXISTS "Admins can manage church social posts" ON social_media_posts;

-- Leadership Profiles policies
DROP POLICY IF EXISTS "Public can view active leadership profiles" ON leadership_profiles;
DROP POLICY IF EXISTS "Admins can manage church leadership profiles" ON leadership_profiles;

-- Ministry Content policies
DROP POLICY IF EXISTS "Public can view ministry content" ON ministry_content;
DROP POLICY IF EXISTS "Admins can manage church ministry content" ON ministry_content;

-- ============================================================================
-- STEP 2: Drop and recreate helper functions
-- ============================================================================

DROP FUNCTION IF EXISTS get_user_church_id();
DROP FUNCTION IF EXISTS is_admin_in_church(TEXT);
DROP FUNCTION IF EXISTS get_user_email();
DROP FUNCTION IF EXISTS get_user_role();

-- Helper function to get current user's church_id (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_church_id()
RETURNS TEXT AS $$
DECLARE
  user_church_id TEXT;
BEGIN
  SELECT church_id INTO user_church_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_church_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get current user's email (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if current user is admin in a church (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin_in_church(check_church_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_church_id TEXT;
BEGIN
  SELECT role, church_id INTO user_role, user_church_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_role = 'Admin' AND user_church_id = check_church_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get current user's role (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 3: Enable RLS on all tables
-- ============================================================================

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE btc_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create all policies
-- ============================================================================

-- ============================================================================
-- CHURCHES POLICIES
-- ============================================================================

-- Churches: Users can view churches they own (by email) or churches they belong to (by church_id)
CREATE POLICY "Users can view own church" ON churches
  FOR SELECT USING (
    -- User owns the church (by email match)
    owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- User belongs to the church
    church_id = get_user_church_id()
  );

-- Churches: Authenticated users can create churches (onboarding)
-- This allows any authenticated user to create a church during onboarding
CREATE POLICY "Users can create churches" ON churches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Churches: Admins can update their own church
CREATE POLICY "Admins can update own church" ON churches
  FOR UPDATE USING (is_admin_in_church(church_id));

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users: Users can view their own data (simple policy, no function dependencies)
-- This ensures users can always view their own record, even during onboarding
-- when they might not have a church_id yet
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users: Users can view other users in their church
-- Separate policy to avoid any potential issues with function evaluation
CREATE POLICY "Users can view church members" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND church_id IS NOT NULL
    AND church_id = get_user_church_id()
  );

-- Users: Authenticated users can insert their own user record (onboarding/signup)
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users: Users can update their own record
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users: Admins can update users in their church
CREATE POLICY "Admins can update church users" ON users
  FOR UPDATE USING (is_admin_in_church(church_id))
  WITH CHECK (is_admin_in_church(church_id));

-- ============================================================================
-- PRAYERS POLICIES
-- ============================================================================

-- Prayers: Public can view approved prayers
CREATE POLICY "Public can view approved prayers" ON prayers
  FOR SELECT USING (status = 'Approved');

CREATE POLICY "Users can view church prayers" ON prayers
  FOR SELECT USING (
    church_id = get_user_church_id()
    OR church_id = 'PUBLIC'
    OR church_id IS NULL
  );

-- Prayers: Anyone can submit prayers
CREATE POLICY "Anyone can insert prayers" ON prayers
  FOR INSERT WITH CHECK (true);

-- Prayers: Admins can update prayers in their church or PUBLIC
CREATE POLICY "Admins can update church prayers" ON prayers
  FOR UPDATE USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- SERMONS POLICIES
-- ============================================================================

-- Sermons: Public can view all sermons
CREATE POLICY "Public can view sermons" ON sermons
  FOR SELECT USING (true);

-- Sermons: Admins can manage sermons in their church
CREATE POLICY "Admins can manage church sermons" ON sermons
  FOR ALL USING (is_admin_in_church(church_id));

-- ============================================================================
-- GAMIFICATION POLICIES
-- ============================================================================

-- Gamification: Users can view their own gamification data
CREATE POLICY "Users can view own gamification" ON gamification
  FOR SELECT USING (user_id = auth.uid());

-- Gamification: Admins can view church gamification
CREATE POLICY "Admins can view church gamification" ON gamification
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- Gamification: Users can insert their own gamification records
CREATE POLICY "Users can insert own gamification" ON gamification
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Gamification: Users can update their own gamification records
CREATE POLICY "Users can update own gamification" ON gamification
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Gamification: Admins can insert gamification for users in their church or PUBLIC
CREATE POLICY "Admins can manage church gamification" ON gamification
  FOR INSERT WITH CHECK (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- Gamification: Admins can update gamification for users in their church or PUBLIC
CREATE POLICY "Admins can update church gamification" ON gamification
  FOR UPDATE USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- BTC WALLETS POLICIES
-- ============================================================================

-- BTC Wallets: Users can view their own wallet
CREATE POLICY "Users can view own wallet" ON btc_wallets
  FOR SELECT USING (user_id = auth.uid());

-- BTC Wallets: Admins can view church wallets
CREATE POLICY "Admins can view church wallets" ON btc_wallets
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- BTC Wallets: Users can insert their own wallet records
CREATE POLICY "Users can insert own wallet" ON btc_wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- BTC Wallets: Users can update their own wallet records
CREATE POLICY "Users can update own wallet" ON btc_wallets
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- BTC Wallets: Admins can insert wallets for users in their church or PUBLIC
CREATE POLICY "Admins can manage church wallets" ON btc_wallets
  FOR INSERT WITH CHECK (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- BTC Wallets: Admins can update wallets for users in their church or PUBLIC
CREATE POLICY "Admins can update church wallets" ON btc_wallets
  FOR UPDATE USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Audit Logs: Admins can view audit logs from their church
-- Note: This policy queries users table, but it's on audit_logs table so no recursion
CREATE POLICY "Admins can view church audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'Admin'
      AND (
        audit_logs.user_id IS NULL
        OR audit_logs.user_id IN (
          SELECT id FROM users WHERE church_id = u.church_id
        )
      )
    )
  );

-- Audit Logs: Anyone can insert audit logs (for logging actions)
CREATE POLICY "Anyone can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- INVITATIONS POLICIES
-- ============================================================================

-- Invitations: Admins can view invitations for their church
CREATE POLICY "Admins can view church invitations" ON invitations
  FOR SELECT USING (is_admin_in_church(church_id));

-- Invitations: Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations" ON invitations
  FOR SELECT USING (
    email = get_user_email()
  );

-- Invitations: Admins can create invitations for their church
CREATE POLICY "Admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (is_admin_in_church(church_id));

-- Invitations: Admins can update invitations for their church
CREATE POLICY "Admins can update church invitations" ON invitations
  FOR UPDATE USING (is_admin_in_church(church_id));

-- Invitations: Users can update invitations sent to their email (for accepting)
CREATE POLICY "Users can update own invitations" ON invitations
  FOR UPDATE USING (email = get_user_email());

-- ============================================================================
-- EVENTS POLICIES
-- ============================================================================

-- Events: Public can view published events
CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (status = 'Published');

-- Events: Users can view events in their church (including drafts)
CREATE POLICY "Users can view church events" ON events
  FOR SELECT USING (
    church_id = get_user_church_id()
    OR church_id = 'PUBLIC'
    OR church_id IS NULL
  );

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

-- ============================================================================
-- EVENT REGISTRATIONS POLICIES
-- ============================================================================

-- Event Registrations: Public can register for events
CREATE POLICY "Public can register for events" ON event_registrations
  FOR INSERT WITH CHECK (true);

-- Event Registrations: Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (
    user_id = auth.uid()
    OR email = get_user_email()
  );

-- Event Registrations: Admins can view registrations for their church events
CREATE POLICY "Admins can view church registrations" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.event_id = event_registrations.event_id
      AND (
        is_admin_in_church(e.church_id)
        OR (e.church_id = 'PUBLIC' AND get_user_role() = 'Admin')
        OR (e.church_id IS NULL AND get_user_role() = 'Admin')
      )
    )
  );

-- Event Registrations: Admins can manage registrations for their church events
CREATE POLICY "Admins can manage church registrations" ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.event_id = event_registrations.event_id
      AND (
        is_admin_in_church(e.church_id)
        OR (e.church_id = 'PUBLIC' AND get_user_role() = 'Admin')
        OR (e.church_id IS NULL AND get_user_role() = 'Admin')
      )
    )
  );

-- ============================================================================
-- BLOG POSTS POLICIES
-- ============================================================================

-- Blog Posts: Public can view published blog posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT USING (status = 'Published');

-- Blog Posts: Users can view blog posts in their church (including drafts)
CREATE POLICY "Users can view church blog posts" ON blog_posts
  FOR SELECT USING (
    church_id = get_user_church_id()
    OR church_id = 'PUBLIC'
    OR church_id IS NULL
  );

-- Blog Posts: Admins can manage blog posts in their church
CREATE POLICY "Admins can manage church blog posts" ON blog_posts
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- DONATIONS POLICIES
-- ============================================================================

-- Donations: Public can create donations
CREATE POLICY "Public can create donations" ON donations
  FOR INSERT WITH CHECK (true);

-- Donations: Users can view their own donations
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT USING (
    user_id = auth.uid()
    OR donor_email = get_user_email()
  );

-- Donations: Admins can view donations for their church
CREATE POLICY "Admins can view church donations" ON donations
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- Donations: Admins can update donations for their church (for status updates, receipts)
CREATE POLICY "Admins can update church donations" ON donations
  FOR UPDATE USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- VOLUNTEERS POLICIES
-- ============================================================================

-- Volunteers: Public can create volunteer signups
CREATE POLICY "Public can create volunteer signups" ON volunteers
  FOR INSERT WITH CHECK (true);

-- Volunteers: Users can view their own volunteer record
CREATE POLICY "Users can view own volunteer record" ON volunteers
  FOR SELECT USING (
    user_id = auth.uid()
    OR email = get_user_email()
  );

-- Volunteers: Admins can view volunteers in their church
CREATE POLICY "Admins can view church volunteers" ON volunteers
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- Volunteers: Admins can manage volunteers in their church
CREATE POLICY "Admins can manage church volunteers" ON volunteers
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- EMAIL SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Email Subscriptions: Public can subscribe
CREATE POLICY "Public can subscribe" ON email_subscriptions
  FOR INSERT WITH CHECK (true);

-- Email Subscriptions: Public can unsubscribe with token
CREATE POLICY "Public can unsubscribe with token" ON email_subscriptions
  FOR UPDATE USING (
    unsubscribe_token IS NOT NULL
    AND status = 'Subscribed'
  )
  WITH CHECK (status = 'Unsubscribed');

-- Email Subscriptions: Admins can view subscriptions for their church
CREATE POLICY "Admins can view church subscriptions" ON email_subscriptions
  FOR SELECT USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- SOCIAL MEDIA POSTS POLICIES
-- ============================================================================

-- Social Media Posts: Public can view social media posts
CREATE POLICY "Public can view social media posts" ON social_media_posts
  FOR SELECT USING (true);

-- Social Media Posts: Admins can manage social posts for their church
CREATE POLICY "Admins can manage church social posts" ON social_media_posts
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- LEADERSHIP PROFILES POLICIES
-- ============================================================================

-- Leadership Profiles: Public can view active leadership profiles
CREATE POLICY "Public can view active leadership profiles" ON leadership_profiles
  FOR SELECT USING (is_active = true);

-- Leadership Profiles: Admins can manage leadership profiles in their church
CREATE POLICY "Admins can manage church leadership profiles" ON leadership_profiles
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- MINISTRY CONTENT POLICIES
-- ============================================================================

-- Ministry Content: Public can view ministry content
CREATE POLICY "Public can view ministry content" ON ministry_content
  FOR SELECT USING (true);

-- Ministry Content: Admins can manage ministry content in their church
CREATE POLICY "Admins can manage church ministry content" ON ministry_content
  FOR ALL USING (
    is_admin_in_church(church_id)
    OR (church_id = 'PUBLIC' AND get_user_role() = 'Admin')
    OR (church_id IS NULL AND get_user_role() = 'Admin')
  );

-- ============================================================================
-- MEMBERSHIPS POLICIES
-- ============================================================================

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

