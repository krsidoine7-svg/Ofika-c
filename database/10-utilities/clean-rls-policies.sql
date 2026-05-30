-- Script pour nettoyer et créer un ensemble propre de politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer TOUTES les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Profiles are viewable by everyone when public" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;

-- 2. S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer un ensemble propre et minimal de politiques

-- Politique 1: Lecture des profils publics (pour tous les utilisateurs)
CREATE POLICY "public_profiles_read" ON profiles
FOR SELECT USING (is_public = true);

-- Politique 2: Lecture des profils privés (pour le propriétaire uniquement)
CREATE POLICY "private_profiles_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id);

-- Politique 3: Insertion de nouveaux profils (pour les utilisateurs connectés)
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Politique 4: Mise à jour des profils (pour le propriétaire uniquement)
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id);

-- Politique 5: Suppression des profils (pour le propriétaire uniquement)
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id);

-- 4. Vérifier que les politiques ont été créées correctement
SELECT 
    policyname, 
    cmd, 
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'Condition: ' || qual
        WHEN with_check IS NOT NULL THEN 'Check: ' || with_check
        ELSE 'No condition'
    END as policy_condition
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;

-- 5. Tester les politiques (si un utilisateur est connecté)
SELECT 
    'RLS Test' as test_name,
    auth.uid() as current_user_id,
    COUNT(*) as accessible_profiles
FROM profiles 
WHERE auth.uid()::text = user_id OR is_public = true;
