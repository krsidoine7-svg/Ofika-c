-- =====================================================
-- CORRECTION DES ERREURS DE SCHÉMA NFC
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour corriger les erreurs de colonnes manquantes

-- 1. Ajouter la colonne company à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- 2. Ajouter la colonne phone à la table profiles si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 3. Vérifier que la table nfc_profiles existe et a toutes les colonnes nécessaires
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

-- 4. Activer RLS sur nfc_profiles
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour nfc_profiles
DO $$
BEGIN
  -- Supprimer les politiques existantes si elles existent
  DROP POLICY IF EXISTS "Users can view their own NFC profiles" ON nfc_profiles;
  DROP POLICY IF EXISTS "Users can insert their own NFC profiles" ON nfc_profiles;
  DROP POLICY IF EXISTS "Users can update their own NFC profiles" ON nfc_profiles;
  DROP POLICY IF EXISTS "Users can delete their own NFC profiles" ON nfc_profiles;
  DROP POLICY IF EXISTS "Public can view active NFC profiles" ON nfc_profiles;
  
  -- Créer les nouvelles politiques
  CREATE POLICY "Users can view their own NFC profiles" ON nfc_profiles
    FOR SELECT USING (auth.uid()::text = user_id);
  
  CREATE POLICY "Users can insert their own NFC profiles" ON nfc_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
  CREATE POLICY "Users can update their own NFC profiles" ON nfc_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);
  
  CREATE POLICY "Users can delete their own NFC profiles" ON nfc_profiles
    FOR DELETE USING (auth.uid()::text = user_id);
  
  CREATE POLICY "Public can view active NFC profiles" ON nfc_profiles
    FOR SELECT USING (status = 'active');
END $$;

-- 6. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_nfc_link ON nfc_profiles(nfc_link);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_custom_url ON nfc_profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_username ON nfc_profiles(username);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON nfc_profiles(status);

-- 7. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_nfc_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_nfc_profiles_updated_at ON nfc_profiles;
CREATE TRIGGER trigger_update_nfc_profiles_updated_at
  BEFORE UPDATE ON nfc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_nfc_profiles_updated_at();

-- 8. Vérifier que les colonnes ont été ajoutées
SELECT 'Migration terminée!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('company', 'phone')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
AND column_name IN ('bio', 'company', 'full_name', 'job_title', 'phone', 'email')
ORDER BY column_name;
