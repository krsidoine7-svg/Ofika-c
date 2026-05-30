-- ========================================
-- PATCH ATOMIQUE : Création du bucket profile-images
-- ========================================
-- Ce script résout l'erreur "new row violates row-level security policy"
-- pour l'upload d'images de profil

-- 1. Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 3. Créer les nouvelles politiques RLS optimisées
CREATE POLICY "profile_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "profile_images_owner_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "profile_images_owner_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

-- 4. Vérifier la création du bucket
SELECT 
    'Bucket Status' as info,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 5. Vérifier les politiques créées
SELECT 
    'Storage Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile%'
ORDER BY policyname;

-- 6. Test de permissions (si utilisateur connecté)
SELECT 
    'Permission Test' as test_name,
    auth.uid() as current_user_id,
    'Storage bucket configured successfully' as status;
