-- =====================================================
-- SQL POUR SUPABASE - SYSTÈME D'ASSOCIATION CARTE-PROFIL (VERSION SIMPLIFIÉE)
-- =====================================================

-- 1. Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_type VARCHAR(50) NOT NULL DEFAULT 'professionnel',
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url TEXT,
    custom_url VARCHAR(255),
    username VARCHAR(100),
    
    -- Contact
    phone VARCHAR(20),
    
    -- Réseaux sociaux
    whatsapp VARCHAR(255),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    website VARCHAR(255),
    
    -- Liens personnalisés (JSON)
    custom_links JSONB DEFAULT '[]'::jsonb,
    
    -- Paramètres
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table links
CREATE TABLE IF NOT EXISTS links (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table nfc_profiles (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS nfc_profiles (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    profile_name VARCHAR(255) NOT NULL,
    nfc_link TEXT NOT NULL,
    qr_code_url TEXT,
    design_choice VARCHAR(100) DEFAULT 'classic',
    color_theme VARCHAR(50) DEFAULT 'black',
    status VARCHAR(50) DEFAULT 'active',
    
    -- Informations personnelles (pour compatibilité)
    full_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    bio TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Réseaux sociaux
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    linkedin VARCHAR(255),
    other_links TEXT,
    
    -- Localisation
    location VARCHAR(255),
    
    -- Configuration du profil
    username VARCHAR(100),
    custom_url VARCHAR(255),
    
    -- Images
    logo_url TEXT,
    profile_photo_url TEXT,
    
    -- Liens personnalisés
    custom_links JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR(100)
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_links_profile_id ON links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);

CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id ON nfc_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON nfc_profiles(status);

-- 5. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour links
DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour nfc_profiles
DROP TRIGGER IF EXISTS update_nfc_profiles_updated_at ON nfc_profiles;
CREATE TRIGGER update_nfc_profiles_updated_at
    BEFORE UPDATE ON nfc_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Politiques RLS (Row Level Security) - Version simplifiée

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles (version simplifiée)
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
CREATE POLICY "Users can manage their own profiles" ON profiles
    FOR ALL USING (user_id = auth.uid()::text);

-- Politique pour permettre la lecture des profils publics
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (is_public = true AND is_active = true);

-- Politiques pour links (version simplifiée)
DROP POLICY IF EXISTS "Users can manage links of their profiles" ON links;
CREATE POLICY "Users can manage links of their profiles" ON links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND profiles.user_id = auth.uid()::text
        )
    );

-- Politique pour permettre la lecture des liens des profils publics
DROP POLICY IF EXISTS "Public profile links are viewable by everyone" ON links;
CREATE POLICY "Public profile links are viewable by everyone" ON links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND profiles.is_public = true 
            AND profiles.is_active = true
        )
    );

-- Politiques pour nfc_profiles (version simplifiée)
DROP POLICY IF EXISTS "Users can manage their own NFC cards" ON nfc_profiles;
CREATE POLICY "Users can manage their own NFC cards" ON nfc_profiles
    FOR ALL USING (user_id = auth.uid()::text);

-- Politique pour permettre l'accès public aux cartes NFC actives
DROP POLICY IF EXISTS "Active NFC cards are publicly accessible" ON nfc_profiles;
CREATE POLICY "Active NFC cards are publicly accessible" ON nfc_profiles
    FOR SELECT USING (status = 'active');

-- 7. Fonction pour vérifier la limite de profils par utilisateur
CREATE OR REPLACE FUNCTION check_profile_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si l'utilisateur a déjà 3 profils
    IF (SELECT COUNT(*) FROM profiles WHERE user_id = NEW.user_id) >= 3 THEN
        RAISE EXCEPTION 'Limite de 3 profils atteinte pour cet utilisateur';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer la limite de profils
DROP TRIGGER IF EXISTS enforce_profile_limit ON profiles;
CREATE TRIGGER enforce_profile_limit
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_limit();

-- 8. Fonction pour générer une URL personnalisée unique
CREATE OR REPLACE FUNCTION generate_unique_custom_url(base_url TEXT)
RETURNS TEXT AS $$
DECLARE
    counter INTEGER := 1;
    final_url TEXT;
BEGIN
    final_url := base_url;
    
    -- Vérifier si l'URL existe déjà
    WHILE EXISTS (SELECT 1 FROM profiles WHERE custom_url = final_url) LOOP
        final_url := base_url || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_url;
END;
$$ LANGUAGE plpgsql;

-- 9. Commentaires sur les tables
COMMENT ON TABLE profiles IS 'Profils publics des utilisateurs (Link-in-Bio)';
COMMENT ON TABLE links IS 'Liens personnalisés associés aux profils';
COMMENT ON TABLE nfc_profiles IS 'Cartes NFC des utilisateurs avec association aux profils';

COMMENT ON COLUMN profiles.profile_type IS 'Type de profil: professionnel, personnel, marque';
COMMENT ON COLUMN profiles.custom_url IS 'URL personnalisée pour le profil (ex: ofika.com/mon-profil)';
COMMENT ON COLUMN profiles.custom_links IS 'Liens personnalisés au format JSON';
COMMENT ON COLUMN nfc_profiles.profile_id IS 'ID du profil associé à cette carte NFC';
COMMENT ON COLUMN nfc_profiles.nfc_link IS 'URL publique générée pour le QR code et la puce NFC';

-- 10. Vues utiles pour l'application

-- Vue pour les profils avec leurs liens
CREATE OR REPLACE VIEW profiles_with_links AS
SELECT 
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', l.id,
                'title', l.title,
                'url', l.url,
                'position', l.position,
                'click_count', l.click_count,
                'is_active', l.is_active
            ) ORDER BY l.position
        ) FILTER (WHERE l.id IS NOT NULL),
        '[]'::json
    ) as links
FROM profiles p
LEFT JOIN links l ON p.id = l.profile_id AND l.is_active = true
WHERE p.is_active = true
GROUP BY p.id;

-- Vue pour les cartes NFC avec leurs profils associés
CREATE OR REPLACE VIEW nfc_cards_with_profiles AS
SELECT 
    n.*,
    p.name as profile_name,
    p.bio as profile_bio,
    p.image_url as profile_image,
    p.custom_url as profile_custom_url,
    p.is_public as profile_is_public
FROM nfc_profiles n
LEFT JOIN profiles p ON n.profile_id = p.id AND p.is_active = true
WHERE n.status = 'active';

-- 11. Permissions pour les vues
GRANT SELECT ON profiles_with_links TO authenticated;
GRANT SELECT ON nfc_cards_with_profiles TO authenticated;

-- 12. Permissions finales
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON links TO authenticated;
GRANT ALL ON nfc_profiles TO authenticated;

-- 13. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables et politiques créées avec succès !';
    RAISE NOTICE '📊 Système d''association carte-profil prêt à être utilisé';
    RAISE NOTICE '🔒 Sécurité RLS activée sur toutes les tables';
    RAISE NOTICE '⚡ Index créés pour optimiser les performances';
    RAISE NOTICE '🎯 Limite de 3 profils par utilisateur appliquée';
END $$;
