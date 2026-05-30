-- =====================================================
-- 🔧 FIX RLS POUR NFC_PROFILES (erreur 406)
-- =====================================================

-- 1️⃣ Vérifier l'état actuel
SELECT 
    tablename,
    rowsecurity as "RLS activé"
FROM pg_tables 
WHERE tablename = 'nfc_profiles';

-- 2️⃣ Activer RLS
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 3️⃣ Supprimer les anciennes politiques de lecture
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'nfc_profiles'
        AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON nfc_profiles', pol.policyname);
        RAISE NOTICE '✓ Politique supprimée: %', pol.policyname;
    END LOOP;
END $$;

-- 4️⃣ Créer une politique de LECTURE PUBLIQUE pour les profils actifs
-- ✅ Ceci corrige l'erreur 406 en permettant l'accès public en lecture
CREATE POLICY "nfc_profiles_public_select" ON nfc_profiles
  FOR SELECT 
  USING (status = 'active');

COMMENT ON POLICY "nfc_profiles_public_select" ON nfc_profiles IS
'Permet à tout le monde de lire les profils NFC actifs (publics). Nécessaire pour les pages publiques.';

-- 5️⃣ Créer politique de modification pour les propriétaires
CREATE POLICY "nfc_profiles_owner_all" ON nfc_profiles
  FOR ALL
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (user_id = auth.uid()::TEXT);

COMMENT ON POLICY "nfc_profiles_owner_all" ON nfc_profiles IS
'Permet aux propriétaires de gérer (CRUD) leurs propres profils NFC.';

-- 6️⃣ Vérification finale
SELECT 
    policyname as "Politique",
    cmd as "Commande",
    permissive as "Type",
    qual as "Condition USING",
    with_check as "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
ORDER BY policyname;

-- 7️⃣ Rapport
DO $$
DECLARE policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'nfc_profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ NFC_PROFILES RLS CONFIGURÉ !      ║';
    RAISE NOTICE '╚════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Politiques créées : %', policy_count;
    RAISE NOTICE 'Lecture publique : AUTORISÉE (profils actifs)';
    RAISE NOTICE 'Modification : PROPRIÉTAIRES uniquement';
    RAISE NOTICE '';
END $$;
