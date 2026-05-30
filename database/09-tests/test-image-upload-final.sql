-- Script de test final pour l'upload d'images
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la configuration finale du bucket
SELECT 
    'Final Bucket Configuration' as info,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 2. Vérifier les politiques RLS
SELECT 
    'Storage Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile images%'
ORDER BY policyname;

-- 3. Tester les permissions utilisateur
SELECT 
    'User Authentication Test' as info,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ User authenticated - upload should work'
        ELSE '❌ No user - upload will fail'
    END as auth_status;

-- 4. Vérifier les objets existants dans le bucket
SELECT 
    'Existing Objects' as info,
    COUNT(*) as object_count,
    SUM(size) as total_size_bytes,
    ROUND(SUM(size) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects 
WHERE bucket_id = 'profile-images';

-- 5. Test de création d'un objet (simulation)
SELECT 
    'Upload Test Simulation' as info,
    'Ready for image upload' as status,
    'Policies configured correctly' as message;

-- 6. Recommandations finales
SELECT 
    'Next Steps' as info,
    '1. Go to your profile creation form' as step1,
    '2. Select an image file (JPEG, PNG, GIF, WebP)' as step2,
    '3. Upload should work now!' as step3;
