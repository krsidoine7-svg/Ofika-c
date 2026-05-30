-- Migration DOWN: Suppression du bucket profile-images
-- Timestamp: 2024-12-19 10:00:00

-- Supprimer les politiques RLS
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;

-- Supprimer le bucket (ATTENTION: cela supprimera aussi tous les fichiers)
DELETE FROM storage.buckets WHERE name = 'profile-images';
