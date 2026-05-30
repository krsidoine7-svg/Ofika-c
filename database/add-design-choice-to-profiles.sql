-- =====================================================
-- AJOUT DE LA COLONNE DESIGN_CHOICE À LA TABLE PROFILES
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour permettre la modification du design des profils

-- 1. Ajouter la colonne design_choice à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS design_choice VARCHAR(50) DEFAULT 'design1';

-- 2. Ajouter la colonne color_theme à la table profiles (optionnel)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS color_theme VARCHAR(50) DEFAULT 'default';

-- 3. Créer un index pour optimiser les recherches par design
CREATE INDEX IF NOT EXISTS idx_profiles_design_choice ON profiles(design_choice);

-- 4. Mettre à jour les profils existants avec le design par défaut
UPDATE profiles 
SET design_choice = 'design1', color_theme = 'default'
WHERE design_choice IS NULL OR color_theme IS NULL;

-- 5. Vérifier que les colonnes ont été ajoutées
SELECT 'Colonnes design ajoutées avec succès!' as status;

-- Vérifier les colonnes de la table profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('design_choice', 'color_theme')
ORDER BY column_name;