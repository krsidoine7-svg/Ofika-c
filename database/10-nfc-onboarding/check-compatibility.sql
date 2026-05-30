-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - VÉRIFICATION COMPATIBILITÉ
-- =====================================================

-- 1. Vérifier la structure de la table users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les tables NFC existantes
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%nfc%' OR table_name LIKE '%card%')
ORDER BY table_name;

-- 3. Vérifier les colonnes des tables NFC existantes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND (table_name LIKE '%nfc%' OR table_name LIKE '%card%')
ORDER BY table_name, ordinal_position;

-- 4. Vérifier les contraintes de clé étrangère existantes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name LIKE '%nfc%' OR tc.table_name LIKE '%card%')
ORDER BY tc.table_name, tc.constraint_name;

-- 5. Vérifier les fonctions existantes liées aux cartes
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%nfc%' OR routine_name LIKE '%card%')
ORDER BY routine_name;

-- 6. Vérifier les triggers existants
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
  AND (event_object_table LIKE '%nfc%' OR event_object_table LIKE '%card%')
ORDER BY event_object_table, trigger_name;

-- 7. Vérifier les politiques RLS existantes
SELECT 
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
  AND (tablename LIKE '%nfc%' OR tablename LIKE '%card%')
ORDER BY tablename, policyname;

-- 8. Vérifier les index existants
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND (tablename LIKE '%nfc%' OR tablename LIKE '%card%')
ORDER BY tablename, indexname;
