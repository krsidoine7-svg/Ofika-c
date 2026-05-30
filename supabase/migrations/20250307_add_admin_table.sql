-- Migration : Création de la table Admin dédiée
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Création de la table AdminUser
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'moderator')),
    permissions JSONB DEFAULT '["all"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activation de la sécurité (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Politiques de sécurité
-- Un admin peut voir les autres admins
CREATE POLICY "Admins can view admin_users" ON admin_users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text)
    );

-- RLS pour les autres tables
-- On autorise l'accès complet si l'utilisateur est dans admin_users
-- Note : Il faudra peut-être supprimer les anciennes politiques "Admins can..." si elles existent déjà
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admin full access to profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admin full access to orders" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admin full access to users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text)
    );

COMMENT ON TABLE admin_users IS 'Table réservée aux comptes disposant de droits d''administration sur la plateforme.';
