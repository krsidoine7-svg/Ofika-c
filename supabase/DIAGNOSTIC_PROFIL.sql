-- =====================================================
-- DIAGNOSTIC : Pourquoi le profil n'est pas trouvé ?
-- =====================================================

-- 1. Vérifier que RLS est bien activé
SELECT 
  'RLS Status' as check_name,
  tablename,
  CASE 
    WHEN c.relrowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE t.schemaname = 'public' 
  AND t.tablename IN ('profiles', 'nfc_profiles', 'links')
ORDER BY tablename;

-- 2. Compter les profils par statut
SELECT 
  '=== TABLE PROFILES ===' as section,
  COUNT(*) FILTER (WHERE is_public = true AND is_active = true) as "Publics et actifs",
  COUNT(*) FILTER (WHERE is_public = false) as "Privés",
  COUNT(*) FILTER (WHERE is_active = false) as "Inactifs",
  COUNT(*) FILTER (WHERE is_public IS NULL) as "is_public NULL",
  COUNT(*) FILTER (WHERE is_active IS NULL) as "is_active NULL",
  COUNT(*) as "Total"
FROM profiles;

-- 3. Lister TOUS les profils avec leurs attributs
SELECT 
  id,
  name,
  username,
  custom_url,
  is_public,
  is_active,
  CASE 
    WHEN is_public = true AND is_active = true THEN '✅ VISIBLE'
    WHEN is_public = false THEN '🔒 PRIVÉ'
    WHEN is_active = false THEN '⏸️ INACTIF'
    WHEN is_public IS NULL THEN '❌ is_public NULL'
    WHEN is_active IS NULL THEN '❌ is_active NULL'
    ELSE '❓ État inconnu'
  END as visibilite,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Vérifier les profils NFC
SELECT 
  '=== TABLE NFC_PROFILES ===' as section,
  COUNT(*) FILTER (WHERE status = 'active') as "Actifs",
  COUNT(*) FILTER (WHERE status = 'inactive') as "Inactifs",
  COUNT(*) FILTER (WHERE status IS NULL) as "Status NULL",
  COUNT(*) as "Total"
FROM nfc_profiles;

-- 5. Lister les profils NFC
SELECT 
  id,
  profile_name,
  username,
  custom_url,
  status,
  CASE 
    WHEN status = 'active' THEN '✅ VISIBLE'
    WHEN status = 'inactive' THEN '⏸️ INACTIF'
    ELSE '❌ Status NULL'
  END as visibilite,
  created_at
FROM nfc_profiles
ORDER BY created_at DESC;

-- 6. Vérifier si les colonnes social_links existent
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('social_links', 'whatsapp', 'facebook', 'instagram')
ORDER BY column_name;

-- 7. Vérifier les politiques RLS actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'nfc_profiles', 'links')
ORDER BY tablename, policyname;

-- 8. RECOMMANDATIONS
SELECT 
  '=== RECOMMANDATIONS ===' as section,
  CASE 
    WHEN (SELECT COUNT(*) FROM profiles WHERE is_public = true AND is_active = true) = 0 THEN
      '❌ PROBLÈME: Aucun profil public et actif. Exécutez: UPDATE profiles SET is_public = true, is_active = true;'
    WHEN (SELECT COUNT(*) FROM profiles WHERE username IS NOT NULL OR custom_url IS NOT NULL) = 0 THEN
      '❌ PROBLÈME: Aucun profil n''a de username ou custom_url. Vérifiez vos données.'
    ELSE
      '✅ Des profils publics existent. Vérifiez que l''URL correspond au username/custom_url.'
  END as conseil;

-- 9. Exemple d'URL à tester
SELECT 
  '=== URLs DISPONIBLES ===' as section,
  CONCAT('https://votre-domaine.com/', COALESCE(custom_url, username)) as url_a_tester,
  name as nom_profil,
  is_public,
  is_active
FROM profiles
WHERE (username IS NOT NULL OR custom_url IS NOT NULL)
  AND is_public = true 
  AND is_active = true
LIMIT 5;
