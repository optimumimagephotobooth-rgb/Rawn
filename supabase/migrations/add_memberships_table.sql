-- Add Memberships table for membership registration
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  date_of_birth DATE,
  baptism_date DATE,
  previous_church TEXT,
  how_did_you_hear TEXT,
  interests TEXT[],
  commitment_level TEXT CHECK (commitment_level IN ('Regular', 'Associate', 'Full')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Inactive', 'Rejected')),
  notes TEXT,
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memberships_church_id ON memberships(church_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_membership_id ON memberships(membership_id);
CREATE INDEX idx_memberships_email ON memberships(email);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_created_at ON memberships(created_at DESC);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
