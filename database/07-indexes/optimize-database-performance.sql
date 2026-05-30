-- Script d'optimisation des performances de la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Analyser les statistiques de la base
SELECT 
    'Database Statistics' as analysis_type,
    pg_database_size(current_database()) as total_size_bytes,
    pg_size_pretty(pg_database_size(current_database())) as total_size_pretty;

-- 2. Analyser les tables les plus volumineuses
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 3. Analyser les index les plus volumineux
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

-- 4. Identifier les requêtes lentes (si pg_stat_statements est activé)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_time DESC 
LIMIT 10;

-- 5. Analyser les verrous et les blocages
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 6. Recommandations d'optimisation
SELECT 
    'Performance Recommendations' as category,
    '1. Add missing foreign key indexes' as recommendation,
    'Run fix-foreign-key-indexes.sql' as action
UNION ALL
SELECT 
    'Performance Recommendations',
    '2. Analyze unused indexes',
    'Run analyze-unused-indexes.sql and consider removing unused indexes'
UNION ALL
SELECT 
    'Performance Recommendations',
    '3. Update table statistics',
    'Run ANALYZE on frequently updated tables'
UNION ALL
SELECT 
    'Performance Recommendations',
    '4. Consider partitioning large tables',
    'If tables grow very large, consider partitioning by date or user_id'
UNION ALL
SELECT 
    'Performance Recommendations',
    '5. Monitor query performance',
    'Use pg_stat_statements to identify slow queries'
UNION ALL
SELECT 
    'Performance Recommendations',
    '6. Regular maintenance',
    'Schedule VACUUM and ANALYZE operations regularly';

-- 7. Mettre à jour les statistiques des tables principales
ANALYZE profiles;
ANALYZE links;
ANALYZE analytics_events;
ANALYZE orders;
ANALYZE cards;
ANALYZE dashboard_widgets;

-- 8. Vérifier la configuration PostgreSQL
SELECT 
    name,
    setting,
    unit,
    context,
    short_desc
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'effective_cache_size',
    'work_mem',
    'maintenance_work_mem',
    'random_page_cost',
    'seq_page_cost'
)
ORDER BY name;
