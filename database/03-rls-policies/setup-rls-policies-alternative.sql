-- Configuration alternative des politiques RLS (si user_id est de type text)
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Activer RLS sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 
-- 2. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 3. Politique pour la lecture des profils publics
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (is_public = true);

-- 4. Politique pour que les utilisateurs voient leurs propres profils
-- Conversion de auth.uid() en text pour la comparaison
CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT USING (auth.uid()::text = user_id);

-- 5. Politique pour l'insertion de nouveaux profils
-- Conversion de auth.uid() en text
CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 6. Politique pour la mise à jour des profils
-- Conversion de auth.uid() en text
CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id);

-- 7. Politique pour la suppression des profils
-- Conversion de auth.uid() en text
CREATE POLICY "Users can delete their own profiles" ON profiles
FOR DELETE USING (auth.uid()::text = user_id);

-- 8. Vérifier les types de colonnes
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- 9. Tester la comparaison de types
SELECT 
    auth.uid() as auth_uid_value,
    pg_typeof(auth.uid()) as auth_uid_type,
    'user_id type check' as test_description;
