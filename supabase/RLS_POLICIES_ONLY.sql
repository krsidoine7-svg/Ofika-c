-- =====================================================
-- POLITIQUES RLS UNIQUEMENT
-- =====================================================
-- Ce script active UNIQUEMENT les politiques RLS
-- Les changements de structure sont gérés par Drizzle
-- =====================================================

-- 1. Activer RLS sur les tables principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
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

-- 3. POLITIQUES PROFILES - Lecture publique pour profils actifs
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

-- 4. POLITIQUES LINKS - Lecture via profils publics
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

-- 5. POLITIQUES NFC_PROFILES - Lecture publique pour profils actifs
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

-- 6. S'assurer que les profils existants sont publics et actifs
UPDATE profiles
SET 
  is_public = COALESCE(is_public, true),
  is_active = COALESCE(is_active, true)
WHERE is_public IS NULL OR is_active IS NULL;

-- 7. S'assurer que les profils NFC sont actifs
UPDATE nfc_profiles
SET status = 'active'
WHERE status IS NULL OR status = '';

-- 8. Vérification
DO $$
DECLARE
  rls_profiles boolean;
  rls_links boolean;
  rls_nfc boolean;
BEGIN
  SELECT relrowsecurity INTO rls_profiles FROM pg_class WHERE relname = 'profiles';
  SELECT relrowsecurity INTO rls_links FROM pg_class WHERE relname = 'links';
  SELECT relrowsecurity INTO rls_nfc FROM pg_class WHERE relname = 'nfc_profiles';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS ACTIVÉ:';
  RAISE NOTICE '  - profiles: %', CASE WHEN rls_profiles THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  - links: %', CASE WHEN rls_links THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  - nfc_profiles: %', CASE WHEN rls_nfc THEN '✅' ELSE '❌' END;
  RAISE NOTICE '========================================';
END;
$$;
