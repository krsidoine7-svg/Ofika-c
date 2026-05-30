-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- Configuration Storage Bucket
-- ========================================
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Bucket pour stocker les images et vidéos des avis clients

-- ========================================
-- CRÉATION DU BUCKET
-- ========================================

-- Créer le bucket pour les médias des avis (images et vidéos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media',
  'review-media',
  true, -- Public car les avis seront partagés
  10485760, -- 10MB max par fichier
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ========================================
-- POLITIQUES STORAGE
-- ========================================

-- Suppression des anciennes politiques (idempotence)
DROP POLICY IF EXISTS "review_media_read_public" ON storage.objects;
DROP POLICY IF EXISTS "review_media_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "review_media_update_owner" ON storage.objects;
DROP POLICY IF EXISTS "review_media_delete_owner" ON storage.objects;

-- LECTURE: Publique (tout le monde peut voir les médias partagés)
CREATE POLICY "review_media_read_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'review-media');

-- INSERTION: Publique pour permettre l'upload depuis le formulaire public
-- Note: On utilisera une validation côté API pour limiter les abus
CREATE POLICY "review_media_insert_public"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'review-media'
    AND (storage.foldername(name))[1] IN (
      'images',
      'videos',
      'temp' -- Dossier temporaire pour uploads en cours
    )
  );

-- MISE À JOUR: Seulement pour les utilisateurs authentifiés (propriétaires de liens)
CREATE POLICY "review_media_update_owner"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'review-media'
    -- Permet aux propriétaires de review_links de gérer les médias
    -- Note: La validation fine sera faite côté application
  );

-- SUPPRESSION: Seulement pour les utilisateurs authentifiés
CREATE POLICY "review_media_delete_owner"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'review-media'
  );

-- ========================================
-- FONCTION : Nettoyage des fichiers orphelins
-- ========================================

-- Fonction pour supprimer les médias non liés à un avis
-- (À exécuter périodiquement via un cron job)
CREATE OR REPLACE FUNCTION cleanup_orphan_review_media()
RETURNS TABLE(
  deleted_count INTEGER,
  deleted_files TEXT[]
) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_deleted_files TEXT[] := ARRAY[]::TEXT[];
  v_file RECORD;
BEGIN
  -- Trouver les fichiers dans review-media qui ne sont pas référencés
  FOR v_file IN
    SELECT o.name
    FROM storage.objects o
    WHERE o.bucket_id = 'review-media'
      AND NOT EXISTS (
        SELECT 1 FROM reviews r
        WHERE r.media_url LIKE '%' || o.name
      )
      -- Fichiers plus anciens que 24h (pour éviter de supprimer les uploads en cours)
      AND o.created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Supprimer le fichier
    DELETE FROM storage.objects
    WHERE bucket_id = 'review-media'
      AND name = v_file.name;
    
    v_deleted_count := v_deleted_count + 1;
    v_deleted_files := array_append(v_deleted_files, v_file.name);
  END LOOP;
  
  RETURN QUERY SELECT v_deleted_count, v_deleted_files;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphan_review_media IS 
  'Supprime les fichiers média non référencés par des avis (fichiers orphelins)';

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Vérifier que le bucket est créé
SELECT 
  'Bucket créé' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'review-media';

-- Vérifier les politiques du bucket
SELECT 
  'Policies Storage' as status,
  policyname,
  roles,
  cmd as operation,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE 'review_media%'
ORDER BY policyname;

-- Statistiques du bucket (nombre de fichiers)
SELECT 
  'Statistiques Bucket' as status,
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size')::BIGINT) as total_size
FROM storage.objects
WHERE bucket_id = 'review-media'
GROUP BY bucket_id;
