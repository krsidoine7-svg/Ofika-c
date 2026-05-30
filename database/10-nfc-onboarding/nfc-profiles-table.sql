-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - BASE DE DONNÉES
-- =====================================================

-- Table principale pour les profils NFC
CREATE TABLE IF NOT EXISTS nfc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  full_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  bio TEXT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Réseaux sociaux
  instagram TEXT,
  tiktok TEXT,
  linkedin TEXT,
  other_links TEXT,
  
  -- Localisation
  location VARCHAR(255),
   
  -- Profil
  profile_name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE,
  custom_url VARCHAR(100) UNIQUE,
  
  -- Logo et design
  logo_url TEXT,
  design_choice VARCHAR(50) NOT NULL,
  color_theme VARCHAR(50) NOT NULL,
  
  -- NFC et QR
  nfc_link TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  
  -- Statut
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_nfc_link ON nfc_profiles(nfc_link);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_custom_url ON nfc_profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_username ON nfc_profiles(username);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON nfc_profiles(status);

-- RLS (Row Level Security)
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own NFC profiles" ON nfc_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFC profiles" ON nfc_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFC profiles" ON nfc_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFC profiles" ON nfc_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Politique publique pour les profils actifs (pour les pages publiques)
CREATE POLICY "Public can view active NFC profiles" ON nfc_profiles
  FOR SELECT USING (status = 'active');

-- Contraintes de validation
ALTER TABLE nfc_profiles ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE nfc_profiles ADD CONSTRAINT check_phone_format 
  CHECK (phone ~* '^[\+]?[0-9\s\-\(\)]+$');

ALTER TABLE nfc_profiles ADD CONSTRAINT check_username_format 
  CHECK (username IS NULL OR username ~* '^[a-zA-Z0-9_-]{3,50}$');

ALTER TABLE nfc_profiles ADD CONSTRAINT check_custom_url_format 
  CHECK (custom_url IS NULL OR custom_url ~* '^[a-zA-Z0-9_-]{3,100}$');

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_nfc_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nfc_profiles_updated_at
  BEFORE UPDATE ON nfc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_nfc_profiles_updated_at();
