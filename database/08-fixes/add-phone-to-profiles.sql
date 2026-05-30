-- ========================================
-- AJOUT DU CHAMP PHONE À LA TABLE PROFILES
-- ========================================
-- Ce script ajoute le champ phone à la table profiles pour permettre
-- l'ajout automatique aux contacts avec le numéro de téléphone

-- Ajouter la colonne phone à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.phone IS 'Numéro de téléphone du profil pour l''ajout automatique aux contacts';

-- Créer un index pour optimiser les recherches par téléphone
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- Mettre à jour les politiques RLS si nécessaire (optionnel)
-- Les politiques existantes devraient déjà couvrir cette colonne

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'phone';
