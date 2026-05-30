-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - SCRIPT DE TEST
-- =====================================================

-- Test 1: Vérifier que la table nfc_profiles existe et a le bon type
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nfc_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 2: Vérifier les contraintes de clé étrangère
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'nfc_profiles';

-- Test 3: Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'nfc_profiles'
ORDER BY indexname;

-- Test 4: Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'nfc_profiles'
ORDER BY policyname;

-- Test 5: Vérifier les fonctions
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%nfc%'
ORDER BY routine_name;

-- Test 6: Test d'insertion (simulation)
-- Note: Ce test ne sera exécuté que si vous avez un utilisateur valide
-- INSERT INTO nfc_profiles (
--   user_id,
--   full_name,
--   company,
--   job_title,
--   phone,
--   email,
--   profile_name,
--   design_choice,
--   color_theme,
--   nfc_link
-- ) VALUES (
--   'test-user-id',
--   'Test User',
--   'Test Company',
--   'Test Job',
--   '+1234567890',
--   'test@example.com',
--   'Test Profile',
--   'classic',
--   'ofika',
--   'https://ofika.com/nfc/test-link'
-- );

-- Test 7: Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'nfc_profiles'
ORDER BY trigger_name;
