-- =====================================================
-- SCRIPT DE CORRECTION RLS - OPTIMISATION DES PERFORMANCES
-- =====================================================

-- 1. Supprimer les politiques RLS redondantes
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

-- 2. Créer des politiques RLS optimisées
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Optimiser les politiques NFC
DROP POLICY IF EXISTS "Users can view own nfc_profiles" ON nfc_profiles;
DROP POLICY IF EXISTS "Users can insert own nfc_profiles" ON nfc_profiles;
DROP POLICY IF EXISTS "Users can update own nfc_profiles" ON nfc_profiles;
DROP POLICY IF EXISTS "Users can delete own nfc_profiles" ON nfc_profiles;

CREATE POLICY "nfc_profiles_select_policy" ON nfc_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nfc_profiles_insert_policy" ON nfc_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nfc_profiles_update_policy" ON nfc_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "nfc_profiles_delete_policy" ON nfc_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Politique pour l'accès public aux profils actifs
CREATE POLICY "nfc_profiles_public_select" ON nfc_profiles
  FOR SELECT USING (status = 'active');

-- 5. Optimiser les politiques des commandes
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_user_id ON nfc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_profiles_status ON nfc_profiles(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 7. Optimiser les requêtes avec des vues matérialisées
CREATE MATERIALIZED VIEW IF NOT EXISTS user_profile_stats AS
SELECT 
  p.user_id,
  COUNT(p.id) as total_profiles,
  COUNT(n.id) as total_nfc_cards,
  COUNT(o.id) as total_orders,
  MAX(p.created_at) as last_profile_created,
  MAX(n.created_at) as last_nfc_created
FROM profiles p
LEFT JOIN nfc_profiles n ON p.user_id = n.user_id
LEFT JOIN orders o ON p.user_id = o.user_id
GROUP BY p.user_id;

-- 8. Créer un index sur la vue matérialisée
CREATE INDEX IF NOT EXISTS idx_user_profile_stats_user_id ON user_profile_stats(user_id);

-- 9. Fonction pour rafraîchir la vue matérialisée
CREATE OR REPLACE FUNCTION refresh_user_profile_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_profile_stats;
END;
$$ LANGUAGE plpgsql;

-- 10. Commentaires pour la documentation
COMMENT ON POLICY "profiles_select_policy" ON profiles IS 'Politique optimisée pour la sélection des profils';
COMMENT ON POLICY "nfc_profiles_public_select" ON nfc_profiles IS 'Politique pour l\'accès public aux profils NFC actifs';
COMMENT ON MATERIALIZED VIEW user_profile_stats IS 'Vue matérialisée pour les statistiques utilisateur optimisées';

-- 11. Vérification des performances
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, n.profile_name as nfc_name 
FROM profiles p 
LEFT JOIN nfc_profiles n ON p.id = n.profile_id 
WHERE p.user_id = '00000000-0000-0000-0000-000000000000';
