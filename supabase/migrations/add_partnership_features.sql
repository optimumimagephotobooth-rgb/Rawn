-- Add Partnership & Giving features
-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT UNIQUE NOT NULL,
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
  commitment_level TEXT CHECK (commitment_level IN ('Monthly', 'Quarterly', 'Annual', 'One-time')),
  notes TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_church_id ON partners(church_id);
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_partner_id ON partners(partner_id);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_email ON partners(email);

-- Partner Testimonies
CREATE TABLE IF NOT EXISTS partner_testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES partners(partner_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  testimony TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_testimonies_church_id ON partner_testimonies(church_id);
CREATE INDEX idx_partner_testimonies_partner_id ON partner_testimonies(partner_id);
CREATE INDEX idx_partner_testimonies_status ON partner_testimonies(status);
CREATE INDEX idx_partner_testimonies_is_featured ON partner_testimonies(is_featured);
CREATE INDEX idx_partner_testimonies_testimony_id ON partner_testimonies(testimony_id);

-- Biblical Giving Scriptures
CREATE TABLE IF NOT EXISTS giving_scriptures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scripture_id TEXT UNIQUE NOT NULL,
  church_id TEXT REFERENCES churches(church_id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_giving_scriptures_church_id ON giving_scriptures(church_id);
CREATE INDEX idx_giving_scriptures_is_active ON giving_scriptures(is_active);
CREATE INDEX idx_giving_scriptures_scripture_id ON giving_scriptures(scripture_id);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_scriptures ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_testimonies_updated_at BEFORE UPDATE ON partner_testimonies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_giving_scriptures_updated_at BEFORE UPDATE ON giving_scriptures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default giving scriptures
INSERT INTO giving_scriptures (scripture_id, church_id, reference, verse_text, display_order, is_active)
VALUES
  ('script_001', NULL, '2 Corinthians 9:7', 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.', 1, TRUE),
  ('script_002', NULL, 'Proverbs 3:9', 'Honor the Lord with your wealth, with the firstfruits of all your crops.', 2, TRUE),
  ('script_003', NULL, 'Malachi 3:10', 'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the Lord Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.', 3, TRUE),
  ('script_004', NULL, 'Luke 6:38', 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.', 4, TRUE),
  ('script_005', NULL, 'Acts 20:35', 'In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: "It is more blessed to give than to receive."', 5, TRUE)
ON CONFLICT (scripture_id) DO NOTHING;
