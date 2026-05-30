-- =====================================================
-- MIGRATION DES DONNÉES - À EXÉCUTER AVANT DRIZZLE PUSH
-- =====================================================
-- Ce script migre les données des anciennes colonnes
-- vers le nouveau format JSON AVANT que Drizzle
-- ne supprime les anciennes colonnes
-- =====================================================

-- 1. Ajouter la colonne social_links si elle n'existe pas encore
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- 2. Migrer les données existantes vers le nouveau format
UPDATE profiles
SET social_links = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'platform', social_type,
      'url', social_url
    )
  )
  FROM (
    SELECT 'whatsapp' as social_type, whatsapp as social_url 
    WHERE whatsapp IS NOT NULL AND whatsapp != ''
    UNION ALL
    SELECT 'facebook', facebook 
    WHERE facebook IS NOT NULL AND facebook != ''
    UNION ALL
    SELECT 'instagram', instagram 
    WHERE instagram IS NOT NULL AND instagram != ''
    UNION ALL
    SELECT 'twitter', twitter 
    WHERE twitter IS NOT NULL AND twitter != ''
    UNION ALL
    SELECT 'youtube', youtube 
    WHERE youtube IS NOT NULL AND youtube != ''
    UNION ALL
    SELECT 'tiktok', tiktok 
    WHERE tiktok IS NOT NULL AND tiktok != ''
    UNION ALL
    SELECT 'linkedin', linkedin 
    WHERE linkedin IS NOT NULL AND linkedin != ''
    UNION ALL
    SELECT 'website', website 
    WHERE website IS NOT NULL AND website != ''
  ) as social_data
  WHERE social_url IS NOT NULL
)
WHERE id IN (
  SELECT id FROM profiles
  WHERE whatsapp IS NOT NULL 
     OR facebook IS NOT NULL 
     OR instagram IS NOT NULL 
     OR twitter IS NOT NULL 
     OR youtube IS NOT NULL 
     OR tiktok IS NOT NULL 
     OR linkedin IS NOT NULL 
     OR website IS NOT NULL
);

-- 3. Créer un index GIN pour les requêtes JSON
CREATE INDEX IF NOT EXISTS idx_profiles_social_links 
ON profiles USING gin (social_links);

-- 4. Fonction de validation (max 4 liens)
CREATE OR REPLACE FUNCTION validate_social_links_count()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(NEW.social_links) > 4 THEN
    RAISE EXCEPTION 'Maximum 4 social links allowed per profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger de validation
DROP TRIGGER IF EXISTS trigger_validate_social_links ON profiles;
CREATE TRIGGER trigger_validate_social_links
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_social_links_count();

-- 6. Afficher le résultat de la migration
DO $$
DECLARE
  migrated_count integer;
  total_count integer;
BEGIN
  SELECT COUNT(*) INTO migrated_count 
  FROM profiles 
  WHERE social_links IS NOT NULL 
    AND jsonb_array_length(social_links) > 0;
  
  SELECT COUNT(*) INTO total_count 
  FROM profiles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION DES DONNÉES TERMINÉE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Profils migrés: % sur %', migrated_count, total_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Vous pouvez maintenant exécuter:';
  RAISE NOTICE '  npm run db:push';
  RAISE NOTICE '========================================';
END;
$$;

-- 7. Afficher un aperçu des données migrées
SELECT 
  id,
  name,
  social_links,
  jsonb_array_length(social_links) as nb_liens
FROM profiles
WHERE social_links IS NOT NULL 
  AND jsonb_array_length(social_links) > 0
LIMIT 5;
