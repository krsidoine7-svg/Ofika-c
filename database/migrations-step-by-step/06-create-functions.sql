-- ========================================
-- ÉTAPE 6: CRÉATION DES FONCTIONS UTILITAIRES
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape crée les fonctions nécessaires au fonctionnement de l'application

-- Fonction pour générer une image par défaut
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

-- Fonction pour nettoyer les URLs
CREATE OR REPLACE FUNCTION clean_url(url text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;
    
    -- Supprimer les espaces en début et fin
    url := trim(url);
    
    -- Ajouter https:// si pas de protocole
    IF url !~ '^https?://' THEN
        url := 'https://' || url;
    END IF;
    
    RETURN url;
END;
$$;

-- Fonction pour valider les URLs
CREATE OR REPLACE FUNCTION is_valid_url(url text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN true; -- NULL et chaîne vide sont considérés comme valides
    END IF;
    
    RETURN url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$;

-- Fonction pour vérifier RLS
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT rowsecurity
    INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = $1; 
    
    RETURN COALESCE(rls_enabled, false);
END;
$$;

-- Fonction pour vérifier le maximum de cartes par utilisateur
CREATE OR REPLACE FUNCTION check_max_cards()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM orders 
        WHERE user_id = NEW.user_id AND status != 'cancelled') >= 2
    THEN
        RAISE EXCEPTION 'Maximum 2 cards per user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour définir une image par défaut lors de la création d'utilisateur
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

-- Vérification des fonctions créées
SELECT 
    'Functions Created' as status,
    COUNT(*) as function_count
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('generate_default_user_image', 'clean_url', 'is_valid_url', 'check_rls_enabled', 'check_max_cards', 'update_updated_at_column', 'set_default_user_image');

SELECT 'Étape 6 terminée: Fonctions créées avec succès!' as final_status;
