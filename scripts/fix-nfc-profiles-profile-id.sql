-- =====================================================
-- CORRECTION : Rendre profile_id nullable dans nfc_profiles
-- =====================================================

-- Modifier la colonne profile_id pour accepter NULL
ALTER TABLE nfc_profiles 
ALTER COLUMN profile_id DROP NOT NULL;

-- Ajouter un commentaire pour documenter le changement
COMMENT ON COLUMN nfc_profiles.profile_id IS 'ID du profil associé (optionnel - peut être NULL pour les cartes autonomes)';

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
