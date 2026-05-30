-- ========================================
-- SCRIPT DE CORRECTION RLS DÉFINITIF - VERSION CORRIGÉE
-- ========================================
-- Ce script résout définitivement l'erreur "new row violates row-level security policy"

-- 1. DIAGNOSTIC COMPLET
-- =====================

-- Vérifier le type de user_id dans la table profiles
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- Vérifier le type retourné par auth.uid()
SELECT 
    auth.uid() as auth_uid_value,
    pg_typeof(auth.uid()) as auth_uid_type;

-- Vérifier les politiques existantes
SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as condition
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 2. NETTOYAGE COMPLET
-- ====================

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Profiles are viewable by everyone when public" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "public_profiles_read" ON profiles;
DROP POLICY IF EXISTS "private_profiles_read" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- 3. CORRECTION DU TYPE DE COLONNE (si nécessaire)
-- ================================================

-- Vérifier si user_id est de type TEXT et le convertir en UUID si nécessaire
DO $$
BEGIN
    -- Vérifier le type actuel de user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
    ) THEN
        -- Convertir user_id de TEXT vers UUID
        ALTER TABLE profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
        RAISE NOTICE 'Colonne user_id convertie de TEXT vers UUID';
    ELSE
        RAISE NOTICE 'Colonne user_id est déjà de type UUID';
    END IF;
END $$;

-- 4. CRÉATION DES POLITIQUES RLS CORRIGÉES
-- ========================================

-- S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique 1: Lecture des profils publics (pour tous)
CREATE POLICY "profiles_public_read" ON profiles
FOR SELECT USING (is_public = true);

-- Politique 2: Lecture des profils privés (pour le propriétaire)
-- Utilisation de la conversion de type appropriée
CREATE POLICY "profiles_private_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Politique 3: Insertion de nouveaux profils (pour les utilisateurs connectés)
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Politique 4: Mise à jour des profils (pour le propriétaire)
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Politique 5: Suppression des profils (pour le propriétaire)
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. VÉRIFICATION FINALE
-- ======================

-- Vérifier que RLS est activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Lister les nouvelles politiques
SELECT 
    policyname,
    cmd as operation,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as condition
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;

-- Tester l'authentification
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as auth_uid_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No user logged in'
        ELSE 'User is logged in'
    END as auth_status;

-- 6. TEST DE FONCTIONNEMENT
-- =========================

-- Compter les profils accessibles (si utilisateur connecté)
-- Utilisation de la conversion de type appropriée
SELECT 
    'Profiles accessible to current user' as test_description,
    COUNT(*) as total_accessible_profiles,
    COUNT(CASE WHEN is_public = true THEN 1 END) as public_profiles,
    COUNT(CASE WHEN auth.uid()::text = user_id::text THEN 1 END) as own_profiles
FROM profiles;

-- Message de confirmation
SELECT 'Configuration RLS terminée avec succès!' as status;
