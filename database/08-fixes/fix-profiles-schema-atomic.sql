-- ========================================
-- PATCH ATOMIQUE : Correction du schéma de la table profiles
-- ========================================
-- Ce script ajoute la colonne image_url manquante et corrige les types

-- 1. Vérifier la structure actuelle de la table profiles
SELECT 
    'Current Schema' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne image_url si elle n'existe pas
DO $$
BEGIN
    -- Vérifier si la colonne image_url existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'image_url' 
        AND table_schema = 'public'
    ) THEN
        -- Ajouter la colonne image_url
        ALTER TABLE profiles ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà';
    END IF;
END $$;

-- 3. Vérifier et corriger le type de user_id si nécessaire
DO $$
BEGIN
    -- Vérifier le type actuel de user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
        AND table_schema = 'public'
    ) THEN
        -- Convertir user_id de TEXT vers UUID
        ALTER TABLE profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
        RAISE NOTICE 'Colonne user_id convertie de TEXT vers UUID';
    ELSE
        RAISE NOTICE 'Colonne user_id est déjà de type UUID';
    END IF;
END $$;

-- 4. Ajouter des contraintes de validation si nécessaire
ALTER TABLE profiles 
ALTER COLUMN image_url SET DEFAULT NULL;

-- 5. Créer un index sur image_url pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_image_url ON profiles(image_url) WHERE image_url IS NOT NULL;

-- 6. Vérifier la structure finale
SELECT 
    'Final Schema' as info,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Test d'insertion de profil avec image_url
DO $$
DECLARE
    test_user_id UUID;
    test_profile_id UUID;
BEGIN
    -- Récupérer un utilisateur existant ou créer un test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tenter d'insérer un profil de test avec image_url
        INSERT INTO profiles (user_id, profile_type, name, bio, image_url, is_public)
        VALUES (test_user_id, 'personal', 'Test Profile', 'Test bio', 'https://example.com/test.jpg', false)
        RETURNING id INTO test_profile_id;
        
        IF test_profile_id IS NOT NULL THEN
            RAISE NOTICE '✅ TEST INSERTION RÉUSSI - Profile ID: %', test_profile_id;
            
            -- Supprimer le profil de test
            DELETE FROM profiles WHERE id = test_profile_id;
            RAISE NOTICE '✅ PROFIL DE TEST NETTOYÉ';
        ELSE
            RAISE NOTICE '❌ ÉCHEC DE L''INSERTION DE TEST';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ AUCUN UTILISATEUR TROUVÉ POUR LE TEST';
    END IF;
END $$;
