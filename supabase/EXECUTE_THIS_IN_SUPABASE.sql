-- =====================================================
-- SCRIPT À EXÉCUTER DANS SUPABASE SQL EDITOR
-- =====================================================
-- Instructions :
-- 1. Ouvrez votre projet Supabase
-- 2. Allez dans SQL Editor
-- 3. Créez une nouvelle requête
-- 4. Copiez-collez tout ce fichier
-- 5. Cliquez sur "Run" (ou F5)
-- =====================================================

-- =====================================================
-- PARTIE 1: Migration des réseaux sociaux
-- =====================================================

-- Ajouter la nouvelle colonne social_links si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Migrer les données existantes vers le nouveau format (seulement si les anciennes colonnes existent)
DO $$
BEGIN
  -- Vérifier si les anciennes colonnes existent avant de migrer
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'whatsapp'
  ) THEN
    UPDATE profiles
    SET social_links = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'platform', social_type,
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
    
    -- Supprimer les anciennes colonnes
    ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;
    ALTER TABLE profiles DROP COLUMN IF EXISTS facebook;
    ALTER TABLE profiles DROP COLUMN IF EXISTS instagram;
    ALTER TABLE profiles DROP COLUMN IF EXISTS twitter;
    ALTER TABLE profiles DROP COLUMN IF EXISTS youtube;
    ALTER TABLE profiles DROP COLUMN IF EXISTS tiktok;
    ALTER TABLE profiles DROP COLUMN IF EXISTS website;
  END IF;
END $$;

-- Ajouter un commentaire sur la colonne
COMMENT ON COLUMN profiles.social_links IS 'Array of social media links in format: [{platform: "instagram", url: "https://..."}]. Max 4 links per profile.';

-- Créer un index GIN pour les requêtes JSON
CREATE INDEX IF NOT EXISTS idx_profiles_social_links 
ON profiles USING gin (social_links);

-- Fonction de validation pour limiter à 4 liens
CREATE OR REPLACE FUNCTION validate_social_links_count()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(NEW.social_links) > 4 THEN
    RAISE EXCEPTION 'Maximum 4 social links allowed per profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger de validation
DROP TRIGGER IF EXISTS trigger_validate_social_links ON profiles;
CREATE TRIGGER trigger_validate_social_links
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_social_links_count();

-- =====================================================
-- PARTIE 2: Activer RLS et corriger les profils publics
-- =====================================================

-- Activer RLS sur les tables principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "profiles_select_own_or_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

DROP POLICY IF EXISTS "links_select_via_profile" ON links;
DROP POLICY IF EXISTS "links_insert_own_profile" ON links;
DROP POLICY IF EXISTS "links_update_own_profile" ON links;
DROP POLICY IF EXISTS "links_delete_own_profile" ON links;

DROP POLICY IF EXISTS "nfc_profiles_select_public" ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_insert_own" ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_update_own" ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_delete_own" ON nfc_profiles;

-- POLITIQUES PROFILES - Lecture publique pour profils actifs
CREATE POLICY "profiles_select_own_or_public" ON profiles
  FOR SELECT USING (
    auth.uid()::text = user_id OR 
    (is_public = true AND is_active = true)
  );

CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- POLITIQUES LINKS - Lecture via profils publics
CREATE POLICY "links_select_via_profile" ON links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND (
        profiles.user_id = auth.uid()::text OR 
        (profiles.is_public = true AND profiles.is_active = true)
      )
    )
  );

CREATE POLICY "links_insert_own_profile" ON links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "links_update_own_profile" ON links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "links_delete_own_profile" ON links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

-- POLITIQUES NFC_PROFILES - Lecture publique pour profils actifs
CREATE POLICY "nfc_profiles_select_public" ON nfc_profiles
  FOR SELECT USING (
    status = 'active' OR 
    user_id = auth.uid()::text
  );

CREATE POLICY "nfc_profiles_insert_own" ON nfc_profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "nfc_profiles_update_own" ON nfc_profiles
  FOR UPDATE USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "nfc_profiles_delete_own" ON nfc_profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- S'assurer que les profils existants sont publics et actifs par défaut
UPDATE profiles
SET 
  is_public = COALESCE(is_public, true),
  is_active = COALESCE(is_active, true)
WHERE is_public IS NULL OR is_active IS NULL;

-- S'assurer que les profils NFC sont actifs
UPDATE nfc_profiles
SET status = 'active'
WHERE status IS NULL OR status = '';

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

DO $$
DECLARE
  public_count integer;
  active_count integer;
  rls_profiles boolean;
  rls_links boolean;
  rls_nfc boolean;
BEGIN
  -- Compter les profils publics
  SELECT COUNT(*) INTO public_count 
  FROM profiles 
  WHERE is_public = true AND is_active = true;
  
  -- Compter les profils NFC actifs
  SELECT COUNT(*) INTO active_count 
  FROM nfc_profiles 
  WHERE status = 'active';
  
  -- Vérifier RLS
  SELECT relrowsecurity INTO rls_profiles
  FROM pg_class
  WHERE relname = 'profiles';
  
  SELECT relrowsecurity INTO rls_links
  FROM pg_class
  WHERE relname = 'links';
  
  SELECT relrowsecurity INTO rls_nfc
  FROM pg_class
  WHERE relname = 'nfc_profiles';
  
  -- Afficher les résultats
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSULTATS DE LA MIGRATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Profils publics actifs: %', public_count;
  RAISE NOTICE '✅ Profils NFC actifs: %', active_count;
  RAISE NOTICE '';
  RAISE NOTICE 'État RLS:';
  RAISE NOTICE '  - profiles: %', CASE WHEN rls_profiles THEN '✅ Activé' ELSE '❌ Désactivé' END;
  RAISE NOTICE '  - links: %', CASE WHEN rls_links THEN '✅ Activé' ELSE '❌ Désactivé' END;
  RAISE NOTICE '  - nfc_profiles: %', CASE WHEN rls_nfc THEN '✅ Activé' ELSE '❌ Désactivé' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration terminée avec succès ! 🎉';
  RAISE NOTICE '========================================';
END;
$$;
