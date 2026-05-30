-- Script pour corriger le search_path des fonctions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Corriger la fonction generate_custom_url
CREATE OR REPLACE FUNCTION generate_custom_url()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    url_candidate text;
    counter integer := 0;
    max_attempts integer := 100;
BEGIN
    LOOP
        -- Générer une URL candidate
        url_candidate := 'profile-' || substring(md5(random()::text) from 1 for 8);
        
        -- Vérifier si l'URL existe déjà
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE custom_url = url_candidate 
            AND is_active = true
        ) THEN
            RETURN url_candidate;
        END IF;
        
        counter := counter + 1;
        IF counter >= max_attempts THEN
            -- Si on n'arrive pas à générer une URL unique, utiliser un timestamp
            RETURN 'profile-' || extract(epoch from now())::text;
        END IF;
    END LOOP;
END;
$$;

-- 2. Corriger la fonction check_max_profiles_per_user
CREATE OR REPLACE FUNCTION check_max_profiles_per_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count integer;
    max_profiles integer := 5; -- Limite par défaut
BEGIN
    -- Compter les profils actifs de l'utilisateur
    SELECT COUNT(*) INTO current_count
    FROM profiles
    WHERE user_id = NEW.user_id
    AND is_active = true;
    
    -- Vérifier la limite
    IF current_count >= max_profiles THEN
        RAISE EXCEPTION 'Limite de profils atteinte. Maximum autorisé: %', max_profiles;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. Corriger la fonction check_max_links_per_profile
CREATE OR REPLACE FUNCTION check_max_links_per_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count integer;
    max_links integer := 20; -- Limite par défaut
BEGIN
    -- Compter les liens actifs du profil
    SELECT COUNT(*) INTO current_count
    FROM links
    WHERE profile_id = NEW.profile_id
    AND is_active = true;
    
    -- Vérifier la limite
    IF current_count >= max_links THEN
        RAISE EXCEPTION 'Limite de liens atteinte. Maximum autorisé: %', max_links;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Corriger la fonction check_max_cards_per_user
CREATE OR REPLACE FUNCTION check_max_cards_per_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count integer;
    max_cards integer := 10; -- Limite par défaut
BEGIN
    -- Compter les cartes actives de l'utilisateur
    SELECT COUNT(*) INTO current_count
    FROM cards
    WHERE user_id = NEW.user_id
    AND is_activated = true;
    
    -- Vérifier la limite
    IF current_count >= max_cards THEN
        RAISE EXCEPTION 'Limite de cartes atteinte. Maximum autorisé: %', max_cards;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. Corriger la fonction generate_unique_card_code
CREATE OR REPLACE FUNCTION generate_unique_card_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    card_code text;
    counter integer := 0;
    max_attempts integer := 100;
BEGIN
    LOOP
        -- Générer un code candidate (8 caractères alphanumériques)
        card_code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Vérifier si le code existe déjà
        IF NOT EXISTS (
            SELECT 1 FROM cards 
            WHERE unique_code = card_code
        ) THEN
            RETURN card_code;
        END IF;
        
        counter := counter + 1;
        IF counter >= max_attempts THEN
            -- Si on n'arrive pas à générer un code unique, utiliser un timestamp
            RETURN upper(substring(md5(extract(epoch from now())::text) from 1 for 8));
        END IF;
    END LOOP;
END;
$$;

-- 6. Corriger la fonction update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 7. Corriger la fonction handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insérer un nouvel utilisateur dans la table users
    INSERT INTO users (
        id,
        email,
        name,
        preferred_language,
        subscription_tier,
        cards_ordered,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'language', 'fr'),
        'free',
        0,
        true,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- 8. Corriger la fonction handle_user_login
CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Mettre à jour la dernière connexion
    UPDATE users 
    SET 
        last_login = NOW(),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- 9. Vérifier que les fonctions ont été corrigées
SELECT 
    routine_name,
    routine_type,
    security_type,
    search_path
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_custom_url',
    'check_max_profiles_per_user',
    'check_max_links_per_profile',
    'check_max_cards_per_user',
    'generate_unique_card_code',
    'update_updated_at_column',
    'handle_new_user',
    'handle_user_login'
)
ORDER BY routine_name;
