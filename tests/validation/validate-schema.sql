-- =====================================================
-- VALIDATION DU SCHÉMA DE BASE DE DONNÉES
-- =====================================================

-- 1. Vérifier l'existence des tables principales
SELECT 
    'Tables principales' as category,
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics') 
        THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics')
ORDER BY table_name;

-- 2. Vérifier les colonnes des tables
SELECT 
    'Colonnes profiles' as category,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 
    'Colonnes nfc_profiles' as category,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'nfc_profiles'
ORDER BY ordinal_position;

SELECT 
    'Colonnes orders' as category,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de clés étrangères
SELECT 
    'Contraintes FK' as category,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. Vérifier les contraintes CHECK
SELECT 
    'Contraintes CHECK' as category,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Vérifier les index
SELECT 
    'Index' as category,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics')
ORDER BY tablename, indexname;

-- 6. Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as category,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics')
ORDER BY tablename, policyname;

-- 7. Vérifier les fonctions RPC
SELECT 
    'Fonctions RPC' as category,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_order_stats', 'cleanup_expired_orders')
ORDER BY routine_name;

-- 8. Vérifier les triggers
SELECT 
    'Triggers' as category,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics')
ORDER BY event_object_table, trigger_name;

-- 9. Vérifier les données de test
SELECT 
    'Données profiles' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN profile_name IS NOT NULL THEN 1 END) as with_name,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email
FROM profiles;

SELECT 
    'Données nfc_profiles' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cards,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cards
FROM nfc_profiles;

SELECT 
    'Données orders' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders
FROM orders;

SELECT 
    'Données payment_methods' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_methods
FROM payment_methods;

SELECT 
    'Données contact_analytics' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN action_type = 'vcard_generated' THEN 1 END) as vcard_generated,
    COUNT(CASE WHEN action_type = 'vcard_downloaded' THEN 1 END) as vcard_downloaded,
    COUNT(CASE WHEN action_type = 'vcard_shared' THEN 1 END) as vcard_shared
FROM contact_analytics;

-- 10. Vérifier l'intégrité des données
SELECT 
    'Intégrité - Profils orphelins' as category,
    COUNT(*) as count
FROM nfc_profiles n
LEFT JOIN profiles p ON n.profile_id = p.id
WHERE n.profile_id IS NOT NULL AND p.id IS NULL;

SELECT 
    'Intégrité - Commandes orphelines' as category,
    COUNT(*) as count
FROM orders o
LEFT JOIN profiles p ON o.profile_id = p.id
WHERE o.profile_id IS NOT NULL AND p.id IS NULL;

-- 11. Résumé de validation
SELECT 
    'RÉSUMÉ VALIDATION' as category,
    'Vérification du schéma terminée' as message,
    NOW() as timestamp;
