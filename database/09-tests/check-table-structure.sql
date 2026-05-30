-- Script pour vérifier la structure actuelle de la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure complète de la table
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier spécifiquement les colonnes qui pourraient être limitées
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND character_maximum_length IS NOT NULL
ORDER BY character_maximum_length;

-- 3. Vérifier les contraintes de la table
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public';
