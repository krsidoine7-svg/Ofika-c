-- ============================================
-- POLITIQUES RLS POUR LE BUCKET profile-images
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent uploader" ON storage.objects;
DROP POLICY IF EXISTS "Images publiques accessibles" ON storage.objects;
DROP POLICY IF EXISTS "Utilisateurs peuvent uploader leurs images" ON storage.objects;
DROP POLICY IF EXISTS "Images publiques" ON storage.objects;
DROP POLICY IF EXISTS "Propriétaires peuvent supprimer" ON storage.objects;
DROP POLICY IF EXISTS "Propriétaires peuvent mettre à jour" ON storage.objects;

-- 2. Créer les nouvelles politiques pour le bucket profile-images

-- Politique INSERT : Utilisateurs authentifiés peuvent uploader
CREATE POLICY "Utilisateurs authentifiés peuvent uploader"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
);

-- Politique SELECT : Tout le monde peut voir les images (public)
CREATE POLICY "Images publiques accessibles"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'profile-images'
);

-- Politique UPDATE : Propriétaires peuvent mettre à jour leurs images
CREATE POLICY "Propriétaires peuvent mettre à jour"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique DELETE : Propriétaires peuvent supprimer leurs images
CREATE POLICY "Propriétaires peuvent supprimer"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Vérifier que les politiques sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%profile-images%' OR policyname LIKE '%Utilisateurs%' OR policyname LIKE '%Images%' OR policyname LIKE '%Propriétaires%';
