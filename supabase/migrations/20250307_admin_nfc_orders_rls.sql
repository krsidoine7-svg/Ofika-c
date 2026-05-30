-- SÉCURISATION FINALE DES TABLES ADMIN (NFC & COMMANDES)
-- Objectif: Permettre aux admins de gérer tout le parc

-- 1. Table: nfc_cards
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nfc_cards_admin_all" ON nfc_cards;
CREATE POLICY "nfc_cards_admin_all" ON nfc_cards 
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
);

DROP POLICY IF EXISTS "nfc_cards_user_access" ON nfc_cards;
CREATE POLICY "nfc_cards_user_access" ON nfc_cards 
FOR ALL TO authenticated 
USING (user_id::text = auth.uid()::text);

-- 2. Table: orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_admin_all" ON orders;
CREATE POLICY "orders_admin_all" ON orders 
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
);

DROP POLICY IF EXISTS "orders_user_access" ON orders;
CREATE POLICY "orders_user_access" ON orders 
FOR SELECT TO authenticated 
USING (user_id::text = auth.uid()::text);

-- 3. Table: captured_contacts (Si applicable)
ALTER TABLE captured_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "captured_contacts_admin_all" ON captured_contacts;
CREATE POLICY "captured_contacts_admin_all" ON captured_contacts 
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text)
);

-- Note: Les utilisateurs normaux ont déjà leurs propres politiques sur captured_contacts
