-- Ajouter le support pour les QR codes statiques
ALTER TABLE qr_redirects DROP CONSTRAINT IF EXISTS qr_redirects_redirect_type_check;
ALTER TABLE qr_redirects ADD CONSTRAINT qr_redirects_redirect_type_check 
  CHECK (redirect_type IN ('nfc_card', 'profile', 'custom', 'static'));
