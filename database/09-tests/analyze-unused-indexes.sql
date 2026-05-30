-- Script pour analyser les index non utilisés
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'utilisation des index
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'RARELY_USED'
        ELSE 'ACTIVELY_USED'
    END as usage_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, tablename, indexname;

-- 2. Identifier les index potentiellement inutiles
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    'Consider removing if not needed' as recommendation
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- 3. Vérifier les index sur les tables spécifiques mentionnées
SELECT 
    i.schemaname,
    i.tablename,
    i.indexname,
    i.idx_scan,
    i.idx_tup_read,
    i.idx_tup_fetch,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as size
FROM pg_stat_user_indexes i
WHERE i.schemaname = 'public'
AND i.tablename IN (
    'profiles', 
    'analytics_events', 
    'orders', 
    'dashboard_widgets', 
    'links', 
    'cards'
)
ORDER BY i.tablename, i.idx_scan ASC;

-- 4. Analyser les requêtes qui pourraient utiliser ces index
-- (Ces requêtes simulent l'usage typique des index)

-- Test pour idx_profiles_custom_url
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM profiles 
WHERE custom_url = 'test-url';

-- Test pour idx_profiles_type_active
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM profiles 
WHERE profile_type = 'personal' AND is_active = true;

-- Test pour idx_analytics_event_type
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM analytics_events 
WHERE event_type = 'page_view';

-- Test pour idx_orders_user
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Test pour idx_orders_status
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE status = 'pending';

-- Test pour idx_links_position
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM links 
WHERE position = 1;

-- Test pour idx_cards_user
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM cards 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Test pour idx_cards_unique_code
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM cards 
WHERE unique_code = 'TEST123';

-- 5. Recommandations pour chaque index non utilisé
SELECT 
    'idx_profiles_custom_url' as index_name,
    'Used for custom URL lookups' as purpose,
    'Keep if custom URLs are used for public profiles' as recommendation
UNION ALL
SELECT 
    'idx_profiles_type_active' as index_name,
    'Used for filtering by type and active status' as purpose,
    'Keep if you filter profiles by type and status' as recommendation
UNION ALL
SELECT 
    'idx_analytics_event_type' as index_name,
    'Used for analytics queries by event type' as purpose,
    'Keep if you run analytics reports' as recommendation
UNION ALL
SELECT 
    'idx_orders_user' as index_name,
    'Used for user order history' as purpose,
    'Keep if you show user order history' as recommendation
UNION ALL
SELECT 
    'idx_orders_status' as index_name,
    'Used for filtering orders by status' as purpose,
    'Keep if you filter orders by status' as recommendation
UNION ALL
SELECT 
    'idx_links_position' as index_name,
    'Used for ordering links by position' as purpose,
    'Keep if you order links by position' as recommendation
UNION ALL
SELECT 
    'idx_cards_user' as index_name,
    'Used for user card management' as purpose,
    'Keep if you show user cards' as recommendation
UNION ALL
SELECT 
    'idx_cards_unique_code' as index_name,
    'Used for card code lookups' as purpose,
    'Keep if cards are accessed by unique code' as recommendation;
