-- =====================================================
-- Script de vérification: État des profils
-- Description: Vérifier l'état de RLS et des profils
-- =====================================================

-- 1. Vérifier l'état de RLS sur les tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as rls_status
FROM pg_tables
LEFT JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'links', 'nfc_profiles', 'users')
ORDER BY tablename;

-- 2. Vérifier les politiques RLS existantes
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
  AND tablename IN ('profiles', 'links', 'nfc_profiles')
ORDER BY tablename, policyname;

-- 3. Vérifier les profils et leur statut
SELECT 
  id,
  name,
  username,
  custom_url,
  is_public,
  is_active,
  created_at,
  CASE 
    WHEN is_public = true AND is_active = true THEN '✅ Visible publiquement'
    WHEN is_public = false THEN '🔒 Privé'
    WHEN is_active = false THEN '⏸️ Inactif'
    ELSE '❓ État inconnu'
  END as status_display
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier les profils NFC
SELECT 
  id,
  profile_name,
  username,
  custom_url,
  status,
  created_at,
  CASE 
    WHEN status = 'active' THEN '✅ Actif'
    WHEN status = 'inactive' THEN '⏸️ Inactif'
    WHEN status = 'pending' THEN '⏳ En attente'
    ELSE '❓ État inconnu'
  END as status_display
FROM nfc_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Compter les profils par statut
SELECT 
  'Profiles Table' as source,
  COUNT(*) FILTER (WHERE is_public = true AND is_active = true) as "Publics et actifs",
  COUNT(*) FILTER (WHERE is_public = false) as "Privés",
  COUNT(*) FILTER (WHERE is_active = false) as "Inactifs",
  COUNT(*) as "Total"
FROM profiles
UNION ALL
SELECT 
  'NFC Profiles Table' as source,
  COUNT(*) FILTER (WHERE status = 'active') as "Publics et actifs",
  COUNT(*) FILTER (WHERE status = 'inactive') as "Privés",
  COUNT(*) FILTER (WHERE status = 'pending') as "Inactifs",
  COUNT(*) as "Total"
FROM nfc_profiles;

-- 6. Vérifier les colonnes manquantes
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'nfc_profiles')
  AND column_name IN ('is_public', 'is_active', 'username', 'custom_url', 'status')
ORDER BY table_name, column_name;
