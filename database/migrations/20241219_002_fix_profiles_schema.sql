-- Migration UP: Correction du schéma de la table profiles
-- Timestamp: 2024-12-19 10:30:00

-- Ajouter la colonne image_url si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'image_url' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Corriger le type de user_id si nécessaire
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    END IF;
END $$;

-- Configurer les contraintes
ALTER TABLE profiles 
ALTER COLUMN image_url SET DEFAULT NULL;

-- Créer l'index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_image_url ON profiles(image_url) WHERE image_url IS NOT NULL;
