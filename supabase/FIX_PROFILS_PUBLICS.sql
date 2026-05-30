-- =====================================================
-- CORRECTION RAPIDE : Rendre tous les profils publics
-- =====================================================
-- Ce script active TOUS les profils pour les rendre visibles
-- =====================================================

-- 1. Activer TOUS les profils dans la table profiles
UPDATE profiles
SET 
  is_public = true,
  is_active = true,
  updated_at = NOW()
WHERE is_public = false 
   OR is_active = false 
   OR is_public IS NULL 
   OR is_active IS NULL;

-- 2. Activer TOUS les profils NFC
UPDATE nfc_profiles
SET 
  status = 'active',
  updated_at = NOW()
WHERE status != 'active' 
   OR status IS NULL;

-- 3. S'assurer que tous les profils ont un username ou custom_url
UPDATE profiles
SET username = LOWER(REPLACE(name, ' ', '-'))
WHERE (username IS NULL OR username = '')
  AND name IS NOT NULL;

-- 4. Afficher le résultat
DO $$
DECLARE
  profiles_count integer;
  nfc_count integer;
  urls_count integer;
BEGIN
  SELECT COUNT(*) INTO profiles_count 
  FROM profiles 
  WHERE is_public = true AND is_active = true;
  
  SELECT COUNT(*) INTO nfc_count 
  FROM nfc_profiles 
  WHERE status = 'active';
  
  SELECT COUNT(*) INTO urls_count 
  FROM profiles 
  WHERE (username IS NOT NULL AND username != '') 
     OR (custom_url IS NOT NULL AND custom_url != '');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSULTATS DE LA CORRECTION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Profils publics et actifs: %', profiles_count;
  RAISE NOTICE '✅ Profils NFC actifs: %', nfc_count;
  RAISE NOTICE '✅ Profils avec URL: %', urls_count;
  RAISE NOTICE '========================================';
  
  IF profiles_count = 0 THEN
    RAISE WARNING '❌ Aucun profil trouvé! Créez un profil d''abord.';
  ELSIF urls_count = 0 THEN
    RAISE WARNING '⚠️ Les profils n''ont pas d''URL (username/custom_url)!';
  ELSE
    RAISE NOTICE '🎉 Vos profils sont maintenant accessibles!';
  END IF;
END;
$$;

-- 5. Lister les URLs disponibles
SELECT 
  '=== TESTEZ CES URLS ===' as info,
  CONCAT('https://votre-domaine.com/', COALESCE(custom_url, username)) as url,
  name,
  is_public,
  is_active
FROM profiles
WHERE is_public = true AND is_active = true
  AND (username IS NOT NULL OR custom_url IS NOT NULL)
ORDER BY created_at DESC
LIMIT 10;
