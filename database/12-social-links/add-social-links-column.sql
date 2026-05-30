-- Migration: Ajouter la colonne social_links à la table profiles
-- Cette colonne permettra de stocker un tableau de réseaux sociaux avec leur plateforme et URL

-- Ajouter la colonne social_links si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'social_links'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Colonne social_links ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne social_links existe déjà';
    END IF;
END $$;

-- Ajouter un commentaire pour documenter la structure attendue
COMMENT ON COLUMN profiles.social_links IS 'Tableau JSON des réseaux sociaux: [{"platform": "whatsapp|facebook|instagram|twitter|youtube|tiktok|linkedin|snapchat|telegram|website", "url": "https://..."}]';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'social_links';
