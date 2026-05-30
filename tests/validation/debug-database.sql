-- =====================================================
-- SCRIPT DE DEBUG - VÉRIFICATION DES DONNÉES
-- =====================================================

-- 1. Vérifier les tables existantes
SELECT 
    'Tables existantes' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'nfc_profiles', 'users')
ORDER BY table_name;

-- 2. Vérifier la structure de la table profiles
SELECT 
    'Structure table profiles' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table nfc_profiles
SELECT 
    'Structure table nfc_profiles' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Compter les enregistrements dans chaque table
SELECT 
    'Nombre de profils' as info,
    COUNT(*) as count
FROM profiles;

SELECT 
    'Nombre de cartes NFC' as info,
    COUNT(*) as count
FROM nfc_profiles;

SELECT 
    'Nombre d utilisateurs' as info,
    COUNT(*) as count
FROM users;

-- 5. Vérifier les politiques RLS
SELECT 
    'Politiques RLS profiles' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
AND schemaname = 'public';

SELECT 
    'Politiques RLS nfc_profiles' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
AND schemaname = 'public';

-- 6. Vérifier l'utilisateur actuel
SELECT 
    'Utilisateur actuel' as info,
    auth.uid() as user_id,
    auth.email() as email;
