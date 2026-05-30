-- =====================================================
-- Migration: Activer RLS et corriger les profils publics
-- Description: Active RLS sur toutes les tables et s'assure que les profils sont accessibles publiquement
-- Date: 2025-01-08
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
    auth.uid() = user_id OR 
    (is_public = true AND is_active = true)
  );

CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 4. POLITIQUES LINKS - Lecture via profils publics
CREATE POLICY "links_select_via_profile" ON links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND (
        profiles.user_id = auth.uid() OR 
        (profiles.is_public = true AND profiles.is_active = true)
      )
    )
  );

CREATE POLICY "links_insert_own_profile" ON links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "links_update_own_profile" ON links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "links_delete_own_profile" ON links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- 5. POLITIQUES NFC_PROFILES - Lecture publique pour profils actifs
CREATE POLICY "nfc_profiles_select_public" ON nfc_profiles
  FOR SELECT USING (
    status = 'active' OR 
    user_id = auth.uid()
  );

CREATE POLICY "nfc_profiles_insert_own" ON nfc_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "nfc_profiles_update_own" ON nfc_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nfc_profiles_delete_own" ON nfc_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 6. S'assurer que les profils existants sont publics et actifs par défaut
UPDATE profiles
SET 
  is_public = COALESCE(is_public, true),
  is_active = COALESCE(is_active, true)
WHERE is_public IS NULL OR is_active IS NULL;

-- 7. S'assurer que les profils NFC sont actifs
UPDATE nfc_profiles
SET status = 'active'
WHERE status IS NULL OR status = '';

-- 8. Vérifier et afficher les profils publics
DO $$
DECLARE
  public_count integer;
  active_count integer;
BEGIN
  SELECT COUNT(*) INTO public_count 
  FROM profiles 
  WHERE is_public = true AND is_active = true;
  
  SELECT COUNT(*) INTO active_count 
  FROM nfc_profiles 
  WHERE status = 'active';
  
  RAISE NOTICE '✅ Profils publics actifs: %', public_count;
  RAISE NOTICE '✅ Profils NFC actifs: %', active_count;
END;
$$;
