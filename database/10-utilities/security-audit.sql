-- Script d'audit de sécurité complet
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier RLS sur toutes les tables publiques
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS activé'
        ELSE '❌ RLS désactivé - CRITIQUE'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- 2. Vérifier les politiques RLS par table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 3. Vérifier les fonctions avec search_path mutable
SELECT 
    routine_name,
    routine_type,
    security_type,
    search_path,
    CASE 
        WHEN search_path IS NULL THEN '❌ Search path mutable'
        ELSE '✅ Search path sécurisé'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 4. Vérifier les contraintes d'unicité
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Vérifier les index de sécurité
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND (indexdef LIKE '%UNIQUE%' OR indexdef LIKE '%PRIMARY KEY%')
ORDER BY tablename, indexname;

-- 6. Vérifier les triggers de sécurité
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. Vérifier les permissions sur les tables
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 8. Résumé de sécurité
WITH security_summary AS (
    SELECT 
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION' AND search_path IS NULL) as functions_without_search_path,
        (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') as total_functions
)
SELECT 
    total_tables,
    tables_with_rls,
    ROUND((tables_with_rls::float / total_tables * 100), 2) as rls_coverage_percent,
    total_policies,
    total_functions,
    functions_without_search_path,
    CASE 
        WHEN tables_with_rls = total_tables AND functions_without_search_path = 0 THEN '✅ Sécurité optimale'
        WHEN tables_with_rls = total_tables AND functions_without_search_path > 0 THEN '⚠️ RLS OK, fonctions à corriger'
        WHEN tables_with_rls < total_tables AND functions_without_search_path = 0 THEN '⚠️ Fonctions OK, RLS à corriger'
        ELSE '❌ Sécurité insuffisante'
    END as security_status
FROM security_summary;
