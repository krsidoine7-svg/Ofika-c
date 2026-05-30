-- Migration DOWN: Rollback des politiques RLS pour l'upload d'images
-- Timestamp: 2024-12-19 11:00:00

-- Supprimer les nouvelles politiques
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
