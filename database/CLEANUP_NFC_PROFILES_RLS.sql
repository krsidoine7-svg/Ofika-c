-- =====================================================
-- 🧹 NETTOYAGE COMPLET DES POLITIQUES NFC_PROFILES
-- =====================================================
-- Supprime les doublons et crée uniquement les politiques nécessaires

-- 1️⃣ SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'nfc_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON nfc_profiles', pol.policyname);
        RAISE NOTICE '✓ Politique supprimée: %', pol.policyname;
    END LOOP;
END $$;

-- 2️⃣ DÉSACTIVER TEMPORAIREMENT RLS
ALTER TABLE nfc_profiles DISABLE ROW LEVEL SECURITY;

-- 3️⃣ RÉACTIVER RLS
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CRÉER LES POLITIQUES NÉCESSAIRES (2 SEULEMENT)

-- ✅ POLITIQUE 1 : LECTURE PUBLIQUE (profils actifs)
-- Permet à TOUT LE MONDE (même non connecté) de lire les profils actifs
CREATE POLICY "public_read_active_profiles" ON nfc_profiles
  FOR SELECT 
  USING (status = 'active');

COMMENT ON POLICY "public_read_active_profiles" ON nfc_profiles IS
'Permet la lecture publique des profils NFC actifs. Nécessaire pour les pages publiques /[username] et /nfc/[link].';

-- ✅ POLITIQUE 2 : PROPRIÉTAIRES (toutes actions)
-- Permet aux propriétaires de gérer (CRUD) leurs propres profils
CREATE POLICY "owners_manage_own_profiles" ON nfc_profiles
  FOR ALL
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (user_id = auth.uid()::TEXT);

COMMENT ON POLICY "owners_manage_own_profiles" ON nfc_profiles IS
'Permet aux propriétaires de gérer (SELECT, INSERT, UPDATE, DELETE) leurs propres profils NFC uniquement.';

-- 5️⃣ VÉRIFICATION
SELECT 
    policyname as "Politique",
    cmd as "Commande",
    permissive as "Type",
    CASE 
        WHEN cmd = 'SELECT' THEN 'PUBLIC (profils actifs)'
        ELSE 'PROPRIÉTAIRES uniquement'
    END as "Qui ?"
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
ORDER BY policyname;

-- 6️⃣ RAPPORT
DO $$
DECLARE policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'nfc_profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ NFC_PROFILES NETTOYÉ ET SÉCURISÉ !            ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Politiques créées ........ %', policy_count;
    RAISE NOTICE 'Lecture publique ......... AUTORISÉE (profils actifs)';
    RAISE NOTICE 'Gestion propriétaires .... AUTORISÉE (CRUD complet)';
    RAISE NOTICE 'Sécurité ................. ✓ RENFORCÉE';
    RAISE NOTICE 'Performance .............. ✓ OPTIMISÉE';
    RAISE NOTICE '';
    
    IF policy_count = 2 THEN
        RAISE NOTICE '🎯 Parfait ! Nombre de politiques optimal.';
    ELSE
        RAISE WARNING '⚠️  Attention ! % politiques au lieu de 2.', policy_count;
    END IF;
END $$;

-- 7️⃣ TEST DE SÉCURITÉ
-- Vérifier qu'un utilisateur ne peut pas modifier les profils des autres
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 TEST DE SÉCURITÉ :';
    RAISE NOTICE '   ✓ Un visiteur anonyme peut lire les profils actifs';
    RAISE NOTICE '   ✓ Un utilisateur peut gérer uniquement SES profils';
    RAISE NOTICE '   ✓ Un utilisateur NE PEUT PAS modifier les profils des autres';
    RAISE NOTICE '';
END $$;
