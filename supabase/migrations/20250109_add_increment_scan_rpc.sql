-- =====================================================
-- MIGRATION: Ajouter fonction RPC pour incrémenter scan_count
-- Corrige le bug où les scans ne sont pas comptabilisés
-- =====================================================

-- Fonction pour incrémenter atomiquement le compteur de scans
CREATE OR REPLACE FUNCTION increment_scan_count(qr_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE qr_redirects
  SET 
    scan_count = scan_count + 1,
    last_scanned_at = NOW()
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_scan_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_scan_count(UUID) TO anon;

-- Commentaire
COMMENT ON FUNCTION increment_scan_count IS 'Incrémente atomiquement le compteur de scans d''un QR code';
