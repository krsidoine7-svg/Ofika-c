-- Migration pour ajouter les nouveaux champs à la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. D'abord, corriger les tailles des colonnes existantes qui pourraient être limitées
ALTER TABLE profiles 
ALTER COLUMN bio TYPE TEXT,
ALTER COLUMN name TYPE TEXT,
ALTER COLUMN custom_url TYPE TEXT,
ALTER COLUMN username TYPE TEXT,
ALTER COLUMN image_url TYPE TEXT;

-- 2. Ajouter les colonnes pour les réseaux sociaux
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- 3. Ajouter la colonne pour les liens personnalisés (JSONB)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- 3. Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN profiles.whatsapp IS 'URL du profil WhatsApp';
COMMENT ON COLUMN profiles.facebook IS 'URL du profil Facebook';
COMMENT ON COLUMN profiles.instagram IS 'URL du profil Instagram';
COMMENT ON COLUMN profiles.twitter IS 'URL du profil Twitter';
COMMENT ON COLUMN profiles.website IS 'URL du site web personnel';
COMMENT ON COLUMN profiles.custom_links IS 'Liens personnalisés (boutique, portfolio, etc.)';

-- 4. Créer des index pour améliorer les performances (optionnel)
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_facebook ON profiles(facebook) WHERE facebook IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_twitter ON profiles(twitter) WHERE twitter IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_website ON profiles(website) WHERE website IS NOT NULL;

-- 5. Créer un index GIN pour les liens personnalisés (pour les requêtes JSON)
CREATE INDEX IF NOT EXISTS idx_profiles_custom_links ON profiles USING GIN(custom_links);

-- 6. Ajouter des contraintes de validation (optionnel)
-- Validation des URLs (si vous voulez être strict)
-- ALTER TABLE profiles ADD CONSTRAINT check_whatsapp_url 
-- CHECK (whatsapp IS NULL OR whatsapp ~ '^https?://.*');

-- ALTER TABLE profiles ADD CONSTRAINT check_facebook_url 
-- CHECK (facebook IS NULL OR facebook ~ '^https?://.*');

-- ALTER TABLE profiles ADD CONSTRAINT check_instagram_url 
-- CHECK (instagram IS NULL OR instagram ~ '^https?://.*');

-- ALTER TABLE profiles ADD CONSTRAINT check_twitter_url 
-- CHECK (twitter IS NULL OR twitter ~ '^https?://.*');

-- ALTER TABLE profiles ADD CONSTRAINT check_website_url 
-- CHECK (website IS NULL OR website ~ '^https?://.*');

-- 7. Mettre à jour les données existantes (optionnel)
-- Si vous avez des données existantes et voulez initialiser custom_links
UPDATE profiles 
SET custom_links = '[]'::jsonb 
WHERE custom_links IS NULL;

-- 8. Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
