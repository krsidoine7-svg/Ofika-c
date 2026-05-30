-- Correction des politiques RLS pour l'accès Admin
-- Résout les problèmes de récursion et d'accès bloqué (0 statistiques)

-- 1. Table admin_users : Permettre la lecture pour vérifier les droits
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
CREATE POLICY "Allow authenticated to read admins" ON admin_users
    FOR SELECT TO authenticated USING (true);

-- 2. Table users : Accès complet pour les admins + accès propre pour l'utilisateur
DROP POLICY IF EXISTS "Admin full access to users" ON users;
CREATE POLICY "Admin full access to users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- S'assurer que l'utilisateur peut toujours voir son propre profil (important pour useUser)
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 3. Table profiles : Accès complet admin
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
CREATE POLICY "Admin full access to profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- 4. Table orders : Accès complet admin
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
CREATE POLICY "Admin full access to orders" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- 5. Table nfc_cards : Accès complet admin
DROP POLICY IF EXISTS "Admin full access to nfc_cards" ON nfc_cards;
CREATE POLICY "Admin full access to nfc_cards" ON nfc_cards
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- 6. Table analytics_events : Accès complet admin
DROP POLICY IF EXISTS "Admin full access to analytics_events" ON analytics_events;
CREATE POLICY "Admin full access to analytics_events" ON analytics_events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- 7. Fix pour l'utilisateur admin spécifique
-- S'assurer qu'il est bien superadmin avec les bons types d'ID
INSERT INTO admin_users (id, email, name, role, permissions)
VALUES (
    'b24cd8e5-654a-4671-83ca-1b6807304eba', 
    'krsidoine7@gmail.com', 
    'Kevin Admin', 
    'superadmin', 
    '["all"]'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET role = 'superadmin', permissions = '["all"]'::jsonb;
