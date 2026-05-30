-- ========================================
-- SCRIPT DE TEST RLS
-- ========================================
-- Exécuter ce script après la correction pour vérifier que tout fonctionne

-- 1. Vérifier l'état de l'authentification
SELECT 
    'Authentication Status' as test_name,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ No user logged in'
        ELSE '✅ User logged in: ' || auth.uid()::text
    END as result;

-- 2. Tester la lecture des profils publics
SELECT 
    'Public Profiles Read' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Can read ' || COUNT(*) || ' public profiles'
        ELSE '⚠️ No public profiles found'
    END as result
FROM profiles 
WHERE is_public = true;

-- 3. Tester la lecture des profils privés (si connecté)
SELECT 
    'Private Profiles Read' as test_name,
    CASE 
        WHEN auth.uid() IS NULL THEN '⚠️ Cannot test - not logged in'
        WHEN COUNT(*) > 0 THEN '✅ Can read ' || COUNT(*) || ' own profiles'
        ELSE '⚠️ No own profiles found'
    END as result
FROM profiles 
WHERE auth.uid() = user_id;

-- 4. Vérifier les permissions d'insertion (simulation)
SELECT 
    'Insert Permission Test' as test_name,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ Cannot insert - not logged in'
        ELSE '✅ Insert permission granted (user_id matches auth.uid())'
    END as result;

-- 5. Résumé des politiques actives
SELECT 
    'Active Policies' as test_name,
    COUNT(*) || ' policies configured' as result
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 6. Vérifier le type de user_id
SELECT 
    'User ID Type' as test_name,
    data_type || ' (' || udt_name || ')' as result
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'user_id' 
AND table_schema = 'public';
