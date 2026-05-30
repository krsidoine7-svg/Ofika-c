-- =====================================================
-- AJOUT SIMPLE DES COLONNES MANQUANTES
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Version simplifiée sans contraintes complexes

-- 1. Ajouter les colonnes manquantes à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS other_links TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 2. Ajouter les colonnes manquantes à la table nfc_profiles
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_file TEXT,
ADD COLUMN IF NOT EXISTS logo_file TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS profile_id TEXT REFERENCES profiles(id);

-- 3. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_custom_links ON nfc_profiles USING GIN(custom_links);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id ON nfc_profiles(profile_id);

-- 4. Vérifier que les colonnes ont été ajoutées
SELECT 'Toutes les colonnes ajoutées avec succès!' as status;

-- Vérifier les colonnes de la table profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('email', 'full_name', 'company', 'job_title', 'phone', 'location', 'instagram', 'tiktok', 'linkedin', 'other_links', 'logo_url', 'profile_photo_url', 'status')
ORDER BY column_name;

-- Vérifier les colonnes de la table nfc_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
AND column_name IN ('custom_links', 'profile_photo_url', 'profile_photo_file', 'logo_file', 'whatsapp', 'facebook', 'twitter', 'website', 'profile_id')
ORDER BY column_name;
