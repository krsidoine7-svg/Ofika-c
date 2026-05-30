-- =====================================================
-- 🔧 FIX ANALYTICS - VERSION ULTRA SIMPLE
-- =====================================================
-- Cette version ne touche PAS aux types de colonnes
-- Elle crée juste des politiques compatibles avec les types existants

-- 1️⃣ Nettoyer toutes les politiques
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'analytics_events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON analytics_events', pol.policyname);
    END LOOP;
END $$;

-- 2️⃣ Désactiver RLS temporairement
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- 3️⃣ Réactiver RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Politique d'INSERTION PUBLIQUE (la plus importante)
-- ✅ Permet à TOUT LE MONDE (même anonyme) d'insérer des analytics
CREATE POLICY "public_insert_analytics" ON analytics_events
  FOR INSERT 
  WITH CHECK (true);

-- 5️⃣ Politique de SELECT pour propriétaires
-- ✅ Version avec casts dynamiques pour gérer UUID et TEXT
CREATE POLICY "owner_select_analytics" ON analytics_events
  FOR SELECT 
  USING (
    -- Option 1: Profils publics
    profile_id::TEXT IN (
      SELECT id::TEXT FROM profiles 
      WHERE user_id::TEXT = (auth.uid())::TEXT
    )
    OR
    -- Option 2: Cartes NFC
    profile_id::TEXT IN (
      SELECT id::TEXT FROM nfc_profiles 
      WHERE user_id::TEXT = (auth.uid())::TEXT
    )
  );

-- 6️⃣ Vérification
DO $$
DECLARE policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'analytics_events';
    RAISE NOTICE '✅ TERMINÉ ! % politique(s) créée(s)', policy_count;
END $$;

-- 7️⃣ Afficher les politiques créées
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'analytics_events';
