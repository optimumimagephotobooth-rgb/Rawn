-- Migration: Add Editor and Media Team roles
-- This updates the users table to support Editor and Media Team roles

-- Update the role check constraint to include Editor and Media Team
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('Admin', 'Editor', 'Media Team', 'Teacher', 'Student'));

-- Update invitations table role check constraint
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_role_check 
  CHECK (role IN ('Admin', 'Editor', 'Media Team', 'Teacher', 'Student'));

-- Add helper function to check if user is Editor or Media Team
CREATE OR REPLACE FUNCTION is_editor_or_media()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_role IN ('Admin', 'Editor', 'Media Team');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add helper function to check if user is Media Team
CREATE OR REPLACE FUNCTION is_media_team()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN user_role IN ('Admin', 'Media Team');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
