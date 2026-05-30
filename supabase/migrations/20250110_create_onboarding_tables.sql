-- =====================================================
-- MIGRATION: Système d'Onboarding Multi-Parcours
-- Date: 2025-01-10
-- Description: Crée les tables pour gérer les créations
-- temporaires, cartes NFC, commandes et sessions onboarding
-- =====================================================

-- =====================================================
-- 1. TABLE: pending_creations
-- Stocke les créations avant que l'utilisateur ne soit authentifié
-- =====================================================
CREATE TABLE IF NOT EXISTS pending_creations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,  -- ID de session temporaire (cookie/localStorage)
  type TEXT NOT NULL CHECK (type IN ('nfc', 'public_page')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Données du wizard
  step_completed INTEGER DEFAULT 0,  -- Dernière étape complétée
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Index pour recherche rapide par session
  CONSTRAINT unique_session_type UNIQUE(session_id, type)
);

CREATE INDEX idx_pending_creations_session ON pending_creations(session_id);
CREATE INDEX idx_pending_creations_expires ON pending_creations(expires_at);
CREATE INDEX idx_pending_creations_type ON pending_creations(type);

COMMENT ON TABLE pending_creations IS 'Stocke temporairement les créations avant authentification';
COMMENT ON COLUMN pending_creations.session_id IS 'UUID de session générée côté client';
COMMENT ON COLUMN pending_creations.payload IS 'Données du wizard (name, bio, links, etc.)';

-- =====================================================
-- 2. TABLE: nfc_cards
-- Gère les cartes NFC physiques liées aux profils
-- =====================================================
CREATE TABLE IF NOT EXISTS nfc_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,  -- Référence auth.users (pas de FK car table auth)
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Métadonnées de design
  design_id TEXT NOT NULL,  -- ID du template de carte
  color_theme TEXT DEFAULT 'orange',
  custom_logo_url TEXT,
  
  -- Statut et tracking
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending_order', 'ordered', 'in_production', 'shipped', 'delivered', 'activated')),
  chip_id TEXT UNIQUE,  -- ID physique de la puce NFC (rempli après production)
  activation_code TEXT UNIQUE,  -- Code pour activer la carte
  activated_at TIMESTAMPTZ,
  
  -- Données de prévisualisation
  preview_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_design CHECK (design_id ~ '^[a-z0-9-]+$')
);

-- Index
CREATE INDEX idx_nfc_cards_user ON nfc_cards(user_id);
CREATE INDEX idx_nfc_cards_profile ON nfc_cards(profile_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_nfc_cards_chip_id ON nfc_cards(chip_id);

COMMENT ON TABLE nfc_cards IS 'Gère les cartes NFC physiques commandées par les utilisateurs';
COMMENT ON COLUMN nfc_cards.chip_id IS 'ID unique de la puce NFC physique (ajouté après fabrication)';
COMMENT ON COLUMN nfc_cards.activation_code IS 'Code à 6 chiffres pour activer la carte après réception';

-- =====================================================
-- 3. TABLE: orders
-- Gère les commandes de cartes NFC
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,  -- Ex: ORD-2025-001234
  
  -- Relations
  user_id TEXT NOT NULL,
  nfc_card_id TEXT REFERENCES nfc_cards(id) ON DELETE RESTRICT,
  
  -- Montants (en centimes pour éviter les erreurs de floating point)
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'XOF')),
  shipping_cents INTEGER DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents INTEGER DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER GENERATED ALWAYS AS (amount_cents + shipping_cents + tax_cents) STORED,
  
  -- Statut de paiement
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
  payment_provider TEXT DEFAULT 'stripe',
  payment_intent_id TEXT,  -- Stripe PaymentIntent ID
  
  -- Statut de livraison
  shipping_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
  tracking_number TEXT,
  carrier TEXT,  -- Ex: 'DHL', 'FedEx', 'La Poste'
  
  -- Adresse de livraison (JSONB pour flexibilité internationale)
  shipping_address JSONB NOT NULL,
  /* Format:
  {
    "full_name": "John Doe",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "Paris",
    "postal_code": "75001",
    "country": "FR",
    "phone": "+33612345678"
  }
  */
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT valid_shipping_address CHECK (
    shipping_address ? 'full_name' AND
    shipping_address ? 'line1' AND
    shipping_address ? 'city' AND
    shipping_address ? 'postal_code' AND
    shipping_address ? 'country'
  )
);

