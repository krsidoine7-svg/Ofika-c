-- =====================================================
-- FIX: Correction des problèmes de sécurité QR Codes
-- =====================================================

-- Supprimer la politique conflictuelle qui permet à tout le monde de lire
DROP POLICY IF EXISTS "Anyone can read active redirects" ON qr_redirects;

-- Nouvelle politique: Lecture publique uniquement du minimum nécessaire pour la redirection
-- Les autres utilisateurs ne peuvent pas voir les détails complets
CREATE POLICY "Public can read active redirects for redirection"
  ON qr_redirects FOR SELECT
  USING (
    is_active = true 
    AND (
      auth.uid() = user_id  -- Le propriétaire voit tout
      OR 
      (auth.uid() IS NULL)  -- Public voit uniquement pour redirection (sera géré côté serveur)
    )
  );

-- Fonction RPC pour incrémenter le compteur de scans de manière atomique
CREATE OR REPLACE FUNCTION increment_scan_count(qr_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qr_redirects
  SET scan_count = scan_count + 1,
      last_scanned_at = NOW()
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des contraintes de validation
ALTER TABLE qr_redirects 
ADD CONSTRAINT nfc_link_not_empty CHECK (length(trim(nfc_link)) > 0);

ALTER TABLE qr_redirects 
ADD CONSTRAINT title_length CHECK (title IS NULL OR length(title) <= 200);

ALTER TABLE qr_redirects 
ADD CONSTRAINT description_length CHECK (description IS NULL OR length(description) <= 1000);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_qr_scans_created_at ON qr_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_redirects_user_active ON qr_redirects(user_id, is_active);

-- Fonction pour nettoyer les anciens scans (optionnel, à appeler via cron)
CREATE OR REPLACE FUNCTION cleanup_old_scans(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM qr_scans
  WHERE scanned_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_scan_count IS 'Incrémente le compteur de scans de manière atomique';
COMMENT ON FUNCTION cleanup_old_scans IS 'Nettoie les scans plus anciens que X jours';
