-- Fonctions utilitaires pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Fonction pour obtenir les colonnes d'une table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
    columns text[];
BEGIN
    SELECT array_agg(column_name ORDER BY ordinal_position)
    INTO columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1;
    
    RETURN columns;
END;
$$;

-- 2. Fonction pour vérifier si une colonne existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    ) INTO exists;
    
    RETURN exists;
END;
$$;

-- 3. Fonction pour obtenir le schéma complet d'une table
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE(
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    character_maximum_length integer
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        c.character_maximum_length
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = $1
    ORDER BY c.ordinal_position;
END;
$$;

-- 4. Fonction pour valider les URLs (optionnel)
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

-- 5. Fonction pour nettoyer les URLs (supprime les espaces, etc.)
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
