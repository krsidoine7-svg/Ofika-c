-- ========================================
-- SCRIPT COMPLET DE CRÉATION DE BASE DE DONNÉES OFIKA
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Ce script contient TOUT ce dont vous avez besoin pour créer votre base de données

-- ========================================
-- 1. CRÉATION DES TABLES PRINCIPALES
-- ========================================

-- Table Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(255),
    image TEXT,
    preferred_language VARCHAR(5) DEFAULT 'fr',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    cards_ordered INTEGER DEFAULT 0 CHECK (cards_ordered <= 2),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_type VARCHAR(20) CHECK (profile_type IN ('professional', 'personal', 'event')),
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    image_url TEXT,
    custom_url VARCHAR(100) UNIQUE,
    username VARCHAR(50) UNIQUE,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Colonnes pour les réseaux sociaux
    whatsapp TEXT,
    facebook TEXT,
    instagram TEXT,
    twitter TEXT,
    website TEXT,
    custom_links JSONB DEFAULT '[]'::jsonb
);

-- Table Links
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Cards
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nfc_id VARCHAR(100) UNIQUE,
    qr_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Card Designs
CREATE TABLE IF NOT EXISTS card_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    front_design JSONB NOT NULL,
    back_design JSONB NOT NULL,
    logo_position VARCHAR(20) DEFAULT 'top-center',
    text_alignment VARCHAR(20) DEFAULT 'center',
    color_scheme VARCHAR(20) DEFAULT 'classic',
    font_family VARCHAR(50) DEFAULT 'Inter',
    font_size VARCHAR(10) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 2),
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(100),
    shipping_address JSONB NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(20) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    referrer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 3,
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CRÉATION DES INDEXES POUR LES PERFORMANCES
-- ========================================

-- Index sur la table users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Index sur la table profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_facebook ON profiles(facebook) WHERE facebook IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_twitter ON profiles(twitter) WHERE twitter IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_website ON profiles(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_custom_links ON profiles USING GIN(custom_links);

-- Index sur la table links
CREATE INDEX IF NOT EXISTS idx_links_profile_id ON links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_order_index ON links(profile_id, order_index);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);

-- Index sur la table cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_profile_id ON cards(profile_id);
CREATE INDEX IF NOT EXISTS idx_cards_nfc_id ON cards(nfc_id);

-- Index sur la table orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Index sur la table payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider ON payment_methods(provider);

-- Index sur la table analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_date ON analytics_events(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Index sur la table dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_type ON dashboard_widgets(widget_type);

-- ========================================
-- 3. CONFIGURATION DES POLITIQUES RLS
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;

-- POLITIQUES POUR LA TABLE USERS
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = id);

-- POLITIQUES POUR LA TABLE PROFILES
-- Lecture des profils publics (pour tous)
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT USING (is_public = true);

-- Lecture des profils privés (pour le propriétaire)
CREATE POLICY "profiles_private_read" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Insertion de nouveaux profils (pour les utilisateurs connectés)
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Mise à jour des profils (pour le propriétaire)
CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Suppression des profils (pour le propriétaire)
CREATE POLICY "profiles_delete" ON profiles
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- POLITIQUES POUR LA TABLE LINKS
CREATE POLICY "Links are viewable by profile owner" ON links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND (profiles.is_public = true OR profiles.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own links" ON links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- POLITIQUES POUR LA TABLE CARDS
CREATE POLICY "Users can manage their own cards" ON cards
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE CARD_DESIGNS
CREATE POLICY "Users can manage their own card designs" ON card_designs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cards 
            WHERE cards.id = card_designs.card_id 
            AND cards.user_id = auth.uid()
        )
    );

-- POLITIQUES POUR LA TABLE ORDERS
CREATE POLICY "Users can manage their own orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE PAYMENT_METHODS
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE ANALYTICS_EVENTS
-- Lecture pour les propriétaires de profils
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = analytics_events.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Insertion pour tous (pour tracker les vues)
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- POLITIQUES POUR LA TABLE DASHBOARD_WIDGETS
CREATE POLICY "Users can manage their own dashboard widgets" ON dashboard_widgets
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 4. CONFIGURATION DU STORAGE SUPABASE
-- ========================================

