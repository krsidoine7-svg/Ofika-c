-- Fonctions RPC pour vérifier et diagnostiquer RLS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Fonction pour vérifier si RLS est activé sur une table
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

-- 2. Fonction pour obtenir les politiques RLS d'une table
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE(
    schemaname text,
    tablename text,
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.schemaname::text,
        p.tablename::text,
        p.policyname::text,
        p.permissive::text,
        p.roles::text[],
        p.cmd::text,
        p.qual::text,
        p.with_check::text
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.tablename = $1
    ORDER BY p.policyname;
END;
$$;

-- 3. Fonction pour tester les permissions RLS
CREATE OR REPLACE FUNCTION test_rls_permissions(table_name text)
RETURNS TABLE(
    operation text,
    allowed boolean,
    error_message text
)
LANGUAGE plpgsql
AS $$
DECLARE
    test_user_id uuid;
    test_profile_id uuid;
BEGIN
    -- Obtenir l'utilisateur actuel
    test_user_id := auth.uid();
    
    -- Tester SELECT
    BEGIN
        EXECUTE format('SELECT 1 FROM %I LIMIT 1', table_name);
        RETURN QUERY SELECT 'SELECT'::text, true::boolean, ''::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::text, false::boolean, SQLERRM::text;
    END;
    
    -- Tester INSERT (si utilisateur connecté)
    IF test_user_id IS NOT NULL THEN
        BEGIN
            EXECUTE format('INSERT INTO %I (name, profile_type, user_id, is_public, is_active) VALUES (''Test'', ''personal'', %L, false, false)', table_name, test_user_id);
            RETURN QUERY SELECT 'INSERT'::text, true::boolean, ''::text;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'INSERT'::text, false::boolean, SQLERRM::text;
        END;
    ELSE
        RETURN QUERY SELECT 'INSERT'::text, false::boolean, 'User not authenticated'::text;
    END IF;
    
    -- Tester UPDATE (si utilisateur connecté)
    IF test_user_id IS NOT NULL THEN
        BEGIN
            EXECUTE format('UPDATE %I SET name = ''Updated Test'' WHERE user_id = %L LIMIT 1', table_name, test_user_id);
            RETURN QUERY SELECT 'UPDATE'::text, true::boolean, ''::text;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'UPDATE'::text, false::boolean, SQLERRM::text;
        END;
    ELSE
        RETURN QUERY SELECT 'UPDATE'::text, false::boolean, 'User not authenticated'::text;
    END IF;
    
    -- Tester DELETE (si utilisateur connecté)
    IF test_user_id IS NOT NULL THEN
        BEGIN
            EXECUTE format('DELETE FROM %I WHERE user_id = %L AND name = ''Updated Test'' LIMIT 1', table_name, test_user_id);
            RETURN QUERY SELECT 'DELETE'::text, true::boolean, ''::text;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'DELETE'::text, false::boolean, SQLERRM::text;
        END;
    ELSE
        RETURN QUERY SELECT 'DELETE'::text, false::boolean, 'User not authenticated'::text;
    END IF;
END;
$$;

-- 4. Fonction pour désactiver temporairement RLS (pour debug)
CREATE OR REPLACE FUNCTION disable_rls_temporarily(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
END;
$$;

-- 5. Fonction pour réactiver RLS
CREATE OR REPLACE FUNCTION enable_rls(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$;
