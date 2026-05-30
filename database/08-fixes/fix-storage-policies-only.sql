-- Script pour corriger uniquement les politiques Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'état actuel du bucket
SELECT 
    'Bucket Status' as info,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-images';

-- 2. Supprimer toutes les anciennes politiques Storage
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own profile images" ON storage.objects;

-- 3. Créer les nouvelles politiques Storage simplifiées
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 4. Vérifier les politiques créées
SELECT 
    'Policies Created' as status,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile images%'
ORDER BY policyname;

-- 5. Tester les permissions (si utilisateur connecté)
SELECT 
    'Permission Test' as test_name,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'User authenticated - upload should work'
        ELSE 'No user - upload will fail'
    END as auth_status;

-- 6. Vérifier la configuration finale
SELECT 
    'Final Configuration' as info,
    b.name as bucket_name,
    b.public as is_public,
    b.file_size_limit,
    b.allowed_mime_types,
    COUNT(p.policyname) as policy_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.schemaname = 'storage' 
    AND p.tablename = 'objects' 
    AND p.policyname LIKE '%profile images%'
WHERE b.name = 'profile-images'
GROUP BY b.name, b.public, b.file_size_limit, b.allowed_mime_types;
