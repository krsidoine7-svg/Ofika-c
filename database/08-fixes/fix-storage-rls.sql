-- ========================================
-- CONFIGURATION RLS POUR STORAGE
-- ========================================
-- Ce script configure les politiques RLS pour le bucket profile-images

-- 1. Vérifier l'existence du bucket
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'profile-images';

-- 2. Supprimer les anciennes politiques de storage (si elles existent)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;

-- 3. Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images', 
    true, -- Public bucket pour que les images soient accessibles
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 4. Configurer les politiques RLS pour le storage

-- Politique 1: Lecture des images publiques
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Politique 2: Lecture des images privées (pour le propriétaire)
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique 3: Upload d'images (pour les utilisateurs connectés)
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique 4: Mise à jour des images (pour le propriétaire)
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique 5: Suppression des images (pour le propriétaire)
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Vérifier la configuration
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as condition
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 6. Vérifier le bucket
SELECT name, public, created_at, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-images';

SELECT 'Storage RLS configuré avec succès!' as status;
