-- Script pour corriger les tailles des colonnes de la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Augmenter la taille de la colonne bio (probablement limitée à 100 caractères)
ALTER TABLE profiles 
ALTER COLUMN bio TYPE TEXT;

-- 2. Augmenter la taille de la colonne name si nécessaire
ALTER TABLE profiles 
ALTER COLUMN name TYPE TEXT;

-- 3. Augmenter la taille de la colonne custom_url si nécessaire
ALTER TABLE profiles 
ALTER COLUMN custom_url TYPE TEXT;

-- 4. Augmenter la taille de la colonne username si nécessaire
ALTER TABLE profiles 
ALTER COLUMN username TYPE TEXT;

-- 5. Augmenter la taille de la colonne image_url si nécessaire
ALTER TABLE profiles 
ALTER COLUMN image_url TYPE TEXT;

-- 6. Vérifier que les nouvelles colonnes ont la bonne taille
-- (Elles devraient déjà être en TEXT, mais on s'assure)
ALTER TABLE profiles 
ALTER COLUMN whatsapp TYPE TEXT,
ALTER COLUMN facebook TYPE TEXT,
ALTER COLUMN instagram TYPE TEXT,
ALTER COLUMN twitter TYPE TEXT,
ALTER COLUMN website TYPE TEXT;

-- 7. Vérifier la structure après modification
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('bio', 'name', 'custom_url', 'username', 'image_url', 'whatsapp', 'facebook', 'instagram', 'twitter', 'website')
ORDER BY column_name;
