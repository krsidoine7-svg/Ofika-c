-- =====================================================
-- MIGRATION: Système de campagnes/dossiers pour QR Codes
-- Permet d'organiser les QR codes par projet/campagne
-- =====================================================

-- Table des campagnes/dossiers
CREATE TABLE IF NOT EXISTS qr_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de la campagne
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#f97316', -- Couleur pour l'UI
  
  -- Statistiques agrégées
  total_qr_codes INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_qr_campaigns_user_id ON qr_campaigns(user_id);

-- Ajouter la colonne campaign_id à qr_redirects
ALTER TABLE qr_redirects
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES qr_campaigns(id) ON DELETE SET NULL;

-- Index pour la relation
CREATE INDEX IF NOT EXISTS idx_qr_redirects_campaign ON qr_redirects(campaign_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_qr_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_qr_campaigns_updated_at
  BEFORE UPDATE ON qr_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_campaigns_updated_at();

-- Fonction pour mettre à jour les stats de la campagne
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le compteur de QR codes de la campagne
  IF TG_OP = 'INSERT' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE qr_campaigns
    SET total_qr_codes = total_qr_codes + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.campaign_id IS NOT NULL THEN
    UPDATE qr_campaigns
    SET total_qr_codes = GREATEST(total_qr_codes - 1, 0)
    WHERE id = OLD.campaign_id;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Si le QR change de campagne
    IF OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
      -- Décrémenter ancienne campagne
      IF OLD.campaign_id IS NOT NULL THEN
        UPDATE qr_campaigns
        SET total_qr_codes = GREATEST(total_qr_codes - 1, 0)
        WHERE id = OLD.campaign_id;
      END IF;
      
      -- Incrémenter nouvelle campagne
      IF NEW.campaign_id IS NOT NULL THEN
        UPDATE qr_campaigns
        SET total_qr_codes = total_qr_codes + 1
        WHERE id = NEW.campaign_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les stats
CREATE TRIGGER trigger_update_campaign_stats
  AFTER INSERT OR UPDATE OR DELETE ON qr_redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- RLS pour qr_campaigns
ALTER TABLE qr_campaigns ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs campagnes
CREATE POLICY "Users can view own campaigns"
  ON qr_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs campagnes
CREATE POLICY "Users can create own campaigns"
  ON qr_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs campagnes
CREATE POLICY "Users can update own campaigns"
  ON qr_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs campagnes
CREATE POLICY "Users can delete own campaigns"
  ON qr_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE qr_campaigns IS 'Campagnes/Dossiers pour organiser les QR codes';
COMMENT ON COLUMN qr_campaigns.name IS 'Nom de la campagne/projet';
COMMENT ON COLUMN qr_campaigns.total_qr_codes IS 'Nombre de QR codes dans cette campagne';
COMMENT ON COLUMN qr_campaigns.total_scans IS 'Total des scans de tous les QR de cette campagne';
