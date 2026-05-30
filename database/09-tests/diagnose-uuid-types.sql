-- Script de diagnostic pour identifier les types UUID
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier le type de la colonne user_id
SELECT 
    column_name,
    data_type,
    udt_name,
    pg_typeof(user_id) as actual_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- 2. Vérifier le type retourné par auth.uid()
SELECT 
    auth.uid() as auth_uid_value,
    pg_typeof(auth.uid()) as auth_uid_type;

-- 3. Tester différentes conversions
SELECT 
    'Conversion auth.uid()::uuid' as conversion_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'auth.uid() is NULL'
        ELSE 'auth.uid()::uuid works'
    END as result
UNION ALL
SELECT 
    'Conversion auth.uid()::text' as conversion_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'auth.uid() is NULL'
        ELSE 'auth.uid()::text works'
    END as result;

-- 4. Vérifier s'il y a des données dans la table
SELECT 
    COUNT(*) as total_profiles,
    COUNT(user_id) as profiles_with_user_id,
    pg_typeof(user_id) as user_id_type
FROM profiles;

-- 5. Tester la comparaison avec un exemple de données
SELECT 
    user_id,
    pg_typeof(user_id) as user_id_type,
    auth.uid() as current_auth_uid,
    pg_typeof(auth.uid()) as auth_uid_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'No user logged in'
        WHEN auth.uid()::text = user_id::text THEN 'Text comparison works'
        WHEN auth.uid()::uuid = user_id::uuid THEN 'UUID comparison works'
        ELSE 'No comparison works'
    END as comparison_test
FROM profiles 
LIMIT 1;
