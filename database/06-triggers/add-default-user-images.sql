-- Script pour ajouter des images par défaut aux utilisateurs
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les utilisateurs sans image
SELECT 
    'Before Update' as status,
    COUNT(*) as total_users,
    COUNT(image) as users_with_image,
    COUNT(*) - COUNT(image) as users_without_image
FROM users;

-- 2. Ajouter des images par défaut basées sur les initiales
UPDATE users 
SET 
    image = CASE 
        WHEN name IS NOT NULL AND name != '' THEN
            'https://ui-avatars.com/api/?name=' || 
            encode(name::bytea, 'base64') || 
            '&background=random&color=fff&size=200'
        WHEN email IS NOT NULL THEN
            'https://ui-avatars.com/api/?name=' || 
            encode(split_part(email, '@', 1)::bytea, 'base64') || 
            '&background=random&color=fff&size=200'
        ELSE
            'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200'
    END,
    updated_at = now()
WHERE image IS NULL;

-- 3. Alternative : Utiliser Gravatar si l'utilisateur a un email
-- UPDATE users 
-- SET 
--     image = 'https://www.gravatar.com/avatar/' || 
--             encode(digest(lower(trim(email)), 'md5'), 'hex') || 
--             '?d=identicon&s=200',
--     updated_at = now()
-- WHERE image IS NULL AND email IS NOT NULL;

-- 4. Alternative : Image par défaut statique
-- UPDATE users 
-- SET 
--     image = 'https://your-domain.com/default-avatar.png',
--     updated_at = now()
-- WHERE image IS NULL;

-- 5. Vérifier les mises à jour
SELECT 
    'After Update' as status,
    COUNT(*) as total_users,
    COUNT(image) as users_with_image,
    COUNT(*) - COUNT(image) as users_without_image
FROM users;

-- 6. Voir les utilisateurs avec leurs nouvelles images
SELECT 
    id,
    email,
    name,
    image,
    updated_at
FROM users 
ORDER BY updated_at DESC;

-- 7. Vérifier la qualité des URLs générées
SELECT 
    'URL Quality Check' as check_type,
    COUNT(*) as total_images,
    COUNT(CASE WHEN image LIKE 'https://ui-avatars.com%' THEN 1 END) as ui_avatars_count,
    COUNT(CASE WHEN image LIKE 'https://www.gravatar.com%' THEN 1 END) as gravatar_count,
    COUNT(CASE WHEN image LIKE 'https://%' THEN 1 END) as valid_https_count,
    COUNT(CASE WHEN image NOT LIKE 'https://%' THEN 1 END) as invalid_url_count
FROM users 
WHERE image IS NOT NULL;

-- 8. Fonction pour générer une image par défaut
CREATE OR REPLACE FUNCTION generate_default_user_image(user_name text, user_email text)
RETURNS text AS $$
BEGIN
    -- Priorité 1: Utiliser le nom si disponible
    IF user_name IS NOT NULL AND user_name != '' THEN
        RETURN 'https://ui-avatars.com/api/?name=' || 
               encode(user_name::bytea, 'base64') || 
               '&background=random&color=fff&size=200';
    END IF;
    
    -- Priorité 2: Utiliser l'email si disponible
    IF user_email IS NOT NULL THEN
        RETURN 'https://ui-avatars.com/api/?name=' || 
               encode(split_part(user_email, '@', 1)::bytea, 'base64') || 
               '&background=random&color=fff&size=200';
    END IF;
    
    -- Priorité 3: Image par défaut générique
    RETURN 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200';
END;
$$ LANGUAGE plpgsql;

-- 9. Test de la fonction
SELECT 
    'Function Test' as test_type,
    generate_default_user_image('John Doe', 'john@example.com') as test_image_1,
    generate_default_user_image(NULL, 'jane@example.com') as test_image_2,
    generate_default_user_image(NULL, NULL) as test_image_3;

-- 10. Mettre à jour la logique de création d'utilisateur
-- Cette fonction sera appelée lors de la création d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION set_default_user_image()
RETURNS trigger AS $$
BEGIN
    -- Si l'utilisateur n'a pas d'image, en générer une par défaut
    IF NEW.image IS NULL THEN
        NEW.image := generate_default_user_image(NEW.name, NEW.email);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS trigger_set_default_user_image ON users;
CREATE TRIGGER trigger_set_default_user_image
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_user_image();

-- 12. Vérifier que le trigger a été créé
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_default_user_image';
