-- =====================================================
-- SCRIPT DE VÉRIFICATION : Setup Onboarding Phase 1-2
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. VÉRIFIER LES TABLES
SELECT 
  '🗃️  TABLES' as check_category,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ PASS'
    ELSE '❌ FAIL - ' || COUNT(*) || ' tables trouvées (attendu: 4)'
  END as status,
  STRING_AGG(table_name, ', ') as details
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');

-- 2. VÉRIFIER RLS (Row Level Security)
SELECT 
  '🔒 RLS' as check_category,
  CASE 
    WHEN COUNT(*) = 4 AND MIN(rowsecurity::int) = 1 THEN '✅ PASS'
    ELSE '❌ FAIL - RLS non activé sur toutes les tables'
  END as status,
  STRING_AGG(tablename || ': ' || rowsecurity::text, ', ') as details
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');

-- 3. VÉRIFIER LES FONCTIONS SQL
SELECT 
  '⚙️  FONCTIONS' as check_category,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS'
    ELSE '❌ FAIL - ' || COUNT(*) || ' fonctions trouvées (attendu: 3+)'
  END as status,
  STRING_AGG(proname, ', ') as details
FROM pg_proc 
WHERE proname IN ('cleanup_expired_pending_creations', 'generate_order_number', 'calculate_nfc_card_price');

-- 4. VÉRIFIER LES INDEX
SELECT 
  '📊 INDEX' as check_category,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASS'
    ELSE '⚠️  WARNING - Peu d\'index (' || COUNT(*) || ')'
  END as status,
  COUNT(*)::text || ' index créés' as details
FROM pg_indexes 
WHERE tablename IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');

-- 5. VÉRIFIER LES POLITIQUES RLS
SELECT 
  '🛡️  POLITIQUES RLS' as check_category,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ PASS'
    ELSE '❌ FAIL - ' || COUNT(*) || ' politiques (attendu: 8+)'
  END as status,
  COUNT(*)::text || ' politiques actives' as details
FROM pg_policies 
WHERE tablename IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');

-- 6. TESTER LA FONCTION generate_order_number
SELECT 
  '🔢 TEST: generate_order_number' as check_category,
  CASE 
    WHEN generate_order_number() ~ '^ORD-\d{4}-\d{6}$' THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  generate_order_number() as details;

-- 7. TESTER LA FONCTION calculate_nfc_card_price
SELECT 
  '💰 TEST: calculate_nfc_card_price' as check_category,
  CASE 
    WHEN (calculate_nfc_card_price('design-classic', 1, 'FR')->>'total_cents')::int > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  calculate_nfc_card_price('design-classic', 1, 'FR')->>'total_cents' || ' centimes' as details;

-- 8. TESTER INSERTION pending_creations
INSERT INTO pending_creations (session_id, type, payload, step_completed)
VALUES ('verify-test-001', 'public_page', '{"test": true}'::jsonb, 1);

SELECT 
  '💾 TEST: INSERT pending_creations' as check_category,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  'Insertion réussie, ID: ' || id as details
FROM pending_creations 
WHERE session_id = 'verify-test-001';

-- Nettoyer le test
DELETE FROM pending_creations WHERE session_id = 'verify-test-001';

-- 9. VÉRIFIER LES TRIGGERS
SELECT 
  '⚡ TRIGGERS' as check_category,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS'
    ELSE '⚠️  WARNING - ' || COUNT(*) || ' triggers'
  END as status,
  STRING_AGG(trigger_name, ', ') as details
FROM information_schema.triggers 
WHERE event_object_table IN ('nfc_cards', 'orders', 'onboarding_sessions')
AND trigger_name LIKE '%updated_at%';

-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

SELECT 
  '🎯 RÉSUMÉ' as summary,
  '✅ Si tous les checks sont PASS, la Phase 1-2 est validée !' as message;

-- Lister les tables avec leur nombre de colonnes
SELECT 
  table_name,
  COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions')
GROUP BY table_name
ORDER BY table_name;