-- Créer le bucket pour les images de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Créer le bucket pour les designs de cartes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-designs',
  'card-designs', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supprimer les anciennes politiques de storage
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- POLITIQUES POUR LES IMAGES DE PROFIL
-- Lecture publique pour toutes les images dans le bucket profile-images
CREATE POLICY "Public read access for profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Upload pour les utilisateurs authentifiés dans leur dossier
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Mise à jour pour les utilisateurs authentifiés de leurs propres fichiers
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression pour les utilisateurs authentifiés de leurs propres fichiers
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- POLITIQUES POUR LES DESIGNS DE CARTES
-- Lecture publique pour les designs de cartes
CREATE POLICY "Public read access for card designs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'card-designs');

-- Upload de designs de cartes pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload card designs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Mise à jour des designs de cartes par le propriétaire
CREATE POLICY "Users can update their own card designs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression des designs de cartes par le propriétaire
CREATE POLICY "Users can delete their own card designs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- 5. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour générer une image par défaut
CREATE OR REPLACE FUNCTION generate_default_user_image(user_name text, user_email text)
RETURNS text AS $$
BEGIN
    -- Priorité 1: Utiliser le nom si disponible
    IF user_name IS NOT NULL AND user_name != '' THEN
        RETURN 'https://ui-avatars.com/api/?name=' || 
               encode(user_name::bytea, 'base64') || 
               '&background=random&color=fff&size=200';
    END IF;
    
    -- Priorité 2: Utiliser l'email si disponible
    IF user_email IS NOT NULL THEN
        RETURN 'https://ui-avatars.com/api/?name=' || 
               encode(split_part(user_email, '@', 1)::bytea, 'base64') || 
               '&background=random&color=fff&size=200';
    END IF;
    
    -- Priorité 3: Image par défaut générique
    RETURN 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les URLs
CREATE OR REPLACE FUNCTION clean_url(url text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;
    
    -- Supprimer les espaces en début et fin
    url := trim(url);
    
    -- Ajouter https:// si pas de protocole
    IF url !~ '^https?://' THEN
        url := 'https://' || url;
    END IF;
    
    RETURN url;
END;
$$;

-- Fonction pour valider les URLs
CREATE OR REPLACE FUNCTION is_valid_url(url text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN true; -- NULL et chaîne vide sont considérés comme valides
    END IF;
    
    RETURN url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$;

-- Fonction pour vérifier RLS
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT rowsecurity
    INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = $1; 
    
    RETURN COALESCE(rls_enabled, false);
END;
$$;

-- ========================================
-- 6. TRIGGERS ET CONTRAINTES MÉTIER
-- ========================================

-- Trigger pour définir une image par défaut lors de la création d'utilisateur
CREATE OR REPLACE FUNCTION set_default_user_image()
RETURNS trigger AS $$
BEGIN
    -- Si l'utilisateur n'a pas d'image, en générer une par défaut
    IF NEW.image IS NULL THEN
        NEW.image := generate_default_user_image(NEW.name, NEW.email);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_default_user_image
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_user_image();

-- Fonction pour vérifier le maximum de cartes par utilisateur
CREATE OR REPLACE FUNCTION check_max_cards()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM orders 
        WHERE user_id = NEW.user_id AND status != 'cancelled') >= 2
    THEN
        RAISE EXCEPTION 'Maximum 2 cards per user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_cards
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION check_max_cards();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger updated_at sur toutes les tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_card_designs_updated_at
    BEFORE UPDATE ON card_designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_dashboard_widgets_updated_at
    BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. VÉRIFICATION FINALE
-- ========================================

-- Vérifier que toutes les tables ont été créées
SELECT 
    'Tables Created' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets');

-- Vérifier que RLS est activé sur toutes les tables
SELECT 
    'RLS Status' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
AND schemaname = 'public'
ORDER BY tablename;

-- Vérifier les politiques RLS créées
SELECT 
    'RLS Policies' as status,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
GROUP BY tablename
ORDER BY tablename;

-- Vérifier les buckets de storage
SELECT 
    'Storage Buckets' as status,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('profile-images', 'card-designs')
ORDER BY name;

-- Message de confirmation final
SELECT 'Configuration de la base de données Ofika terminée avec succès!' as final_status;
