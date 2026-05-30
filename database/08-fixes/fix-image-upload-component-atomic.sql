-- ========================================
-- PATCH ATOMIQUE : Correction des politiques RLS pour l'upload d'images
-- ========================================
-- Ce script corrige les politiques RLS pour permettre l'upload d'images

-- 1. Vérifier l'état actuel des politiques RLS
SELECT 
    'Current RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 2. Supprimer toutes les anciennes politiques pour storage.objects
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- 3. Créer des politiques RLS simplifiées et fonctionnelles
-- Politique de lecture publique pour les images de profil
CREATE POLICY "profile_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "profile_images_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

-- Politique de mise à jour pour les propriétaires
CREATE POLICY "profile_images_owner_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

-- Politique de suppression pour les propriétaires
CREATE POLICY "profile_images_owner_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
);

-- 4. Vérifier que RLS est activé sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier les nouvelles politiques
SELECT 
    'New RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 6. Test d'upload simulé
DO $$
DECLARE
    test_user_id UUID;
    test_bucket_name TEXT := 'profile-images';
    test_file_path TEXT;
    test_file_content BYTEA;
BEGIN
    -- Récupérer un utilisateur de test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        test_file_path := test_user_id::text || '/test-image.jpg';
        test_file_content := '\x89504E470D0A1A0A'::bytea; -- PNG header minimal
        
        -- Tenter d'insérer un fichier de test
        INSERT INTO storage.objects (
            bucket_id,
            name,
            owner,
            metadata,
            path_tokens,
            version
        ) VALUES (
            test_bucket_name,
            test_file_path,
            test_user_id,
            '{"size": 100, "mimetype": "image/jpeg"}'::jsonb,
            ARRAY[test_user_id::text, 'test-image.jpg'],
            '1'
        );
        
        RAISE NOTICE '✅ TEST UPLOAD RÉUSSI - File Path: %', test_file_path;
        
        -- Nettoyer le fichier de test
        DELETE FROM storage.objects 
        WHERE bucket_id = test_bucket_name 
        AND name = test_file_path;
        
        RAISE NOTICE '✅ FICHIER DE TEST NETTOYÉ';
    ELSE
        RAISE NOTICE '⚠️ AUCUN UTILISATEUR TROUVÉ POUR LE TEST';
    END IF;
END $$;
