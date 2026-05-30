-- =====================================================
-- MODULE 9 : ONBOARDING CARTE NFC - MODÈLES DE DESIGN
-- =====================================================

-- Table pour les modèles de cartes NFC
CREATE TABLE IF NOT EXISTS nfc_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  preview_url TEXT,
  layout_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les designs par défaut
INSERT INTO nfc_designs (name, description, layout_config) VALUES
('classic', 'Design épuré et professionnel', '{"logoPosition": "top-left", "textAlignment": "center", "qrPosition": "bottom-right", "cardStyle": "minimal"}'),
('modern', 'Style contemporain avec gradients', '{"logoPosition": "top-center", "textAlignment": "center", "qrPosition": "bottom-center", "cardStyle": "gradient"}'),
('minimal', 'Simplicité et élégance', '{"logoPosition": "top-right", "textAlignment": "left", "qrPosition": "bottom-left", "cardStyle": "clean"}'),
('ofika-optimized', 'Design spécialement conçu pour Ofika', '{"logoPosition": "top-center", "textAlignment": "center", "qrPosition": "bottom-center", "cardStyle": "branded"}')
ON CONFLICT (name) DO NOTHING;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_nfc_designs_active ON nfc_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_nfc_designs_name ON nfc_designs(name);

-- RLS (Row Level Security) - Lecture publique
ALTER TABLE nfc_designs ENABLE ROW LEVEL SECURITY;

-- Politique publique pour la lecture des designs actifs
CREATE POLICY "Public can view active designs" ON nfc_designs
  FOR SELECT USING (is_active = true);
