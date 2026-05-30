-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - MIGRATION COMPLÈTE
-- =====================================================

-- Ce script s'adapte à votre environnement existant
-- Il évite les conflits avec les fonctions existantes

-- 1. Créer la table nfc_profiles (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS nfc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  full_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  bio TEXT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Réseaux sociaux
  instagram TEXT,
  tiktok TEXT,
  linkedin TEXT,
  other_links TEXT,
  
  -- Localisation
  location VARCHAR(255),
   
  -- Profil
  profile_name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE,
  custom_url VARCHAR(100) UNIQUE,
  
  -- Logo et design
  logo_url TEXT,
  design_choice VARCHAR(50) NOT NULL,
  color_theme VARCHAR(50) NOT NULL,
  
  -- NFC et QR
  nfc_link TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  
  -- Statut
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index (si ils n'existent pas)
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_nfc_link ON nfc_profiles(nfc_link);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_custom_url ON nfc_profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_username ON nfc_profiles(username);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON nfc_profiles(status);

-- 3. Activer RLS (si pas déjà activé)
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS (en évitant les conflits)
DO $$
BEGIN
    -- Vérifier si la politique existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_profiles' 
        AND policyname = 'onboarding_users_can_view_own_profiles'
    ) THEN
        CREATE POLICY "onboarding_users_can_view_own_profiles" ON nfc_profiles
          FOR SELECT USING (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_profiles' 
        AND policyname = 'onboarding_users_can_insert_own_profiles'
    ) THEN
        CREATE POLICY "onboarding_users_can_insert_own_profiles" ON nfc_profiles
          FOR INSERT WITH CHECK (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_profiles' 
        AND policyname = 'onboarding_users_can_update_own_profiles'
    ) THEN
        CREATE POLICY "onboarding_users_can_update_own_profiles" ON nfc_profiles
          FOR UPDATE USING (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_profiles' 
        AND policyname = 'onboarding_users_can_delete_own_profiles'
    ) THEN
        CREATE POLICY "onboarding_users_can_delete_own_profiles" ON nfc_profiles
          FOR DELETE USING (auth.uid()::text = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_profiles' 
        AND policyname = 'onboarding_public_can_view_active_profiles'
    ) THEN
        CREATE POLICY "onboarding_public_can_view_active_profiles" ON nfc_profiles
          FOR SELECT USING (status = 'active');
    END IF;
END $$;

-- 5. Créer les contraintes de validation (si elles n'existent pas)
DO $$
BEGIN
    -- Contrainte email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_onboarding_email_format'
    ) THEN
        ALTER TABLE nfc_profiles ADD CONSTRAINT check_onboarding_email_format 
          CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
    
    -- Contrainte téléphone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_onboarding_phone_format'
    ) THEN
        ALTER TABLE nfc_profiles ADD CONSTRAINT check_onboarding_phone_format 
          CHECK (phone ~* '^[\+]?[0-9\s\-\(\)]+$');
    END IF;
    
    -- Contrainte username
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_onboarding_username_format'
    ) THEN
        ALTER TABLE nfc_profiles ADD CONSTRAINT check_onboarding_username_format 
          CHECK (username IS NULL OR username ~* '^[a-zA-Z0-9_-]{3,50}$');
    END IF;
    
    -- Contrainte custom_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_onboarding_custom_url_format'
    ) THEN
        ALTER TABLE nfc_profiles ADD CONSTRAINT check_onboarding_custom_url_format 
          CHECK (custom_url IS NULL OR custom_url ~* '^[a-zA-Z0-9_-]{3,100}$');
    END IF;
END $$;

-- 6. Créer le trigger updated_at (si il n'existe pas)
CREATE OR REPLACE FUNCTION update_onboarding_nfc_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_onboarding_nfc_profiles_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_onboarding_nfc_profiles_updated_at
          BEFORE UPDATE ON nfc_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_onboarding_nfc_profiles_updated_at();
    END IF;
END $$;

-- 7. Créer la table des designs (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS nfc_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  preview_url TEXT,
  layout_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Insérer les designs par défaut (si ils n'existent pas)
INSERT INTO nfc_designs (name, description, layout_config) VALUES
('classic', 'Design épuré et professionnel', '{"logoPosition": "top-left", "textAlignment": "center", "qrPosition": "bottom-right", "cardStyle": "minimal"}'),
('modern', 'Style contemporain avec gradients', '{"logoPosition": "top-center", "textAlignment": "center", "qrPosition": "bottom-center", "cardStyle": "gradient"}'),
('minimal', 'Simplicité et élégance', '{"logoPosition": "top-right", "textAlignment": "left", "qrPosition": "bottom-left", "cardStyle": "clean"}'),
('ofika-optimized', 'Design spécialement conçu pour Ofika', '{"logoPosition": "top-center", "textAlignment": "center", "qrPosition": "bottom-center", "cardStyle": "branded"}')
ON CONFLICT (name) DO NOTHING;

-- 9. Activer RLS pour nfc_designs
ALTER TABLE nfc_designs ENABLE ROW LEVEL SECURITY;

-- 10. Créer politique publique pour nfc_designs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nfc_designs' 
        AND policyname = 'onboarding_public_can_view_active_designs'
    ) THEN
        CREATE POLICY "onboarding_public_can_view_active_designs" ON nfc_designs
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- 11. Créer les fonctions onboarding (avec des noms uniques)
CREATE OR REPLACE FUNCTION generate_onboarding_nfc_link()
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://ofika.com/nfc/onboarding/' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_onboarding_qr_code_url(nfc_link TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' || nfc_link;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer le trigger pour générer automatiquement le lien NFC
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

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_set_onboarding_nfc_link_and_qr ON nfc_profiles;
CREATE TRIGGER trigger_set_onboarding_nfc_link_and_qr
  BEFORE INSERT OR UPDATE ON nfc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_onboarding_nfc_link_and_qr();

-- 13. Message de confirmation
SELECT 'Migration onboarding NFC terminée avec succès!' as status;
