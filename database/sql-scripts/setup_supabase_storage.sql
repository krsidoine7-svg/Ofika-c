-- =====================================================
-- CONFIGURATION SUPABASE STORAGE POUR NFC ASSETS
-- =====================================================

-- 1. Créer le bucket nfc-assets (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('nfc-assets', 'nfc-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique : Lecture publique (tout le monde peut voir les images)
CREATE POLICY "Public read access for nfc-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nfc-assets');

-- 3. Politique : Upload pour utilisateurs authentifiés (dans leur propre dossier)
CREATE POLICY "Authenticated users can upload to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Politique : Mise à jour par le propriétaire
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Politique : Suppression par le propriétaire
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ✅ Configuration terminée !
