-- Migration pour ajouter les rôles utilisateurs et permissions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne role à la table users si elle n'existe pas
-- On utilise VARCHAR(20) avec une valeur par défaut 'user'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest'));

-- 2. Ajouter la colonne permissions (JSONB) pour une flexibilité future
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 3. Mettre à jour les politiques RLS pour permettre aux admins de tout voir
-- Note: Supabase gère déjà SERVICE_ROLE, mais ici on veut identifier des admins via auth.uid()

-- Politiques pour USERS
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id::text = auth.uid()::text AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (Je veux que tu créé une table AdimUser pour stocker le compte Admin de je vais créer avec ces informations et droits
            SELECT 1 FROM users AS u
            WHERE u.id::text = auth.uid()::text AND u.role = 'admin'
        )
    );

-- Politiques pour PROFILES
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
        )
    );

-- Politiques pour ORDERS
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
        )
    );

-- 4. Insérer un commentaire pour documenter
COMMENT ON COLUMN users.role IS 'Rôle de l''utilisateur (admin, user, guest)';
COMMENT ON COLUMN users.permissions IS 'Permissions spécifiques additionnelles au format JSON';

-- 5. (Optionnel) Définir un email spécifique comme admin par défaut
-- REMPLACEZ l'email ci-dessous par votre email admin réel si nécessaire
-- UPDATE users SET role = 'admin' WHERE email = 'admin@ofika.com';
