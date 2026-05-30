-- Script pour vérifier les contraintes d'unicité sur la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier toutes les contraintes d'unicité
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;

-- 2. Vérifier les index uniques
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
AND indexdef LIKE '%UNIQUE%';

-- 3. Vérifier les valeurs en doublon dans custom_url
SELECT 
    custom_url,
    COUNT(*) as count,
    array_agg(id) as profile_ids
FROM profiles 
WHERE custom_url IS NOT NULL 
AND custom_url != ''
GROUP BY custom_url
HAVING COUNT(*) > 1;

-- 4. Vérifier les valeurs en doublon dans username
SELECT 
    username,
    COUNT(*) as count,
    array_agg(id) as profile_ids
FROM profiles 
WHERE username IS NOT NULL 
AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;

-- 5. Lister toutes les custom_url existantes
SELECT 
    id,
    name,
    custom_url,
    username,
    is_active,
    created_at
FROM profiles 
WHERE custom_url IS NOT NULL 
AND custom_url != ''
ORDER BY custom_url;
