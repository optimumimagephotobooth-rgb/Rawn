-- MinistryOS Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Churches (Multi-tenant root)
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  plan TEXT DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_churches_church_id ON churches(church_id);
CREATE INDEX idx_churches_owner_email ON churches(owner_email);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
  church_id TEXT REFERENCES churches(church_id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_church_id ON users(church_id);
CREATE INDEX idx_users_role ON users(role);

-- Prayers
CREATE TABLE prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  name TEXT,
  email TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'prayed', 'followed up')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_prayers_church_id ON prayers(church_id);
CREATE INDEX idx_prayers_status ON prayers(status);
CREATE INDEX idx_prayers_prayer_id ON prayers(prayer_id);
CREATE INDEX idx_prayers_created_at ON prayers(created_at DESC);

-- Sermons
CREATE TABLE sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  speaker TEXT,
  category TEXT CHECK (category IN ('Prophetic', 'Prayer', 'Discipleship', 'Healing', 'Leadership')),
  description TEXT,
  video_url TEXT,
  audio_url TEXT,
  notes_url TEXT,
  scripture_references TEXT[],
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sermons_church_id ON sermons(church_id);
CREATE INDEX idx_sermons_category ON sermons(category);
CREATE INDEX idx_sermons_date ON sermons(date DESC);
CREATE INDEX idx_sermons_sermon_id ON sermons(sermon_id);
-- Full-text search index for sermons
CREATE INDEX idx_sermons_search ON sermons USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(speaker, '')));

-- Gamification (XP)
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, church_id)
);

CREATE INDEX idx_gamification_church_id ON gamification(church_id);
CREATE INDEX idx_gamification_xp ON gamification(xp DESC);
CREATE INDEX idx_gamification_user_church ON gamification(user_id, church_id);

-- BTC Wallet (Simulation)
CREATE TABLE btc_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  btc DECIMAL(18, 8) DEFAULT 0,
  last_reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, church_id)
);

CREATE INDEX idx_btc_wallets_church_id ON btc_wallets(church_id);
CREATE INDEX idx_btc_wallets_btc ON btc_wallets(btc DESC);
CREATE INDEX idx_btc_wallets_user_church ON btc_wallets(user_id, church_id);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- Row Level Security Policies

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

-- Enable RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE btc_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON prayers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,
  end_time TIME,
  location TEXT,
  zoom_url TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  registration_required BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  capacity INTEGER,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Cancelled', 'Completed')),
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_church_id ON events(church_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_event_id ON events(event_id);

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(event_id) ON DELETE CASCADE,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Registered' CHECK (status IN ('Registered', 'Cancelled', 'Attended', 'No-Show')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_church_id ON event_registrations(church_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_email ON event_registrations(email);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  category TEXT CHECK (category IN ('Prophetic', 'Devotional', 'Teaching', 'Announcement')),
  tags TEXT[],
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_church_id ON blog_posts(church_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_post_id ON blog_posts(post_id);

-- Full-text search index for blog posts
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Stripe', 'PayPal', 'Other')),
  payment_id TEXT,
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  donor_name TEXT,
  donor_email TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled')),
  receipt_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_church_id ON donations(church_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_donation_id ON donations(donation_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_payment_id ON donations(payment_id);

-- Volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL CHECK (department IN ('Prayer', 'Media', 'Events', 'Teaching', 'Administration', 'Outreach')),
  skills TEXT[],
  availability TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Inactive', 'Rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_volunteers_church_id ON volunteers(church_id);
CREATE INDEX idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX idx_volunteers_volunteer_id ON volunteers(volunteer_id);
CREATE INDEX idx_volunteers_department ON volunteers(department);
CREATE INDEX idx_volunteers_status ON volunteers(status);

-- Email Subscriptions
CREATE TABLE email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE SET NULL,
  source TEXT,
  status TEXT DEFAULT 'Subscribed' CHECK (status IN ('Subscribed', 'Unsubscribed', 'Bounced')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_church_id ON email_subscriptions(church_id);
CREATE INDEX idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);

-- Social Media Posts (cached)
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'Facebook', 'Twitter', 'YouTube')),
  post_id TEXT NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  posted_at TIMESTAMPTZ,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, post_id, church_id)
);

CREATE INDEX idx_social_media_posts_church_id ON social_media_posts(church_id);
CREATE INDEX idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_media_posts_posted_at ON social_media_posts(posted_at DESC);

-- Enable RLS for new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- Leadership Profiles (for About page)
CREATE TABLE leadership_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  email TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leadership_profiles_church_id ON leadership_profiles(church_id);
CREATE INDEX idx_leadership_profiles_display_order ON leadership_profiles(display_order);
CREATE INDEX idx_leadership_profiles_is_active ON leadership_profiles(is_active);

-- Ministry Content (for About page - intro video, photos, etc.)
CREATE TABLE ministry_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  intro_video_url TEXT,
  ministry_photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id)
);

CREATE INDEX idx_ministry_content_church_id ON ministry_content(church_id);

-- Enable RLS for new tables
ALTER TABLE leadership_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_content ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at on new tables
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leadership_profiles_updated_at BEFORE UPDATE ON leadership_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministry_content_updated_at BEFORE UPDATE ON ministry_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

