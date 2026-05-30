-- Script de diagnostic pour les problèmes Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'état du bucket profile-images
SELECT 
    'Bucket Analysis' as section,
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 2. Vérifier les politiques Storage existantes
SELECT 
    'Existing Policies' as section,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;

-- 3. Vérifier les permissions utilisateur
SELECT 
    'User Permissions' as section,
    auth.uid() as user_id,
    auth.role() as user_role,
    'Current user info' as description;

-- 4. Vérifier les objets dans le bucket
SELECT 
    'Objects in Bucket' as section,
    name,
    bucket_id,
    created_at,
    size
FROM storage.objects 
WHERE bucket_id = 'profile-images'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Tester une requête simple sur storage.objects
SELECT 
    'Storage Access Test' as section,
    COUNT(*) as object_count
FROM storage.objects 
WHERE bucket_id = 'profile-images';

-- 6. Vérifier les erreurs récentes (si disponibles)
SELECT 
    'Recent Errors' as section,
    'Check Supabase Logs for Storage errors' as message,
    'Go to Logs > Storage in Supabase Dashboard' as action;
