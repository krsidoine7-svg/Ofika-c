-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - FONCTIONS SUPABASE
-- =====================================================

-- Fonction pour générer un lien NFC unique
CREATE OR REPLACE FUNCTION generate_nfc_link()
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://ofika.com/nfc/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer QR code
CREATE OR REPLACE FUNCTION generate_qr_code_url(nfc_link TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' || nfc_link;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier l'unicité d'une URL personnalisée
CREATE OR REPLACE FUNCTION check_custom_url_unique(custom_url TEXT, user_id TEXT, exclude_id UUID DEFAULT NULL)
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

-- Fonction pour vérifier l'unicité d'un username
CREATE OR REPLACE FUNCTION check_username_unique(username TEXT, user_id TEXT, exclude_id UUID DEFAULT NULL)
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

-- Trigger pour générer automatiquement le lien NFC et QR code
CREATE OR REPLACE FUNCTION set_nfc_link_and_qr()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer le lien NFC s'il n'est pas fourni
  IF NEW.nfc_link IS NULL OR NEW.nfc_link = '' THEN
    NEW.nfc_link := generate_nfc_link();
  END IF;
  
  -- Générer l'URL du QR code
  NEW.qr_code_url := generate_qr_code_url(NEW.nfc_link);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_nfc_link_and_qr
  BEFORE INSERT OR UPDATE ON nfc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_nfc_link_and_qr();

-- Fonction pour obtenir les statistiques d'un profil NFC
CREATE OR REPLACE FUNCTION get_nfc_profile_stats(profile_id UUID)
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

-- Fonction pour lister les profils NFC d'un utilisateur avec pagination
CREATE OR REPLACE FUNCTION get_user_nfc_profiles(
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
