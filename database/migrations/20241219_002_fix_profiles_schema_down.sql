-- Migration DOWN: Rollback du schéma de la table profiles
-- Timestamp: 2024-12-19 10:30:00

-- Supprimer l'index
DROP INDEX IF EXISTS idx_profiles_image_url;

-- Supprimer la colonne image_url (ATTENTION: perte de données)
ALTER TABLE profiles DROP COLUMN IF EXISTS image_url;
