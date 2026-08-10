-- =====================================================
-- MIGRATION: Configuration des prix dynamique
-- Date: 2025-01-10
-- Description: Permet de configurer les prix sans modifier le code
-- =====================================================

-- Table de configuration des prix
CREATE TABLE IF NOT EXISTS pricing_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  nfc_card_base_price INTEGER NOT NULL DEFAULT 14600,
  premium_supplement INTEGER NOT NULL DEFAULT 5000,
  shipping_uemoa INTEGER NOT NULL DEFAULT 2000,
  shipping_west_africa INTEGER NOT NULL DEFAULT 5000,
  shipping_international INTEGER NOT NULL DEFAULT 10000,
  currency TEXT NOT NULL DEFAULT 'XOF',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un seul enregistrement de config
  CONSTRAINT single_config CHECK (id = 'default')
);

-- Insérer la configuration par défaut
INSERT INTO pricing_config (id, nfc_card_base_price, premium_supplement)
VALUES ('default', 14600, 5000)
ON CONFLICT (id) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_pricing_config_id ON pricing_config(id);

-- RLS : Lecture publique, écriture admin uniquement
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing config"
  ON pricing_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update pricing config"
  ON pricing_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.subscription_tier = 'admin'
    )
  );

CREATE POLICY "Only admins can insert pricing config"
  ON pricing_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.subscription_tier = 'admin'
    )
  );

-- Fonction pour récupérer le prix de base
CREATE OR REPLACE FUNCTION get_nfc_card_base_price()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT nfc_card_base_price FROM pricing_config WHERE id = 'default');
END;
$$ LANGUAGE plpgsql STABLE;

-- Mettre à jour la fonction de calcul pour utiliser la config
CREATE OR REPLACE FUNCTION calculate_nfc_card_price(
  design_id TEXT,
  quantity INTEGER DEFAULT 1,
  country_code TEXT DEFAULT 'CI'
)
RETURNS JSONB AS $$
DECLARE
  config RECORD;
  base_price INTEGER;
  shipping_cost INTEGER;
  tax_cost INTEGER := 0;
BEGIN
  -- Récupérer la configuration
  SELECT * INTO config FROM pricing_config WHERE id = 'default';
  
  -- Prix de base
  base_price := config.nfc_card_base_price;
  
  -- Prix variable selon le design (premium)
  IF design_id IN ('design-premium-metal', 'design-premium-wood') THEN
    base_price := base_price + config.premium_supplement;
  END IF;
  
  -- Frais de livraison selon le pays (zone UEMOA)
  IF country_code IN ('CI', 'SN', 'BJ', 'BF', 'TG', 'NE', 'ML', 'GW') THEN
    shipping_cost := config.shipping_uemoa;
  ELSIF country_code IN ('GH', 'NG', 'CM') THEN
    shipping_cost := config.shipping_west_africa;
  ELSE
    shipping_cost := config.shipping_international;
  END IF;
  
  RETURN jsonb_build_object(
    'base_price', base_price,
    'quantity', quantity,
    'subtotal', base_price * quantity,
    'shipping_cost', shipping_cost,
    'tax_cost', tax_cost,
    'total', (base_price * quantity) + shipping_cost + tax_cost,
    'currency', config.currency
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON TABLE pricing_config IS 'Configuration centralisée des prix - modifiable par les admins';
COMMENT ON FUNCTION get_nfc_card_base_price IS 'Récupère le prix de base d''une carte NFC depuis la config';
COMMENT ON FUNCTION calculate_nfc_card_price IS 'Calcule le prix total d''une carte NFC avec frais de port (version avec config dynamique)';

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour afficher les prix actuels de façon lisible
CREATE OR REPLACE VIEW v_current_pricing AS
SELECT 
  nfc_card_base_price as "Prix de base (XOF)",
  premium_supplement as "Supplément premium (XOF)",
  shipping_uemoa as "Livraison UEMOA (XOF)",
  shipping_west_africa as "Livraison Afrique Ouest (XOF)",
  shipping_international as "Livraison internationale (XOF)",
  currency as "Devise",
  updated_at as "Dernière mise à jour"
FROM pricing_config
WHERE id = 'default';

COMMENT ON VIEW v_current_pricing IS 'Vue formatée des prix actuels';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

SELECT 'Configuration des prix créée avec succès!' as status;
