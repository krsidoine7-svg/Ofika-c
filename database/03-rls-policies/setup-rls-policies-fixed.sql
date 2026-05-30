-- Configuration des politiques RLS pour la table profiles (version corrigée)
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Activer RLS sur la table profiles (si ce n'est pas déjà fait)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques s'il y en a (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 3. Politique pour la lecture des profils publics
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (is_public = true);

-- 4. Politique pour que les utilisateurs voient leurs propres profils
-- Conversion explicite de auth.uid() en uuid pour la comparaison
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid()::uuid = user_id);

-- 5. Politique pour l'insertion de nouveaux profils
-- Conversion explicite de auth.uid() en uuid
CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- 6. Politique pour la mise à jour des profils
-- Conversion explicite de auth.uid() en uuid
CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid()::uuid = user_id);

-- 7. Politique pour la suppression des profils
-- Conversion explicite de auth.uid() en uuid
CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid()::uuid = user_id);

-- 8. Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 9. Lister les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 10. Tester les politiques avec un utilisateur connecté
-- (Cette requête ne fonctionnera que si un utilisateur est connecté)
SELECT 
    'Test RLS policies' as test_name,
    auth.uid() as current_user_id,
    auth.uid()::uuid as current_user_uuid,
    COUNT(*) as accessible_profiles
FROM profiles 
WHERE auth.uid()::uuid = user_id OR is_public = true;
