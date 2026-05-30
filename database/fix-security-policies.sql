-- ========================================
-- CORRECTION URGENTE DES POLITIQUES RLS
-- ========================================
-- Ce script corrige le problème de sécurité critique
-- où les utilisateurs peuvent voir les profils des autres

-- 1. Vérifier l'état actuel des politiques
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as condition
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 2. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_private_read" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 3. S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques RLS sécurisées et strictes
-- Politique 1: Lecture des profils publics (pour tous les utilisateurs)
CREATE POLICY "profiles_public_read" ON profiles
FOR SELECT USING (is_public = true);

-- Politique 2: Lecture des profils privés (UNIQUEMENT pour le propriétaire)
CREATE POLICY "profiles_private_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Politique 3: Insertion de nouveaux profils (UNIQUEMENT pour l'utilisateur connecté)
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Politique 4: Mise à jour des profils (UNIQUEMENT pour le propriétaire)
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Politique 5: Suppression des profils (UNIQUEMENT pour le propriétaire)
CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Vérifier que les politiques sont correctement appliquées
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No condition'
    END as condition
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 6. Vérifier que RLS est bien activé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ACTIVÉ'
        ELSE '❌ RLS DÉSACTIVÉ'
    END as status
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 7. Test de sécurité (à exécuter avec différents utilisateurs)
-- Cette requête devrait maintenant retourner uniquement les profils de l'utilisateur connecté
-- SELECT COUNT(*) as total_profiles, 
--        COUNT(CASE WHEN user_id::text = auth.uid()::text THEN 1 END) as my_profiles,
--        COUNT(CASE WHEN user_id::text != auth.uid()::text THEN 1 END) as other_profiles
-- FROM profiles;
