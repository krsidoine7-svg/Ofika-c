-- Migration UP: Création du bucket profile-images
-- Timestamp: 2024-12-19 10:00:00

-- Créer le bucket profile-images
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

-- Créer les politiques RLS pour le bucket
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
