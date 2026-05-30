-- ========================================
-- ÉTAPE 5: CONFIGURATION DU STORAGE SUPABASE
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape configure les buckets de stockage pour les images

-- Créer le bucket pour les images de profil
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

-- Créer le bucket pour les designs de cartes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-designs',
  'card-designs', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supprimer les anciennes politiques de storage
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- POLITIQUES POUR LES IMAGES DE PROFIL
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

-- POLITIQUES POUR LES DESIGNS DE CARTES
-- Lecture publique pour les designs de cartes
CREATE POLICY "Public read access for card designs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'card-designs');

-- Upload de designs de cartes pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload card designs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Mise à jour des designs de cartes par le propriétaire
CREATE POLICY "Users can update their own card designs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression des designs de cartes par le propriétaire
CREATE POLICY "Users can delete their own card designs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Vérifier les buckets de storage
SELECT 
    'Storage Buckets' as status,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('profile-images', 'card-designs')
ORDER BY name;

SELECT 'Étape 5 terminée: Storage configuré avec succès!' as final_status;
