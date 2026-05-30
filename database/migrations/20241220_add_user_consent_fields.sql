-- Migration: Ajouter les champs de consentement RGPD à la table users
-- Date: 2024-12-20
-- Description: Ajoute les champs nécessaires pour la conformité RGPD

-- Ajouter les champs de consentement RGPD à la table users
ALTER TABLE users 
ADD COLUMN consent_essential BOOLEAN DEFAULT true,
ADD COLUMN consent_analytics BOOLEAN DEFAULT false,
ADD COLUMN consent_marketing BOOLEAN DEFAULT false,
ADD COLUMN consent_data_processing BOOLEAN DEFAULT false,
ADD COLUMN consent_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN consent_version VARCHAR(10) DEFAULT '1.0';

-- Commentaires pour documentation
COMMENT ON COLUMN users.consent_essential IS 'Consentement pour les données essentielles (toujours true)';
COMMENT ON COLUMN users.consent_analytics IS 'Consentement pour la collecte de données analytics';
COMMENT ON COLUMN users.consent_marketing IS 'Consentement pour les communications marketing';
COMMENT ON COLUMN users.consent_data_processing IS 'Consentement pour le traitement des données de carte NFC';
COMMENT ON COLUMN users.consent_updated_at IS 'Date de dernière mise à jour du consentement';
COMMENT ON COLUMN users.consent_version IS 'Version du formulaire de consentement';

-- Créer un index pour les requêtes de consentement
CREATE INDEX idx_users_consent ON users(consent_analytics, consent_marketing, consent_data_processing);

-- Mettre à jour les utilisateurs existants avec les valeurs par défaut
UPDATE users 
SET 
  consent_essential = true,
  consent_analytics = false,
  consent_marketing = false,
  consent_data_processing = false,
  consent_updated_at = NOW(),
  consent_version = '1.0'
WHERE consent_essential IS NULL;
