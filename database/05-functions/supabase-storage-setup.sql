-- Script de configuration pour Supabase Storage
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket pour les images de profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer le bucket pour les designs de cartes
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-designs', 'card-designs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Créer le bucket pour les uploads temporaires
INSERT INTO storage.buckets (id, name, public)
VALUES ('temp-uploads', 'temp-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Politiques pour les images de profil

-- Lecture publique des images de profil
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Upload d'images de profil pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Mise à jour des images de profil par le propriétaire
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- Suppression des images de profil par le propriétaire
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

-- 5. Politiques pour les designs de cartes

-- Lecture publique des designs de cartes
CREATE POLICY "Public read access for card designs" ON storage.objects
FOR SELECT USING (bucket_id = 'card-designs');

-- Upload de designs de cartes pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload card designs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'card-designs' 
  AND auth.uid() IS NOT NULL
);

-- Mise à jour des designs de cartes par le propriétaire
CREATE POLICY "Users can update their own card designs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'card-designs' 
  AND auth.uid() IS NOT NULL
);

-- Suppression des designs de cartes par le propriétaire
CREATE POLICY "Users can delete their own card designs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'card-designs' 
  AND auth.uid() IS NOT NULL
);

-- 6. Politiques pour les uploads temporaires (privé)

-- Upload d'uploads temporaires pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload temp files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp-uploads' 
  AND auth.uid() IS NOT NULL
);

-- Lecture des uploads temporaires par le propriétaire uniquement
CREATE POLICY "Users can read their own temp files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid() IS NOT NULL
);

-- Suppression des uploads temporaires par le propriétaire
CREATE POLICY "Users can delete their own temp files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp-uploads' 
  AND auth.uid() IS NOT NULL
);

-- 7. Fonction pour nettoyer les uploads temporaires (optionnel)
CREATE OR REPLACE FUNCTION cleanup_temp_uploads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprimer les fichiers temporaires de plus de 24h
  DELETE FROM storage.objects 
  WHERE bucket_id = 'temp-uploads' 
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 8. Créer un trigger pour nettoyer automatiquement les uploads temporaires (optionnel)
-- Cette partie peut être commentée si vous préférez un nettoyage manuel
/*
CREATE OR REPLACE FUNCTION trigger_cleanup_temp_uploads()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cleanup_temp_uploads();
  RETURN NULL;
END;
$$;

CREATE TRIGGER cleanup_temp_uploads_trigger
  AFTER INSERT ON storage.objects
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_temp_uploads();
*/
