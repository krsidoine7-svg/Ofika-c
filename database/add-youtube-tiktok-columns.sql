-- Migration pour ajouter les colonnes YouTube et TikTok aux tables profiles et nfc_profiles
-- Date: $(date)
-- Description: Ajoute les champs youtube et tiktok pour les réseaux sociaux

-- Ajouter les colonnes à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Ajouter les colonnes à la table nfc_profiles
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN profiles.youtube IS 'URL du profil YouTube de l''utilisateur';
COMMENT ON COLUMN profiles.tiktok IS 'URL du profil TikTok de l''utilisateur';
COMMENT ON COLUMN nfc_profiles.youtube IS 'URL du profil YouTube de l''utilisateur';
COMMENT ON COLUMN nfc_profiles.tiktok IS 'URL du profil TikTok de l''utilisateur';

-- Créer des index pour améliorer les performances de recherche (optionnel)
CREATE INDEX IF NOT EXISTS idx_profiles_youtube ON profiles(youtube) WHERE youtube IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_tiktok ON profiles(tiktok) WHERE tiktok IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_youtube ON nfc_profiles(youtube) WHERE youtube IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_tiktok ON nfc_profiles(tiktok) WHERE tiktok IS NOT NULL;
