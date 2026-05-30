-- =====================================================
-- MIGRATION: QR CODE DYNAMIQUE
-- Crée un système de redirection pour les QR codes
-- =====================================================

-- Table des redirections QR
CREATE TABLE IF NOT EXISTS qr_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identifiant court unique pour le QR code
  short_code TEXT UNIQUE NOT NULL,
  
  -- URL de destination (peut être modifiée)
  nfc_link TEXT NOT NULL,
  
  -- Type de redirection
  redirect_type TEXT DEFAULT 'nfc_card' CHECK (redirect_type IN ('nfc_card', 'profile', 'custom')),
  
  -- Métadonnées
  title TEXT,
  description TEXT,
  
  -- Statistiques
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX idx_qr_redirects_short_code ON qr_redirects(short_code);
CREATE INDEX idx_qr_redirects_user_id ON qr_redirects(user_id);
CREATE INDEX idx_qr_redirects_active ON qr_redirects(is_active);

-- Table des scans (pour analytics détaillés)
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_redirect_id UUID NOT NULL REFERENCES qr_redirects(id) ON DELETE CASCADE,
  
  -- Informations du scan
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Données de l'appareil
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  os TEXT, -- 'iOS', 'Android', 'Windows', etc.
  browser TEXT,
  
  -- Localisation (si disponible)
  ip_address TEXT,
  country TEXT,
  city TEXT,
  
  -- Référence
  referrer TEXT
);

-- Index pour les analytics
CREATE INDEX idx_qr_scans_redirect_id ON qr_scans(qr_redirect_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_qr_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_qr_redirects_updated_at
  BEFORE UPDATE ON qr_redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_redirects_updated_at();

-- Fonction pour générer un short_code unique
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE qr_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres redirections
CREATE POLICY "Users can view own redirects"
  ON qr_redirects FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs redirections
CREATE POLICY "Users can create own redirects"
  ON qr_redirects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs redirections
CREATE POLICY "Users can update own redirects"
  ON qr_redirects FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs redirections
CREATE POLICY "Users can delete own redirects"
  ON qr_redirects FOR DELETE
  USING (auth.uid() = user_id);

-- Politique: Tout le monde peut lire les redirections actives (pour la redirection)
CREATE POLICY "Anyone can read active redirects"
  ON qr_redirects FOR SELECT
  USING (is_active = true);

-- Politique: Les utilisateurs peuvent voir les scans de leurs QR codes
CREATE POLICY "Users can view own scans"
  ON qr_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_redirects
      WHERE qr_redirects.id = qr_scans.qr_redirect_id
      AND qr_redirects.user_id = auth.uid()
    )
  );

-- Politique: Tout le monde peut créer des scans (pour le tracking)
CREATE POLICY "Anyone can create scans"
  ON qr_scans FOR INSERT
  WITH CHECK (true);

-- Ajouter la colonne qr_redirect_id aux cartes NFC existantes
ALTER TABLE nfc_profiles 
ADD COLUMN IF NOT EXISTS qr_redirect_id UUID REFERENCES qr_redirects(id) ON DELETE SET NULL;

-- Index pour la relation
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_qr_redirect ON nfc_profiles(qr_redirect_id);

-- Commentaires
COMMENT ON TABLE qr_redirects IS 'Table des redirections pour les QR codes dynamiques';
COMMENT ON TABLE qr_scans IS 'Table des scans de QR codes pour analytics';
COMMENT ON COLUMN qr_redirects.short_code IS 'Code court unique utilisé dans l''URL du QR code';
COMMENT ON COLUMN qr_redirects.nfc_link IS 'URL de destination (peut être modifiée sans changer le QR code)';
