-- ========================================
-- SOLUTION RAPIDE RLS - SANS CONVERSION DE TYPE
-- ========================================

-- 1. Nettoyer les politiques existantes
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

-- 2. Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques avec conversion de type appropriée
CREATE POLICY "profiles_public_read" ON profiles
FOR SELECT USING (is_public = true);

CREATE POLICY "profiles_private_read" ON profiles
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (auth.uid()::text = user_id::text);

-- 4. Vérifier la configuration
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

SELECT 'RLS configuré avec succès!' as status;
