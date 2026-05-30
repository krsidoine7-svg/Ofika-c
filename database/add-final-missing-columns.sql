-- =====================================================
-- AJOUT DES COLONNES MANQUANTES FINALES
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour ajouter les dernières colonnes manquantes

-- 1. Ajouter la colonne email à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Ajouter la colonne custom_links à la table nfc_profiles
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- 3. Ajouter d'autres colonnes qui pourraient être nécessaires pour nfc_profiles
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_file TEXT,
ADD COLUMN IF NOT EXISTS logo_file TEXT;

-- 4. Ajouter des colonnes pour les réseaux sociaux dans nfc_profiles si elles n'existent pas
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- 5. Créer un index GIN pour custom_links (pour les requêtes JSON)
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_custom_links ON nfc_profiles USING GIN(custom_links);

-- 6. Vérifier que les colonnes ont été ajoutées
SELECT 'Colonnes ajoutées avec succès!' as status;

-- Vérifier les colonnes de la table profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('email', 'company', 'phone')
ORDER BY column_name;

-- Vérifier les colonnes de la table nfc_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
AND column_name IN ('custom_links', 'email', 'company', 'bio', 'full_name', 'job_title', 'phone', 'user_id', 'profile_photo_url', 'logo_file', 'whatsapp', 'facebook', 'twitter', 'website')
ORDER BY column_name;
