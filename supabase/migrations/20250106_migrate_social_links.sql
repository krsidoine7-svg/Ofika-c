-- =====================================================
-- Migration: Système dynamique de réseaux sociaux
-- Description: Remplace les colonnes individuelles par un tableau JSON
-- Date: 2025-01-06
-- =====================================================

-- 1. Ajouter la nouvelle colonne social_links
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- 2. Migrer les données existantes vers le nouveau format
UPDATE profiles
SET social_links = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', social_type,
      'url', social_url
    )
  )
  FROM (
    SELECT 'whatsapp' as social_type, whatsapp as social_url WHERE whatsapp IS NOT NULL AND whatsapp != ''
    UNION ALL
    SELECT 'facebook', facebook WHERE facebook IS NOT NULL AND facebook != ''
    UNION ALL
    SELECT 'instagram', instagram WHERE instagram IS NOT NULL AND instagram != ''
    UNION ALL
    SELECT 'twitter', twitter WHERE twitter IS NOT NULL AND twitter != ''
    UNION ALL
    SELECT 'youtube', youtube WHERE youtube IS NOT NULL AND youtube != ''
    UNION ALL
    SELECT 'tiktok', tiktok WHERE tiktok IS NOT NULL AND tiktok != ''
    UNION ALL
    SELECT 'website', website WHERE website IS NOT NULL AND website != ''
  ) as social_data
  WHERE social_url IS NOT NULL
)
WHERE id IN (
  SELECT id FROM profiles
  WHERE whatsapp IS NOT NULL OR facebook IS NOT NULL OR instagram IS NOT NULL 
     OR twitter IS NOT NULL OR youtube IS NOT NULL OR tiktok IS NOT NULL 
     OR website IS NOT NULL
);

-- 3. Supprimer les anciennes colonnes
ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;
ALTER TABLE profiles DROP COLUMN IF EXISTS facebook;
ALTER TABLE profiles DROP COLUMN IF EXISTS instagram;
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter;
ALTER TABLE profiles DROP COLUMN IF EXISTS youtube;
ALTER TABLE profiles DROP COLUMN IF EXISTS tiktok;
ALTER TABLE profiles DROP COLUMN IF EXISTS website;

-- 4. Ajouter un commentaire sur la colonne
COMMENT ON COLUMN profiles.social_links IS 'Array of social media links in format: [{type: "instagram", url: "https://..."}]. Max 15 links per profile.';

-- 5. Créer un index GIN pour les requêtes JSON
CREATE INDEX IF NOT EXISTS idx_profiles_social_links 
ON profiles USING gin (social_links);

-- 6. Fonction de validation pour limiter à 4 liens
CREATE OR REPLACE FUNCTION validate_social_links_count()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(NEW.social_links) > 15 THEN
    RAISE EXCEPTION 'Maximum 15 social links allowed per profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger de validation
DROP TRIGGER IF EXISTS trigger_validate_social_links ON profiles;
CREATE TRIGGER trigger_validate_social_links
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_social_links_count();

-- 8. Mettre à jour updated_at pour les profils migrés
UPDATE profiles
SET updated_at = NOW()
WHERE social_links IS NOT NULL AND jsonb_array_length(social_links) > 0;

-- =====================================================
-- Rollback (si nécessaire)
-- =====================================================
-- ALTER TABLE profiles ADD COLUMN whatsapp TEXT;
-- ALTER TABLE profiles ADD COLUMN facebook TEXT;
-- ALTER TABLE profiles ADD COLUMN instagram TEXT;
-- ALTER TABLE profiles ADD COLUMN twitter TEXT;
-- ALTER TABLE profiles ADD COLUMN youtube TEXT;
-- ALTER TABLE profiles ADD COLUMN tiktok TEXT;
-- ALTER TABLE profiles ADD COLUMN website TEXT;
-- ALTER TABLE profiles DROP COLUMN social_links;
-- DROP TRIGGER IF EXISTS trigger_validate_social_links ON profiles;
-- DROP FUNCTION IF EXISTS validate_social_links_count();
