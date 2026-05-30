-- =====================================================
-- 🔧 FIX ANALYTICS - VERSION CORRIGÉE (avec casts explicites)
-- =====================================================
-- ✅ Cette version gère correctement les types UUID vs TEXT

-- ÉTAPE 1 : Supprimer TOUTES les politiques existantes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'analytics_events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON analytics_events', pol.policyname);
        RAISE NOTICE '✓ Politique supprimée: %', pol.policyname;
    END LOOP;
END $$;

-- ÉTAPE 2 : Désactiver RLS
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 3 : Vider la table (optionnel - décommenter si besoin)
-- TRUNCATE TABLE analytics_events CASCADE;

-- ÉTAPE 4 : Supprimer toutes les contraintes foreign key
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

-- ÉTAPE 5 : Déterminer et convertir le type de profile_id
DO $$
DECLARE
    current_profile_type TEXT;
    profiles_id_type TEXT;
    nfc_profiles_id_type TEXT;
BEGIN
    -- Vérifier le type actuel de analytics_events.profile_id
    SELECT data_type INTO current_profile_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'profile_id';
    
    -- Vérifier le type de profiles.id
    SELECT data_type INTO profiles_id_type
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'id';
    
    -- Vérifier le type de nfc_profiles.id
    SELECT data_type INTO nfc_profiles_id_type
    FROM information_schema.columns
    WHERE table_name = 'nfc_profiles' AND column_name = 'id';
    
    RAISE NOTICE '📊 Types détectés:';
    RAISE NOTICE '   analytics_events.profile_id: %', current_profile_type;
    RAISE NOTICE '   profiles.id: %', profiles_id_type;
    RAISE NOTICE '   nfc_profiles.id: %', nfc_profiles_id_type;
    
    -- Décider du type cible (TEXT car profiles et nfc_profiles sont en TEXT)
    IF current_profile_type = 'uuid' THEN
        ALTER TABLE analytics_events ALTER COLUMN profile_id TYPE TEXT USING profile_id::TEXT;
        RAISE NOTICE '✓ profile_id converti de UUID vers TEXT';
    ELSE
        RAISE NOTICE '✓ profile_id déjà en TEXT';
    END IF;
END $$;

-- ÉTAPE 6 : Convertir user_id si nécessaire
DO $$
DECLARE
    current_user_type TEXT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics_events' AND column_name = 'user_id'
    ) THEN
        SELECT data_type INTO current_user_type
        FROM information_schema.columns
        WHERE table_name = 'analytics_events' AND column_name = 'user_id';
        
        IF current_user_type = 'uuid' THEN
            ALTER TABLE analytics_events ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE '✓ user_id converti de UUID vers TEXT';
        ELSE
            RAISE NOTICE '✓ user_id déjà en TEXT';
        END IF;
    END IF;
END $$;

-- ÉTAPE 7 : Réactiver RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 8 : Créer la politique d'INSERTION PUBLIQUE
-- ✅ La plus importante : permet aux visiteurs anonymes de tracker
CREATE POLICY "analytics_insert_public" ON analytics_events
  FOR INSERT 
  WITH CHECK (true);

-- ÉTAPE 9 : Créer la politique de SELECT avec casts corrects
-- ✅ Utilise des casts explicites pour éviter les erreurs de type
CREATE POLICY "analytics_select_owner" ON analytics_events
  FOR SELECT 
  USING (
    -- L'utilisateur peut voir les analytics de ses propres profils
    -- Cast explicite pour garantir la compatibilité des types
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = analytics_events.profile_id
      AND profiles.user_id = auth.uid()::TEXT
    )
    OR
    -- L'utilisateur peut voir les analytics de ses propres cartes NFC
    EXISTS (
      SELECT 1 FROM nfc_profiles
      WHERE nfc_profiles.id = analytics_events.profile_id
      AND nfc_profiles.user_id = auth.uid()::TEXT
    )
  );

-- ÉTAPE 10 : Vérification et rapport
DO $$
DECLARE
    profile_id_type TEXT;
    user_id_type TEXT;
    policy_count INT;
    rls_enabled BOOLEAN;
BEGIN
    SELECT data_type INTO profile_id_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'profile_id';
    
    SELECT data_type INTO user_id_type
    FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'user_id';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'analytics_events';
    
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE tablename = 'analytics_events';
    
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ ANALYTICS_EVENTS CORRIGÉ !                    ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Type profile_id ......... %', profile_id_type;
    RAISE NOTICE 'Type user_id ............ %', COALESCE(user_id_type, 'N/A');
    RAISE NOTICE 'Politiques créées ....... %', policy_count;
    RAISE NOTICE 'RLS activé .............. %', CASE WHEN rls_enabled THEN 'OUI ✓' ELSE 'NON ✗' END;
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

-- ✅ Afficher les politiques
SELECT 
    policyname AS "Politique",
    cmd AS "Commande"
FROM pg_policies
WHERE tablename = 'analytics_events'
ORDER BY policyname;
