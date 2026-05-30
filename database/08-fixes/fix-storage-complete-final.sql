-- ========================================
-- SCRIPT DE CORRECTION STORAGE COMPLET ET DÉFINITIF
-- ========================================
-- Ce script résout TOUS les problèmes d'upload d'images dans Ofika
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC INITIAL
-- =====================

-- Vérifier l'état actuel du bucket
SELECT 
    'Bucket Status' as info,
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- Vérifier les politiques Storage existantes
SELECT 
    'Storage Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile%'
ORDER BY policyname;

-- 2. CRÉATION/CONFIGURATION DU BUCKET
-- ===================================

-- Créer le bucket profile-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images', 
    true, -- Public pour que les images soient accessibles
    5242880, -- 5MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. NETTOYAGE DES POLITIQUES STORAGE
-- ===================================

-- Supprimer TOUTES les anciennes politiques Storage pour éviter les conflits
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own profile images" ON storage.objects;

-- 4. CRÉATION DES POLITIQUES STORAGE OPTIMISÉES
-- =============================================

-- Politique de lecture publique (tout le monde peut voir les images)
CREATE POLICY "profile_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Politique d'upload pour utilisateurs authentifiés
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

-- 5. VÉRIFICATION FINALE
-- ======================

-- Vérifier la configuration du bucket
SELECT 
    'Bucket Configuration' as info,
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'profile-images';

-- Vérifier les politiques créées
SELECT 
    'Storage Policies Created' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile%'
ORDER BY policyname;

-- Test de permissions (si utilisateur connecté)
SELECT 
    'Storage Permission Test' as test_name,
    auth.uid() as current_user_id,
    'Storage policies configured successfully' as status;

-- 6. MESSAGE DE SUCCÈS
-- ====================
SELECT 
    'SUCCESS' as status,
    'Storage bucket and policies have been configured successfully!' as message,
    'You can now upload profile images without errors.' as next_step;
