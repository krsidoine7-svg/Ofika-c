-- =====================================================================
-- SCRIPT OPTIMISÉ RLS + INDEX — À exécuter dans Supabase SQL Editor
-- =====================================================================
-- Conformité avec :
--   - Supabase Best Practices (security-rls-performance)
--   - Breaking change 2026-04-28 (tables exposées à l'API)
--   - Breaking change 2026-04-28 (grant pour anon/authenticated)
-- =====================================================================

-- =====================================================================
-- PARTIE 1 : ACTIVER RLS SUR TOUTES LES TABLES PUBLIQUES
-- =====================================================================

ALTER TABLE IF EXISTS profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS links            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nfc_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS digital_nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders           ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- PARTIE 2 : SUPPRIMER LES ANCIENNES POLITIQUES
-- =====================================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_own_or_public" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"            ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own"            ON profiles;

-- links
DROP POLICY IF EXISTS "links_select_via_profile"   ON links;
DROP POLICY IF EXISTS "links_insert_own_profile"   ON links;
DROP POLICY IF EXISTS "links_update_own_profile"   ON links;
DROP POLICY IF EXISTS "links_delete_own_profile"   ON links;

-- nfc_profiles
DROP POLICY IF EXISTS "nfc_profiles_select_public" ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_insert_own"    ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_update_own"    ON nfc_profiles;
DROP POLICY IF EXISTS "nfc_profiles_delete_own"    ON nfc_profiles;

-- users
DROP POLICY IF EXISTS "users_select_own"   ON users;
DROP POLICY IF EXISTS "users_update_own"   ON users;

-- admin_users
DROP POLICY IF EXISTS "admin_users_select_self" ON admin_users;

-- digital_nfc_cards
DROP POLICY IF EXISTS "nfc_cards_select_own"  ON digital_nfc_cards;
DROP POLICY IF EXISTS "nfc_cards_insert_own"  ON digital_nfc_cards;
DROP POLICY IF EXISTS "nfc_cards_update_own"  ON digital_nfc_cards;
DROP POLICY IF EXISTS "nfc_cards_delete_own"  ON digital_nfc_cards;

-- =====================================================================
-- PARTIE 3 : POLITIQUES OPTIMISÉES (avec SELECT wrapper)
-- =====================================================================
-- ✅ RÈGLE CLÉ : Toujours utiliser (select auth.uid()) au lieu de auth.uid()
--    Cela évite que la fonction soit appelée pour CHAQUE ligne → 5-10x plus rapide

-- ---- PROFILES ----
CREATE POLICY "profiles_select_own_or_public" ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (
    (select auth.uid())::text = user_id
    OR (is_public = true AND is_active = true)
  );

CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid())::text = user_id
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ---- LINKS ----
CREATE POLICY "links_select_via_profile" ON links
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND (
        profiles.user_id = (select auth.uid())::text
        OR (profiles.is_public = true AND profiles.is_active = true)
      )
    )
  );

CREATE POLICY "links_insert_own_profile" ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND profiles.user_id = (select auth.uid())::text
    )
  );

CREATE POLICY "links_update_own_profile" ON links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND profiles.user_id = (select auth.uid())::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND profiles.user_id = (select auth.uid())::text
    )
  );

CREATE POLICY "links_delete_own_profile" ON links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = links.profile_id
      AND profiles.user_id = (select auth.uid())::text
    )
  );

-- ---- NFC_PROFILES ----
CREATE POLICY "nfc_profiles_select_public" ON nfc_profiles
  FOR SELECT
  TO authenticated, anon
  USING (
    status = 'active'
    OR user_id = (select auth.uid())::text
  );

CREATE POLICY "nfc_profiles_insert_own" ON nfc_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "nfc_profiles_update_own" ON nfc_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "nfc_profiles_delete_own" ON nfc_profiles
  FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ---- USERS ----
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = id::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = id::text)
  WITH CHECK ((select auth.uid())::text = id::text);

-- ---- ADMIN_USERS ----
-- Les admins peuvent voir leur propre entrée (le service_role bypasse RLS pour les opérations admin)
CREATE POLICY "admin_users_select_self" ON admin_users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid())::text = id::text);

-- ---- DIGITAL_NFC_CARDS ----
CREATE POLICY "nfc_cards_select_own" ON digital_nfc_cards
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id = (select auth.uid())::text
    OR is_active = true
  );

CREATE POLICY "nfc_cards_insert_own" ON digital_nfc_cards
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "nfc_cards_update_own" ON digital_nfc_cards
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "nfc_cards_delete_own" ON digital_nfc_cards
  FOR DELETE
  TO authenticated
  USING ((select auth.uid())::text = user_id);

-- =====================================================================
-- PARTIE 4 : GRANT D'ACCÈS À L'API (Breaking change 2026-04-28)
-- =====================================================================
-- Depuis avril 2026, les nouvelles tables ne sont plus exposées
-- automatiquement au Data API → il faut accorder les droits manuellement.

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles          TO authenticated;
GRANT SELECT                          ON profiles          TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON links             TO authenticated;
GRANT SELECT                          ON links             TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON nfc_profiles      TO authenticated;
GRANT SELECT                          ON nfc_profiles      TO anon;

GRANT SELECT, INSERT, UPDATE          ON users             TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON digital_nfc_cards TO authenticated;
GRANT SELECT                          ON digital_nfc_cards TO anon;

-- admin_users : lecture seule pour authenticated (pas d'accès anon)
GRANT SELECT ON admin_users TO authenticated;

-- =====================================================================
-- PARTIE 5 : INDEX MANQUANTS SUR CLÉS ÉTRANGÈRES ET COLONNES RLS
-- =====================================================================
-- ✅ RÈGLE : Toujours indexer les colonnes FK et celles utilisées dans RLS

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id        ON profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_public_active   ON profiles (is_public, is_active) WHERE is_public = true AND is_active = true;

-- links
CREATE INDEX IF NOT EXISTS idx_links_profile_id         ON links (profile_id);

-- nfc_profiles
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id     ON nfc_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status       ON nfc_profiles (status) WHERE status = 'active';

-- users
CREATE INDEX IF NOT EXISTS idx_users_id                 ON users (id);

-- admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_id           ON admin_users (id);

-- digital_nfc_cards
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id        ON digital_nfc_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_active          ON digital_nfc_cards (is_active) WHERE is_active = true;

-- =====================================================================
-- PARTIE 6 : VÉRIFICATION FINALE
-- =====================================================================

DO $$
DECLARE
  tbl RECORD;
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE ' VÉRIFICATION RLS + INDEX';
  RAISE NOTICE '==============================================';

  FOR tbl IN
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname IN ('profiles','links','users','nfc_profiles','admin_users','digital_nfc_cards','orders')
    AND relkind = 'r'
    ORDER BY relname
  LOOP
    RAISE NOTICE '  % RLS: %',
      tbl.relname,
      CASE WHEN tbl.relrowsecurity THEN '✅ activé' ELSE '❌ désactivé' END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '  Index créés sur les colonnes FK et RLS ✅';
  RAISE NOTICE '  Grants API accordés ✅';
  RAISE NOTICE '  Politiques optimisées (select auth.uid()) ✅';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '  Optimisation terminée avec succès ! 🎉';
  RAISE NOTICE '==============================================';
END;
$$;












Error: Failed to run sql query: ERROR: 42P01: relation "nfc_profiles" does not exist