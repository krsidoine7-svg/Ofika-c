-- Script de vérification des politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que RLS est activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 2. Lister toutes les politiques actuelles
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles,
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

-- 3. Vérifier les types de colonnes
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('user_id', 'is_public')
ORDER BY column_name;

-- 4. Tester l'authentification
SELECT 
    auth.uid() as current_user_id,
    pg_typeof(auth.uid()) as auth_uid_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No user logged in'
        ELSE 'User is logged in'
    END as auth_status;

-- 5. Compter les profils accessibles (si utilisateur connecté)
SELECT 
    'Profiles accessible to current user' as test_description,
    COUNT(*) as total_accessible_profiles,
    COUNT(CASE WHEN is_public = true THEN 1 END) as public_profiles,
    COUNT(CASE WHEN auth.uid()::text = user_id THEN 1 END) as own_profiles
FROM profiles;
