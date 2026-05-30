-- =====================================================
-- MIGRATION: Séparation stricte Admins / Utilisateurs (V2)
-- Date: 2025-03-07
-- Objectif: Les admins ne sont QUE dans admin_users
-- =====================================================

-- 1. Mise à jour du schéma admin_users pour la compatibilité UI
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'admin';

-- 2. Suppression de la contrainte de clé étrangère sur profiles
-- Permet à un admin (qui n'est plus dans la table users) d'avoir un profil si nécessaire
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_user_id_fkey') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
    END IF;
END $$;

-- 3. Désactivation temporaire RLS pour nettoyage
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 4. Transférer les données manquantes de users vers admin_users pour les admins existants
UPDATE admin_users
SET 
    name = COALESCE(admin_users.name, users.name),
    phone = users.phone,
    image = users.image,
    preferred_language = users.preferred_language,
    updated_at = NOW()
FROM users
WHERE admin_users.id::text = users.id::text;

-- 5. Supprimer les administrateurs de la table utilisateurs (POUR RÉELLEMENT LES SÉPARER)
DELETE FROM users 
WHERE id IN (SELECT id FROM admin_users);

-- 6. RÉINSTALLATION DES POLITIQUES RLS (SANS RÉCURSION)

-- Nettoyage des anciennes politiques
DROP POLICY IF EXISTS "admin_users_read_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_public_read" ON admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "admin_users_read_simple" ON admin_users;

-- Table admin_users : Lecture simple pour les connectés (Indispensable pour briser la récursion 500)
CREATE POLICY "admin_users_read_policy" 
ON admin_users FOR SELECT 
TO authenticated 
USING (true);

-- Table users : Politiques propres
DROP POLICY IF EXISTS "user_self_access" ON users;
DROP POLICY IF EXISTS "admin_access_to_users" ON users;
DROP POLICY IF EXISTS "users_self_access" ON users;
DROP POLICY IF EXISTS "admin_all_access_users" ON users;

-- Un utilisateur voit sa ligne (Comparaison directe UUID <-> UUID)
CREATE POLICY "user_self_access" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Un admin voit TOUT (vérification via admin_users qui est désormais non-récursive)
CREATE POLICY "admin_access_to_users" 
ON users FOR ALL 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
);

-- Table profiles : Politiques propres
DROP POLICY IF EXISTS "profiles_owner_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_public_policy" ON profiles;

CREATE POLICY "profiles_owner_policy" 
ON profiles FOR ALL 
TO authenticated 
USING (user_id::text = auth.uid()::text);

CREATE POLICY "profiles_admin_policy" 
ON profiles FOR ALL 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
);

CREATE POLICY "profiles_public_policy" 
ON profiles FOR SELECT 
TO public 
USING (is_public = true AND is_active = true);

-- 7. Réactivation RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE admin_users IS 'Table unique pour les administrateurs (Séparée de la table users)';
