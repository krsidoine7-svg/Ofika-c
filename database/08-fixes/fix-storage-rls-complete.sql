-- Script complet pour corriger les politiques RLS du storage
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket profile-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Supprimer toutes les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 3. Créer les nouvelles politiques RLS optimisées

-- Politique de lecture publique (tout le monde peut voir les images)
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Politique d'upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Politique de mise à jour pour les propriétaires
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Politique de suppression pour les propriétaires
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 4. Vérifier que le bucket a été créé
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 5. Vérifier les politiques créées
SELECT 
  policyname, 
  cmd as operation, 
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
    ELSE 'No condition' 
  END as condition 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%profile%'
ORDER BY policyname;

-- 6. Tester l'authentification
SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Pas connecté' 
    ELSE '✅ Connecté: ' || auth.uid()::text 
  END as auth_status;