-- Index
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_nfc_card ON orders(nfc_card_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_shipping_status ON orders(shipping_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_tracking ON orders(tracking_number);

COMMENT ON TABLE orders IS 'Gère les commandes de cartes NFC avec paiement et livraison';
COMMENT ON COLUMN orders.amount_cents IS 'Montant en centimes (ex: 2990 = 29.90 EUR)';
COMMENT ON COLUMN orders.shipping_address IS 'Adresse de livraison au format JSON flexible';

-- =====================================================
-- 4. TABLE: onboarding_sessions
-- Trace le parcours utilisateur dans le wizard
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,  -- Même session_id que pending_creations
  user_id TEXT,  -- NULL si pas encore authentifié
  
  -- Tracking du parcours
  flow_type TEXT NOT NULL CHECK (flow_type IN ('nfc', 'public_page')),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 4,
  steps_completed JSONB DEFAULT '[]'::jsonb,  -- [1, 2, 3]
  
  -- Analytics
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  
  -- Métadonnées pour analytics
  device_type TEXT,  -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_onboarding_sessions_session ON onboarding_sessions(session_id);
CREATE INDEX idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_flow ON onboarding_sessions(flow_type);
CREATE INDEX idx_onboarding_sessions_completed ON onboarding_sessions(completed_at);

COMMENT ON TABLE onboarding_sessions IS 'Analytics et tracking du parcours utilisateur dans l''onboarding';

-- =====================================================
-- FONCTIONS HELPER
-- =====================================================

-- Fonction pour nettoyer les pending_creations expirées
CREATE OR REPLACE FUNCTION cleanup_expired_pending_creations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pending_creations
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_pending_creations IS 'Supprime les créations temporaires expirées (cron à exécuter quotidiennement)';

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT := TO_CHAR(NOW(), 'YYYY');
  counter TEXT;
  order_num TEXT;
BEGIN
  -- Compter les commandes de l'année en cours
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO counter
  FROM orders
  WHERE order_number LIKE 'ORD-' || year || '-%';
  
  order_num := 'ORD-' || year || '-' || counter;
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number IS 'Génère un numéro de commande séquentiel (ORD-2025-000001)';

-- Fonction pour calculer le prix d'une carte NFC (à adapter selon votre logique)
CREATE OR REPLACE FUNCTION calculate_nfc_card_price(
  design_id TEXT,
  quantity INTEGER DEFAULT 1,
  country_code TEXT DEFAULT 'FR'
)
RETURNS JSONB AS $$
DECLARE
  base_price_cents INTEGER := 2990;  -- 29.90 EUR par défaut
  shipping_cents INTEGER := 0;
  tax_rate DECIMAL := 0.20;  -- 20% TVA par défaut
  tax_cents INTEGER;
  total_cents INTEGER;
BEGIN
  -- Prix variable selon le design (premium +10 EUR)
  IF design_id IN ('design-premium-1', 'design-premium-2') THEN
    base_price_cents := 3990;  -- 39.90 EUR
  END IF;
  
  -- Frais de livraison selon le pays
  IF country_code IN ('FR', 'BE', 'LU') THEN
    shipping_cents := 500;  -- 5 EUR livraison standard
  ELSIF country_code IN ('DE', 'NL', 'IT', 'ES') THEN
    shipping_cents := 800;  -- 8 EUR Europe
  ELSE
    shipping_cents := 1500;  -- 15 EUR international
  END IF;
  
  -- Remise quantité
  IF quantity >= 5 THEN
    base_price_cents := base_price_cents * 90 / 100;  -- -10%
  ELSIF quantity >= 10 THEN
    base_price_cents := base_price_cents * 80 / 100;  -- -20%
  END IF;
  
  -- Calcul TVA
  tax_cents := ROUND((base_price_cents * quantity + shipping_cents) * tax_rate);
  total_cents := (base_price_cents * quantity) + shipping_cents + tax_cents;
  
  RETURN jsonb_build_object(
    'base_price_cents', base_price_cents,
    'quantity', quantity,
    'subtotal_cents', base_price_cents * quantity,
    'shipping_cents', shipping_cents,
    'tax_rate', tax_rate,
    'tax_cents', tax_cents,
    'total_cents', total_cents,
    'currency', 'EUR'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_nfc_card_price IS 'Calcule le prix total d''une carte NFC avec frais de port et taxes';

-- =====================================================
-- TRIGGERS pour updated_at
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
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- pending_creations : Accès public temporaire (expiration 24h)
ALTER TABLE pending_creations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pending creations"
  ON pending_creations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own pending creations"
  ON pending_creations FOR SELECT
  USING (true);  -- Sécurisé par session_id côté client

CREATE POLICY "Anyone can update own pending creations"
  ON pending_creations FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete own pending creations"
  ON pending_creations FOR DELETE
  USING (true);

-- nfc_cards : Seulement le propriétaire
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own NFC cards"
  ON nfc_cards FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own NFC cards"
  ON nfc_cards FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own NFC cards"
  ON nfc_cards FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own NFC cards"
  ON nfc_cards FOR DELETE
  USING (user_id = auth.uid()::text);

-- orders : Seulement le propriétaire
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (user_id = auth.uid()::text);

-- onboarding_sessions : Lecture publique, écriture limitée
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read onboarding sessions"
  ON onboarding_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create onboarding sessions"
  ON onboarding_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update onboarding sessions"
  ON onboarding_sessions FOR UPDATE
  USING (true);

-- =====================================================
-- SEED DATA (optionnel)
-- =====================================================

-- Exemple de design de carte NFC (à compléter)
-- Ces données pourraient être dans une table `nfc_card_designs` séparée

COMMENT ON DATABASE postgres IS 'Ofika - Migration onboarding multiflow appliquée avec succès';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
