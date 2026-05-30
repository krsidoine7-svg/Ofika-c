-- Script pour synchroniser les images des utilisateurs depuis Auth
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Fonction pour extraire l'URL d'image des métadonnées Auth
CREATE OR REPLACE FUNCTION get_user_image_from_auth(user_id uuid)
RETURNS text AS $$
DECLARE
    auth_image_url text;
BEGIN
    -- Récupérer l'URL d'image depuis les métadonnées Auth
    SELECT 
        COALESCE(
            raw_user_meta_data->>'avatar_url',
            raw_user_meta_data->>'picture',
            raw_user_meta_data->>'image'
        )
    INTO auth_image_url
    FROM auth.users 
    WHERE id = user_id;
    
    RETURN auth_image_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mettre à jour les utilisateurs existants avec leurs images Auth
UPDATE users 
SET 
    image = get_user_image_from_auth(id),
    updated_at = now()
WHERE 
    image IS NULL 
    AND get_user_image_from_auth(id) IS NOT NULL;

-- 3. Vérifier les mises à jour effectuées
SELECT 
    'Update Results' as status,
    COUNT(*) as total_users,
    COUNT(image) as users_with_image,
    COUNT(*) - COUNT(image) as users_without_image
FROM users;

-- 4. Voir les utilisateurs mis à jour
SELECT 
    id,
    email,
    name,
    image,
    updated_at
FROM users 
WHERE image IS NOT NULL
ORDER BY updated_at DESC;

-- 5. Voir les utilisateurs toujours sans image
SELECT 
    id,
    email,
    name,
    image,
    created_at
FROM users 
WHERE image IS NULL
ORDER BY created_at DESC;

-- 6. Créer une fonction de synchronisation automatique
CREATE OR REPLACE FUNCTION sync_user_image_on_auth_update()
RETURNS trigger AS $$
BEGIN
    -- Mettre à jour l'image dans la table users quand Auth est modifié
    UPDATE users 
    SET 
        image = COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'image'
        ),
        updated_at = now()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer un trigger pour la synchronisation automatique
DROP TRIGGER IF EXISTS trigger_sync_user_image ON auth.users;
CREATE TRIGGER trigger_sync_user_image
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_image_on_auth_update();

-- 8. Vérifier que le trigger a été créé
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_user_image';

-- 9. Test de la fonction de synchronisation
SELECT 
    'Function Test' as test_type,
    get_user_image_from_auth(auth.uid()) as current_user_image;

-- 10. Nettoyer la fonction temporaire (optionnel)
-- DROP FUNCTION IF EXISTS get_user_image_from_auth(uuid);
