-- ========================================
-- ÉTAPE 1: CRÉATION DES TABLES PRINCIPALES
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape crée toutes les tables de base nécessaires

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

-- Vérification que toutes les tables ont été créées
SELECT 
    'Tables Created' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets');

SELECT 'Étape 1 terminée: Tables créées avec succès!' as final_status;
