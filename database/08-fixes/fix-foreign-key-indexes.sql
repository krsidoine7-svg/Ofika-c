-- Script pour corriger les clés étrangères non indexées
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer un index pour analytics_events.user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
ON analytics_events (user_id);

-- 2. Créer un index pour orders.profile_id
CREATE INDEX IF NOT EXISTS idx_orders_profile_id 
ON orders (profile_id);

-- 3. Vérifier les clés étrangères existantes
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Vérifier les index existants
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('analytics_events', 'orders')
ORDER BY tablename, indexname;

-- 5. Analyser les performances des requêtes
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM analytics_events 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE profile_id = '00000000-0000-0000-0000-000000000000';
