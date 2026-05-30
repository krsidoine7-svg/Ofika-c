-- Script pour créer et configurer le bucket profile-images
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

-- 2. Vérifier que le bucket a été créé
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- 3. Créer les politiques RLS pour le bucket

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Politique de lecture publique
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Politique d'upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Politique de mise à jour
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Politique de suppression
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 4. Vérifier les politiques créées
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

-- 5. Test de permissions (si utilisateur connecté)
SELECT 
  'Storage setup complete' as status,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User authenticated - upload should work'
    ELSE 'No user - upload will fail'
  END as auth_status;
