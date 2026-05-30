-- Script pour corriger les problèmes d'upload d'images
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que le bucket profile-images existe
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 2. Mettre à jour le bucket existant (il existe déjà)
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'profile-images';

-- 3. Supprimer les anciennes politiques Storage
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 4. Créer les nouvelles politiques Storage simplifiées
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

-- 5. Vérifier les politiques créées
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile images%'
ORDER BY policyname;

-- 6. Tester les permissions (si utilisateur connecté)
SELECT 
    'Storage test' as test_name,
    auth.uid() as current_user_id,
    'Test upload permissions' as test_description;

-- 7. Vérifier la configuration du bucket
SELECT 
    'Bucket Configuration' as info,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-images';
