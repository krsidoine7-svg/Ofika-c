-- =====================================================
-- 🔧 FIX TOUTES LES ERREURS - SCRIPT COMPLET
-- =====================================================
-- Ce script corrige l'erreur 403 sur analytics_events
-- Exécuter dans Supabase SQL Editor

-- ✅ ÉTAPE 1 : Supprimer TOUTES les politiques existantes (dynamiquement)
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Boucle sur toutes les politiques existantes
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'analytics_events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON analytics_events', pol.policyname);
        RAISE NOTICE '✓ Politique supprimée: %', pol.policyname;
    END LOOP;
END $$;

-- ✅ ÉTAPE 2 : Désactiver temporairement RLS
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- ✅ ÉTAPE 3 : Vider la table (optionnel - décommenter si nécessaire)
-- TRUNCATE TABLE analytics_events CASCADE;

-- ✅ ÉTAPE 4 : Supprimer toutes les contraintes foreign key
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'analytics_events'::regclass 
        AND contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS %I', constraint_rec.conname);
        RAISE NOTICE '✓ Contrainte supprimée: %', constraint_rec.conname;
    END LOOP;
END $$;

-- ✅ ÉTAPE 5 : Changer le type de profile_id (UUID → TEXT)
-- Nécessaire pour compatibilité avec profiles.id et nfc_profiles.id
DO $$
DECLARE
    current_type TEXT;
BEGIN
    -- Vérifier le type actuel
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'profile_id';
    
    -- Convertir si nécessaire
    IF current_type = 'uuid' THEN
        ALTER TABLE analytics_events ALTER COLUMN profile_id TYPE TEXT;
        RAISE NOTICE '✓ Colonne profile_id changée de UUID vers TEXT';
    ELSE
        RAISE NOTICE '✓ Colonne profile_id déjà en TEXT';
    END IF;
END $$;

-- ✅ ÉTAPE 6 : Changer le type de user_id (UUID → TEXT) si elle existe
DO $$
DECLARE
    current_type TEXT;
BEGIN
    -- Vérifier si la colonne existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics_events' AND column_name = 'user_id'
    ) THEN
        SELECT data_type INTO current_type
        FROM information_schema.columns
        WHERE table_name = 'analytics_events' AND column_name = 'user_id';
        
        IF current_type = 'uuid' THEN
            ALTER TABLE analytics_events ALTER COLUMN user_id TYPE TEXT;
            RAISE NOTICE '✓ Colonne user_id changée de UUID vers TEXT';
        ELSE
            RAISE NOTICE '✓ Colonne user_id déjà en TEXT';
        END IF;
    ELSE
        RAISE NOTICE '✓ Colonne user_id n''existe pas';
    END IF;
END $$;

-- ✅ ÉTAPE 7 : Réactiver RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ✅ ÉTAPE 8 : Créer la politique d'INSERTION PUBLIQUE (CRITIQUE)
-- Cette politique permet aux visiteurs anonymes de tracker les vues
CREATE POLICY "analytics_insert_public" ON analytics_events
  FOR INSERT 
  WITH CHECK (true);

COMMENT ON POLICY "analytics_insert_public" ON analytics_events IS 
'Permet à TOUT LE MONDE (même anonyme) d''insérer des événements analytics. Nécessaire pour tracker les vues de profils publics.';

-- ✅ ÉTAPE 9 : Créer la politique de SELECT (pour les propriétaires)
CREATE POLICY "analytics_select_owner" ON analytics_events
  FOR SELECT 
  USING (
    -- L'utilisateur peut voir les analytics de ses propres profils
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()::text
    )
    OR
    -- L'utilisateur peut voir les analytics de ses propres cartes NFC
    profile_id IN (
      SELECT id FROM nfc_profiles WHERE user_id = auth.uid()::text
    )
  );

COMMENT ON POLICY "analytics_select_owner" ON analytics_events IS 
'Permet aux utilisateurs de voir uniquement les analytics de leurs propres profils et cartes NFC.';

-- ✅ ÉTAPE 10 : Vérification finale et rapport
DO $$
DECLARE
    profile_id_type TEXT;
    user_id_type TEXT;
    policy_count INT;
    rls_enabled BOOLEAN;
BEGIN
    -- Récupérer les types de colonnes
    SELECT data_type INTO profile_id_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'profile_id';
    
    SELECT data_type INTO user_id_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'user_id';
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'analytics_events';
    
    -- Vérifier RLS
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE tablename = 'analytics_events';
    
    -- Afficher le rapport
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ ANALYTICS_EVENTS CORRIGÉ AVEC SUCCÈS !        ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Type profile_id ......... %', profile_id_type;
    RAISE NOTICE 'Type user_id ............ %', COALESCE(user_id_type, 'N/A');
    RAISE NOTICE 'Politiques créées ....... %', policy_count;
    RAISE NOTICE 'RLS activé .............. %', CASE WHEN rls_enabled THEN 'OUI ✓' ELSE 'NON ✗' END;
    RAISE NOTICE 'Insertion publique ...... AUTORISÉE ✓';
    RAISE NOTICE 'Lecture propriétaires ... AUTORISÉE ✓';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Actions suivantes :';
    RAISE NOTICE '   1. Rafraîchir votre application Next.js';
    RAISE NOTICE '   2. Tester /nfc/[votre-lien]';
    RAISE NOTICE '   3. Vérifier la console : pas d''erreur 403 !';
    RAISE NOTICE '';
END $$;

-- ✅ Afficher la structure finale
SELECT 
    column_name AS "Colonne",
    data_type AS "Type",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_name = 'analytics_events'
ORDER BY ordinal_position;

-- ✅ Afficher les politiques finales
SELECT 
    policyname AS "Politique",
    cmd AS "Commande",
    permissive AS "Permissive"
FROM pg_policies
WHERE tablename = 'analytics_events'
ORDER BY policyname;
