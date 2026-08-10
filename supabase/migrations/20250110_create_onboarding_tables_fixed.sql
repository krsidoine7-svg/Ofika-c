-- =====================================================
-- MIGRATION CORRIGÉE: Système d'Onboarding Multi-Parcours
-- Date: 2025-01-10
-- FIX: Apostrophes correctement échappées
-- =====================================================

-- Supprimer les tables si elles existent déjà (pour recommencer proprement)
DROP TABLE IF EXISTS onboarding_sessions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS nfc_cards CASCADE;
DROP TABLE IF EXISTS pending_creations CASCADE;

-- =====================================================
-- 1. TABLE: pending_creations
-- =====================================================
CREATE TABLE pending_creations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('nfc', 'public_page')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  step_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  CONSTRAINT unique_session_type UNIQUE(session_id, type)
);

CREATE INDEX idx_pending_creations_session ON pending_creations(session_id);
CREATE INDEX idx_pending_creations_expires ON pending_creations(expires_at);
CREATE INDEX idx_pending_creations_type ON pending_creations(type);

COMMENT ON TABLE pending_creations IS 'Stocke temporairement les créations avant authentification';

-- =====================================================
-- 2. TABLE: nfc_cards
-- =====================================================
CREATE TABLE nfc_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  design_id TEXT NOT NULL,
  color_theme TEXT DEFAULT 'orange',
  custom_logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending_order', 'ordered', 'in_production', 'shipped', 'delivered', 'activated')),
  chip_id TEXT UNIQUE,
  activation_code TEXT UNIQUE,
  activated_at TIMESTAMPTZ,
  preview_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_design CHECK (design_id ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_nfc_cards_user ON nfc_cards(user_id);
CREATE INDEX idx_nfc_cards_profile ON nfc_cards(profile_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_nfc_cards_chip_id ON nfc_cards(chip_id);

COMMENT ON TABLE nfc_cards IS 'Gère les cartes NFC physiques commandées par les utilisateurs';

-- =====================================================
-- 3. TABLE: orders
-- =====================================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  nfc_card_id TEXT REFERENCES nfc_cards(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'XOF')),
  shipping_cents INTEGER DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents INTEGER DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER GENERATED ALWAYS AS (amount_cents + shipping_cents + tax_cents) STORED,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
  payment_provider TEXT DEFAULT 'Wave',
  payment_intent_id TEXT,
  shipping_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
  tracking_number TEXT,
  carrier TEXT,
  shipping_address JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  CONSTRAINT valid_shipping_address CHECK (
    shipping_address ? 'full_name' AND
    shipping_address ? 'line1' AND
    shipping_address ? 'city' AND
    shipping_address ? 'postal_code' AND
    shipping_address ? 'country'
  )
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_nfc_card ON orders(nfc_card_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

COMMENT ON TABLE orders IS 'Gère les commandes de cartes NFC avec paiement et livraison';

-- =====================================================
-- 4. TABLE: onboarding_sessions
-- =====================================================
CREATE TABLE onboarding_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  user_id TEXT,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('nfc', 'public_page')),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 4,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  device_type TEXT,
  browser TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_sessions_session ON onboarding_sessions(session_id);
CREATE INDEX idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_completed ON onboarding_sessions(completed_at);

COMMENT ON TABLE onboarding_sessions IS 'Analytics et tracking du parcours utilisateur dans l''onboarding';

-- =====================================================
-- FONCTIONS HELPER
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_pending_creations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pending_creations WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT := TO_CHAR(NOW(), 'YYYY');
  counter TEXT;
BEGIN
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO counter
  FROM orders WHERE order_number LIKE 'ORD-' || year || '-%';
  RETURN 'ORD-' || year || '-' || counter;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_nfc_card_price(
  design_id TEXT,
  quantity INTEGER DEFAULT 1,
  country_code TEXT DEFAULT 'CI'
)
RETURNS JSONB AS $$
DECLARE
  base_price INTEGER := 14600;  -- Prix en XOF
  shipping_cost INTEGER := 2000;  -- Frais de livraison en XOF
  tax_cost INTEGER;
  currency TEXT := 'XOF';
BEGIN
  -- Prix variable selon le design (premium +5000 XOF)
  IF design_id IN ('design-premium-metal', 'design-premium-wood') THEN
    base_price := 19600;  -- 14600 + 5000
  END IF;
  
  -- Frais de livraison selon le pays (zone UEMOA)
  IF country_code IN ('CI', 'SN', 'BJ', 'BF', 'TG', 'NE', 'ML', 'GW') THEN
    shipping_cost := 2000;  -- Livraison locale UEMOA
  ELSIF country_code IN ('GH', 'NG', 'CM') THEN
    shipping_cost := 5000;  -- Afrique de l'Ouest hors UEMOA
  ELSE
    shipping_cost := 10000;  -- International
  END IF;
  
  -- Pas de TVA pour simplifier (ou adapter selon le pays)
  tax_cost := 0;
  
  RETURN jsonb_build_object(
    'base_price', base_price,
    'quantity', quantity,
    'subtotal', base_price * quantity,
    'shipping_cost', shipping_cost,
    'tax_cost', tax_cost,
    'total', (base_price * quantity) + shipping_cost + tax_cost,
    'currency', currency
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_nfc_card_price IS 'Calcule le prix total d''une carte NFC avec frais de port et taxes';

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_nfc_cards_updated_at
  BEFORE UPDATE ON nfc_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE pending_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- pending_creations: Accès public
CREATE POLICY "Anyone can manage pending creations"
  ON pending_creations FOR ALL USING (true);

-- nfc_cards: User ownership
CREATE POLICY "Users can read own NFC cards"
  ON nfc_cards FOR SELECT USING (user_id = auth.uid()::text);
  
CREATE POLICY "Users can create own NFC cards"
  ON nfc_cards FOR INSERT WITH CHECK (user_id = auth.uid()::text);
  
CREATE POLICY "Users can update own NFC cards"
  ON nfc_cards FOR UPDATE USING (user_id = auth.uid()::text);

-- orders: User ownership
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (user_id = auth.uid()::text);
  
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT WITH CHECK (user_id = auth.uid()::text);
  
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE USING (user_id = auth.uid()::text);

-- onboarding_sessions: Public read/write
CREATE POLICY "Anyone can manage onboarding sessions"
  ON onboarding_sessions FOR ALL USING (true);

-- =====================================================
-- FIN
-- =====================================================

SELECT 'Migration completed successfully!' as status;
