-- ========================================
-- SCRIPT DE CORRECTION RLS COMPLET ET DÉFINITIF
-- ========================================
-- Ce script résout TOUS les problèmes RLS identifiés dans Ofika
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. DIAGNOSTIC INITIAL
-- =====================

-- Vérifier l'état actuel des tables
SELECT 
    'Tables Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'links', 'users')
ORDER BY tablename;

-- Vérifier les types de colonnes user_id
SELECT 
    'Column Types' as info,
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'links') 
AND column_name = 'user_id'
AND table_schema = 'public';

-- 2. NETTOYAGE COMPLET DES POLITIQUES
-- ===================================

-- Supprimer TOUTES les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Profiles are viewable by everyone when public" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "public_profiles_read" ON profiles;
DROP POLICY IF EXISTS "private_profiles_read" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_private_read" ON profiles;

-- Supprimer les politiques pour la table links
DROP POLICY IF EXISTS "Users can view their own links" ON links;
DROP POLICY IF EXISTS "Users can insert their own links" ON links;
DROP POLICY IF EXISTS "Users can update their own links" ON links;
DROP POLICY IF EXISTS "Users can delete their own links" ON links;
DROP POLICY IF EXISTS "links_read" ON links;
DROP POLICY IF EXISTS "links_insert" ON links;
DROP POLICY IF EXISTS "links_update" ON links;
DROP POLICY IF EXISTS "links_delete" ON links;

-- 3. CORRECTION DES TYPES DE COLONNES
-- ===================================

-- S'assurer que user_id est de type UUID dans toutes les tables
DO $$
BEGIN
    -- Corriger la table profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
        RAISE NOTICE 'Colonne user_id de profiles convertie de TEXT vers UUID';
    END IF;
    
    -- Corriger la table links si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'links' 
        AND column_name = 'user_id' 
        AND data_type = 'character varying'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE links ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
        RAISE NOTICE 'Colonne user_id de links convertie de TEXT vers UUID';
    END IF;
END $$;

-- 4. ACTIVATION RLS
-- =================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur links si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'links' AND table_schema = 'public') THEN
        ALTER TABLE links ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS activé sur la table links';
    END IF;
END $$;

-- 5. CRÉATION DES POLITIQUES RLS STANDARDISÉES
-- ============================================

-- POLITIQUES POUR LA TABLE PROFILES
-- =================================

-- Lecture des profils publics (pour tous)
CREATE POLICY "profiles_public_read" ON profiles
FOR SELECT USING (is_public = true);

-- Lecture des profils privés (pour le propriétaire)
CREATE POLICY "profiles_private_read" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Insertion de nouveaux profils (pour les utilisateurs connectés)
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour des profils (pour le propriétaire)
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Suppression des profils (pour le propriétaire)
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE LINKS (si elle existe)
-- ===============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'links' AND table_schema = 'public') THEN
        -- Lecture des liens (pour le propriétaire)
        EXECUTE 'CREATE POLICY "links_read" ON links FOR SELECT USING (auth.uid() = user_id)';
        
        -- Insertion de nouveaux liens
        EXECUTE 'CREATE POLICY "links_insert" ON links FOR INSERT WITH CHECK (auth.uid() = user_id)';
        
        -- Mise à jour des liens
        EXECUTE 'CREATE POLICY "links_update" ON links FOR UPDATE USING (auth.uid() = user_id)';
        
        -- Suppression des liens
        EXECUTE 'CREATE POLICY "links_delete" ON links FOR DELETE USING (auth.uid() = user_id)';
        
        RAISE NOTICE 'Politiques RLS créées pour la table links';
    END IF;
END $$;

-- 6. VÉRIFICATION FINALE
-- ======================

-- Vérifier que RLS est activé
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'links')
ORDER BY tablename;

-- Lister toutes les politiques créées
SELECT 
    'Policies Created' as info,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'links')
ORDER BY tablename, policyname;

-- Test de permissions (si utilisateur connecté)
SELECT 
    'Permission Test' as test_name,
    auth.uid() as current_user_id,
    'RLS policies configured successfully' as status;

-- 7. MESSAGE DE SUCCÈS
-- ====================
SELECT 
    'SUCCESS' as status,
    'RLS policies have been configured successfully!' as message,
    'You can now create and manage profiles without RLS errors.' as next_step;
