-- ========================================
-- SCRIPT DE TEST COMPLET - OFIKA
-- ========================================
-- Ce script teste que toutes les corrections RLS et Storage fonctionnent
-- À exécuter dans l'éditeur SQL de Supabase APRÈS les scripts de correction

-- 1. TEST DES POLITIQUES RLS PROFILES
-- ===================================

-- Vérifier que RLS est activé sur profiles
SELECT 
    'RLS Profiles Status' as test,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Compter les politiques RLS pour profiles
SELECT 
    'Profiles Policies Count' as test,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ SUFFICIENT POLICIES'
        ELSE '❌ INSUFFICIENT POLICIES'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. TEST DES POLITIQUES STORAGE
-- ==============================

-- Vérifier que le bucket profile-images existe
SELECT 
    'Storage Bucket Status' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ BUCKET EXISTS'
        ELSE '❌ BUCKET MISSING'
    END as status
FROM storage.buckets 
WHERE name = 'profile-images';

-- Vérifier la configuration du bucket
SELECT 
    'Bucket Configuration' as test,
    name,
    public,
    file_size_limit,
    CASE 
        WHEN public = true AND file_size_limit = 5242880 THEN '✅ PROPERLY CONFIGURED'
        ELSE '❌ MISCONFIGURED'
    END as status
FROM storage.buckets 
WHERE name = 'profile-images';

-- Compter les politiques Storage
SELECT 
    'Storage Policies Count' as test,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ SUFFICIENT POLICIES'
        ELSE '❌ INSUFFICIENT POLICIES'
    END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%profile%';

-- 3. TEST DE PERMISSIONS UTILISATEUR
-- ==================================

-- Vérifier l'utilisateur actuel
SELECT 
    'Current User' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ USER AUTHENTICATED'
        ELSE '❌ USER NOT AUTHENTICATED'
    END as status,
    auth.uid() as user_id;

-- 4. TEST DE CRÉATION DE PROFIL (si utilisateur connecté)
-- ======================================================

-- Tenter de créer un profil de test (sera supprimé après)
DO $$
DECLARE
    test_profile_id UUID;
    current_user_id UUID;
BEGIN
    -- Récupérer l'ID utilisateur actuel
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Tenter de créer un profil de test
        INSERT INTO profiles (user_id, profile_type, name, bio, is_public)
        VALUES (current_user_id, 'personal', 'Test Profile', 'Test bio', false)
        RETURNING id INTO test_profile_id;
        
        -- Vérifier que le profil a été créé
        IF test_profile_id IS NOT NULL THEN
            RAISE NOTICE '✅ PROFILE CREATION TEST PASSED - Profile ID: %', test_profile_id;
            
            -- Supprimer le profil de test
            DELETE FROM profiles WHERE id = test_profile_id;
            RAISE NOTICE '✅ TEST PROFILE CLEANED UP';
        ELSE
            RAISE NOTICE '❌ PROFILE CREATION TEST FAILED';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ SKIPPING PROFILE CREATION TEST - No authenticated user';
    END IF;
END $$;

-- 5. RÉSUMÉ FINAL
-- ===============

SELECT 
    'FINAL SUMMARY' as section,
    'All tests completed. Check the results above.' as message,
    'If all tests show ✅, your Ofika setup is working correctly!' as next_step;

-- 6. INSTRUCTIONS POUR L'UTILISATEUR
-- ==================================

SELECT 
    'NEXT STEPS' as section,
    '1. Configure your .env.local file with Supabase credentials' as step_1,
    '2. Run: npm run dev' as step_2,
    '3. Test profile creation at /dashboard/profiles/new' as step_3,
    '4. Test image upload functionality' as step_4;
