-- =====================================================
-- SCRIPT DE VÉRIFICATION - Migrations Templates Dynamiques
-- Date: 2025-01-05
-- À exécuter dans Supabase Studio après les migrations
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER QUE LES TABLES EXISTENT
-- =====================================================
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('template_schemas', 'profile_template_data')
ORDER BY table_name;
-- Devrait retourner 2 lignes

-- =====================================================
-- 2. VÉRIFIER LES TYPES DES COLONNES
-- =====================================================

-- template_schemas
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'template_schemas'
ORDER BY ordinal_position;
-- id devrait être: text
-- slug devrait être: character varying (50)

-- profile_template_data
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'profile_template_data'
  AND column_name IN ('id', 'profile_id', 'template_id')
ORDER BY ordinal_position;
-- Tous les 3 devraient être: text

-- =====================================================
-- 3. VÉRIFIER LES FOREIGN KEYS
-- =====================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profile_template_data'
ORDER BY tc.constraint_name;
-- Devrait retourner 2 contraintes:
--   - profile_template_data_profile_id_fkey -> profiles(id)
--   - profile_template_data_template_id_fkey -> template_schemas(id)

-- =====================================================
-- 4. VÉRIFIER LES INDEX
-- =====================================================
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('template_schemas', 'profile_template_data')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
-- Devrait montrer plusieurs index incluant idx_template_schemas_slug

-- =====================================================
-- 5. VÉRIFIER LES RLS POLICIES
-- =====================================================
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
WHERE tablename IN ('template_schemas', 'profile_template_data')
ORDER BY tablename, policyname;
-- Devrait retourner 6 policies au total
-- Vérifier que les policies contiennent ::text après auth.uid()

-- =====================================================
-- 6. COMPTER LES TEMPLATES
-- =====================================================
SELECT COUNT(*) as template_count 
FROM template_schemas 
WHERE is_active = true;
-- Devrait retourner: 8

-- =====================================================
-- 7. LISTER LES TEMPLATES
-- =====================================================
SELECT 
  id,
  name,
  slug,
  category,
  priority_label,
  jsonb_array_length(schema->'fields') as field_count,
  is_active
FROM template_schemas
ORDER BY name;
-- Devrait lister les 8 templates avec leurs champs

-- =====================================================
-- 8. VÉRIFIER LA FONCTION validate_template_schema
-- =====================================================
-- Test avec un schema valide
SELECT validate_template_schema('{"fields": []}'::jsonb) as test_valid;
-- Devrait retourner: true

-- Test avec un schema invalide (pas de fields)
SELECT validate_template_schema('{}'::jsonb) as test_invalid;
-- Devrait retourner: false

-- =====================================================
-- 9. VÉRIFIER LA FONCTION get_template_by_slug
-- =====================================================
SELECT * FROM get_template_by_slug('influencer');
-- Devrait retourner le template influenceur avec son schema

-- =====================================================
-- 10. TESTER LA CONTRAINTE UNIQUE SUR profile_id
-- =====================================================
-- Cette requête devrait vérifier que la contrainte existe
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'profile_template_data'::regclass
  AND contype = 'u';
-- Devrait montrer la contrainte unique sur profile_id

-- =====================================================
-- 11. VÉRIFIER LES TRIGGERS
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('template_schemas', 'profile_template_data')
ORDER BY event_object_table, trigger_name;
-- Devrait montrer les triggers update_updated_at

-- =====================================================
-- 12. TEST D'INTÉGRITÉ: Essayer d'insérer un template (devrait échouer si non admin)
-- =====================================================
-- ⚠️ Cette requête devrait échouer si vous n'êtes pas admin
-- Commentez si vous voulez juste vérifier la structure
/*
INSERT INTO template_schemas (name, slug, description, schema)
VALUES (
  'Test Template',
  'test-template',
  'Template de test',
  '{"fields": []}'::jsonb
);
-- Devrait échouer avec: new row violates row-level security policy
*/

-- =====================================================
-- 13. STATISTIQUES GLOBALES
-- =====================================================
SELECT 
  'template_schemas' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM template_schemas
UNION ALL
SELECT 
  'profile_template_data' as table_name,
  COUNT(*) as row_count,
  NULL as active_count
FROM profile_template_data;

-- =====================================================
-- 14. VÉRIFIER LA COMPATIBILITÉ DES TYPES avec profiles
-- =====================================================
-- Vérifier que profiles.id est bien TEXT
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('id', 'user_id')
ORDER BY ordinal_position;
-- Tous devraient être: text

-- =====================================================
-- ✅ RÉSULTAT ATTENDU
-- =====================================================
-- Si toutes les requêtes ci-dessus retournent les résultats attendus:
-- ✅ Les tables sont créées correctement
-- ✅ Les types sont compatibles (TEXT)
-- ✅ Les foreign keys fonctionnent
-- ✅ Les RLS policies sont en place
-- ✅ Les 8 templates sont chargés
-- ✅ Les fonctions sont créées
-- ✅ Les triggers sont actifs
-- 
-- Votre migration est COMPLÈTE et FONCTIONNELLE ! 🎉

-- =====================================================
-- 🧹 NETTOYAGE (Optionnel)
-- =====================================================
-- Si vous devez recommencer à zéro:
/*
DROP TABLE IF EXISTS profile_template_data CASCADE;
DROP TABLE IF EXISTS template_schemas CASCADE;
DROP FUNCTION IF EXISTS validate_template_schema(jsonb);
DROP FUNCTION IF EXISTS get_template_by_slug(VARCHAR);
DROP FUNCTION IF EXISTS migrate_profile_to_template_system(TEXT, VARCHAR);
DROP VIEW IF EXISTS v_templates_with_field_count;
*/
