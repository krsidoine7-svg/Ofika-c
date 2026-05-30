-- Script pour nettoyer les index non utilisés
-- ⚠️ ATTENTION: Exécutez d'abord analyze-unused-indexes.sql pour vérifier
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'utilisation des index avant suppression
SELECT 
    'BEFORE CLEANUP - Index Usage' as status,
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- 2. Sauvegarder les définitions d'index avant suppression
CREATE TABLE IF NOT EXISTS index_backup AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    pg_get_indexdef(indexrelid) as full_definition,
    now() as backup_date
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname IN (
    'idx_profiles_custom_url',
    'idx_analytics_event_type',
    'idx_orders_user',
    'idx_orders_status',
    'idx_dashboard_widgets_user',
    'idx_profiles_type_active',
    'idx_links_position',
    'idx_cards_user',
    'idx_cards_unique_code'
);

-- 3. Supprimer les index non utilisés (COMMENTÉS POUR SÉCURITÉ)
-- Décommentez seulement les index que vous êtes sûr de vouloir supprimer

-- DROP INDEX IF EXISTS idx_profiles_custom_url;
-- DROP INDEX IF EXISTS idx_analytics_event_type;
-- DROP INDEX IF EXISTS idx_orders_user;
-- DROP INDEX IF EXISTS idx_orders_status;
-- DROP INDEX IF EXISTS idx_dashboard_widgets_user;
-- DROP INDEX IF EXISTS idx_profiles_type_active;
-- DROP INDEX IF EXISTS idx_links_position;
-- DROP INDEX IF EXISTS idx_cards_user;
-- DROP INDEX IF EXISTS idx_cards_unique_code;

-- 4. Vérifier l'espace libéré
SELECT 
    'AFTER CLEANUP - Space Analysis' as status,
    pg_database_size(current_database()) as total_size_bytes,
    pg_size_pretty(pg_database_size(current_database())) as total_size_pretty;

-- 5. Script de restauration (au cas où)
SELECT 
    'RESTORATION SCRIPT' as info,
    'To restore an index, run:' as instruction,
    'CREATE INDEX ' || indexname || ' ON ' || tablename || ' ' || 
    substring(indexdef from position('(' in indexdef)) as restore_command
FROM index_backup
ORDER BY tablename, indexname;

-- 6. Recommandations de sécurité
SELECT 
    'SAFETY RECOMMENDATIONS' as category,
    '1. Test in development first' as recommendation
UNION ALL
SELECT 
    'SAFETY RECOMMENDATIONS',
    '2. Monitor application performance after cleanup'
UNION ALL
SELECT 
    'SAFETY RECOMMENDATIONS',
    '3. Keep index_backup table for 30 days'
UNION ALL
SELECT 
    'SAFETY RECOMMENDATIONS',
    '4. Recreate indexes if performance degrades'
UNION ALL
SELECT 
    'SAFETY RECOMMENDATIONS',
    '5. Consider keeping indexes for future features';

-- 7. Vérifier les contraintes après suppression
SELECT 
    'CONSTRAINT CHECK' as status,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_name;
