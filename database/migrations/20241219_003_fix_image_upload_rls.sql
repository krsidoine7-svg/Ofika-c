-- Migration UP: Correction des politiques RLS pour l'upload d'images
-- Timestamp: 2024-12-19 11:00:00

-- Supprimer toutes les anciennes politiques pour storage.objects
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Créer des politiques RLS simplifiées et fonctionnelles
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

-- S'assurer que RLS est activé
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
