-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - MIGRATION FONCTIONS EXISTANTES
-- =====================================================

-- Vérifier les fonctions existantes et les adapter
-- Les fonctions existantes semblent être pour un système de cartes NFC différent

-- 1. Vérifier la structure de la table nfc_cards existante (si elle existe)
DO $$
BEGIN
    -- Vérifier si la table nfc_cards existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nfc_cards') THEN
        RAISE NOTICE 'Table nfc_cards existe déjà';
        
        -- Afficher la structure de la table existante
        PERFORM * FROM information_schema.columns 
        WHERE table_name = 'nfc_cards' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE 'Table nfc_cards n''existe pas';
    END IF;
END $$;

-- 2. Vérifier les fonctions existantes
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%nfc%'
ORDER BY routine_name;

-- 3. Créer nos nouvelles fonctions avec des noms uniques
-- (en préfixant avec "onboarding_")

-- Fonction pour générer un lien NFC unique (onboarding)
CREATE OR REPLACE FUNCTION generate_onboarding_nfc_link()
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://ofika.com/nfc/onboarding/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer QR code (onboarding)
CREATE OR REPLACE FUNCTION generate_onboarding_qr_code_url(nfc_link TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' || nfc_link;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier l'unicité d'une URL personnalisée (onboarding)
CREATE OR REPLACE FUNCTION check_onboarding_custom_url_unique(custom_url TEXT, user_id TEXT, exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM nfc_profiles 
  WHERE nfc_profiles.custom_url = custom_url 
    AND nfc_profiles.user_id != user_id
    AND (exclude_id IS NULL OR nfc_profiles.id != exclude_id);
  
  RETURN count_result = 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier l'unicité d'un username (onboarding)
CREATE OR REPLACE FUNCTION check_onboarding_username_unique(username TEXT, user_id TEXT, exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM nfc_profiles 
  WHERE nfc_profiles.username = username 
    AND nfc_profiles.user_id != user_id
    AND (exclude_id IS NULL OR nfc_profiles.id != exclude_id);
  
  RETURN count_result = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le lien NFC et QR code (onboarding)
CREATE OR REPLACE FUNCTION set_onboarding_nfc_link_and_qr()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer le lien NFC s'il n'est pas fourni
  IF NEW.nfc_link IS NULL OR NEW.nfc_link = '' THEN
    NEW.nfc_link := generate_onboarding_nfc_link();
  END IF;
  
  -- Générer l'URL du QR code
  NEW.qr_code_url := generate_onboarding_qr_code_url(NEW.nfc_link);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à la table nfc_profiles
DROP TRIGGER IF EXISTS trigger_set_onboarding_nfc_link_and_qr ON nfc_profiles;
CREATE TRIGGER trigger_set_onboarding_nfc_link_and_qr
  BEFORE INSERT OR UPDATE ON nfc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_onboarding_nfc_link_and_qr();

-- Fonction pour obtenir les statistiques d'un profil NFC (onboarding)
CREATE OR REPLACE FUNCTION get_onboarding_nfc_profile_stats(profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile_id', p.id,
    'created_at', p.created_at,
    'status', p.status,
    'has_logo', CASE WHEN p.logo_url IS NOT NULL THEN true ELSE false END,
    'design', p.design_choice,
    'color_theme', p.color_theme,
    'social_links_count', (
      CASE WHEN p.instagram IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN p.tiktok IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN p.linkedin IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN p.other_links IS NOT NULL THEN 1 ELSE 0 END
    )
  ) INTO result
  FROM nfc_profiles p
  WHERE p.id = profile_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour lister les profils NFC d'un utilisateur avec pagination (onboarding)
CREATE OR REPLACE FUNCTION get_onboarding_user_nfc_profiles(
  user_uuid TEXT,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name VARCHAR(255),
  company VARCHAR(255),
  job_title VARCHAR(255),
  profile_name VARCHAR(255),
  username VARCHAR(50),
  custom_url VARCHAR(100),
  logo_url TEXT,
  design_choice VARCHAR(50),
  color_theme VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.company,
    p.job_title,
    p.profile_name,
    p.username,
    p.custom_url,
    p.logo_url,
    p.design_choice,
    p.color_theme,
    p.status,
    p.created_at,
    p.updated_at
  FROM nfc_profiles p
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Test des nouvelles fonctions
SELECT 'Fonctions onboarding créées avec succès' as status;

-- 5. Lister toutes les fonctions NFC (existantes + nouvelles)
SELECT 
    routine_name,
    routine_type,
    data_type,
    CASE 
        WHEN routine_name LIKE 'generate_onboarding_%' 
        OR routine_name LIKE 'check_onboarding_%' 
        OR routine_name LIKE 'set_onboarding_%' 
        OR routine_name LIKE 'get_onboarding_%'
        THEN 'ONBOARDING'
        ELSE 'EXISTING'
    END as function_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%nfc%'
ORDER BY function_type, routine_name;
