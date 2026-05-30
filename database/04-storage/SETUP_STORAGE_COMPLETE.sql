-- Script complet pour configurer le storage Supabase
-- Copiez et collez ce script dans l'éditeur SQL de Supabase

-- 1. Créer le bucket profile-images s'il n'existe pas
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

-- 2. Supprimer TOUTES les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 3. Créer les nouvelles politiques RLS avec la structure de dossiers
-- Lecture publique pour toutes les images dans le bucket profile-images
CREATE POLICY "Public read access for profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Upload pour les utilisateurs authentifiés dans leur dossier
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Mise à jour pour les utilisateurs authentifiés de leurs propres fichiers
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression pour les utilisateurs authentifiés de leurs propres fichiers
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Vérifier la configuration
SELECT 'Configuration terminée !' as status;

-- 5. Vérifier le bucket
SELECT name, public, created_at, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'profile-images';

-- 6. Vérifier les politiques créées
SELECT policyname, cmd as operation, 
CASE 
  WHEN qual IS NOT NULL THEN 'USING: ' || qual 
  WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
  ELSE 'No condition' 
END as condition
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%profile images%'
ORDER BY policyname;
