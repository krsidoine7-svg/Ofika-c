-- Script pour vérifier les types de colonnes de la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les types de colonnes
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier spécifiquement le type de user_id
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- 3. Vérifier le type retourné par auth.uid()
SELECT 
    auth.uid() as auth_uid_type,
    pg_typeof(auth.uid()) as auth_uid_pg_type;

-- 4. Tester la comparaison avec conversion de type
SELECT 
    CASE 
        WHEN auth.uid()::text = user_id::text THEN 'Comparaison text OK'
        ELSE 'Comparaison text échouée'
    END as test_comparison_text,
    CASE 
        WHEN auth.uid() = user_id::uuid THEN 'Comparaison uuid OK'
        ELSE 'Comparaison uuid échouée'
    END as test_comparison_uuid
FROM profiles 
LIMIT 1;
