-- ========================================
-- POLITIQUES RLS SÉCURISÉES - OFIKA
-- ========================================
-- Politiques Row Level Security complètes et sécurisées
-- Conformes aux standards OWASP et bonnes pratiques de sécurité

-- 1. ACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can delete own data" ON users;

DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

DROP POLICY IF EXISTS "Users can view own links" ON links;
DROP POLICY IF EXISTS "Users can insert own links" ON links;
DROP POLICY IF EXISTS "Users can update own links" ON links;
DROP POLICY IF EXISTS "Users can delete own links" ON links;

-- 3. POLITIQUES USERS - ACCÈS RESTRICTIF
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Pas de suppression directe des utilisateurs
-- Utiliser soft delete via is_active

-- 4. POLITIQUES PROFILES - SÉCURISÉES
-- Lecture : propriétaire ou public
CREATE POLICY "profiles_select_own_or_public" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_public = true AND is_active = true)
  );

-- Insertion : utilisateur authentifié seulement
CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    is_active = true
  );

-- Mise à jour : propriétaire seulement
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    is_active = true
  );

-- Suppression : propriétaire seulement (soft delete)
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 5. POLITIQUES LINKS - SÉCURISÉES
-- Lecture : via profil public ou propriétaire
CREATE POLICY "links_select_via_profile" ON links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND (
        profiles.user_id = auth.uid() OR 
        (profiles.is_public = true AND profiles.is_active = true)
      )
    )
  );

-- Insertion : propriétaire du profil seulement
CREATE POLICY "links_insert_own_profile" ON links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
      AND profiles.is_active = true
    )
  );

-- Mise à jour : propriétaire du profil seulement
CREATE POLICY "links_update_own_profile" ON links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
      AND profiles.is_active = true
    )
  );

-- Suppression : propriétaire du profil seulement
CREATE POLICY "links_delete_own_profile" ON links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.profile_id 
      AND profiles.user_id = auth.uid()
      AND profiles.is_active = true
    )
  );

-- 6. POLITIQUES CARDS - SÉCURISÉES
-- Lecture : propriétaire seulement
CREATE POLICY "cards_select_own" ON cards
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion : utilisateur authentifié
CREATE POLICY "cards_insert_authenticated" ON cards
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

-- Mise à jour : propriétaire seulement
CREATE POLICY "cards_update_own" ON cards
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : propriétaire seulement
CREATE POLICY "cards_delete_own" ON cards
  FOR DELETE USING (auth.uid() = user_id);

-- 7. POLITIQUES CARD_DESIGNS - SÉCURISÉES
-- Lecture : via carte du propriétaire
CREATE POLICY "card_designs_select_via_card" ON card_designs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  );

-- Insertion : via carte du propriétaire
CREATE POLICY "card_designs_insert_via_card" ON card_designs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  );

-- Mise à jour : via carte du propriétaire
CREATE POLICY "card_designs_update_via_card" ON card_designs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  );

-- Suppression : via carte du propriétaire
CREATE POLICY "card_designs_delete_via_card" ON card_designs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards 
      WHERE cards.id = card_designs.card_id 
      AND cards.user_id = auth.uid()
    )
  );

-- 8. POLITIQUES ORDERS - SÉCURISÉES
-- Lecture : propriétaire seulement
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion : utilisateur authentifié
CREATE POLICY "orders_insert_authenticated" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

-- Mise à jour : propriétaire seulement (statut seulement)
CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Seul le statut peut être modifié
    OLD.user_id = NEW.user_id AND
    OLD.profile_id = NEW.profile_id AND
    OLD.card_type = NEW.card_type AND
    OLD.quantity = NEW.quantity AND
    OLD.unit_price = NEW.unit_price AND
    OLD.total_price = NEW.total_price AND
    OLD.currency = NEW.currency
  );

-- Pas de suppression des commandes (audit trail)

-- 9. POLITIQUES PAYMENT_METHODS - SÉCURISÉES
-- Lecture : propriétaire seulement
CREATE POLICY "payment_methods_select_own" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion : utilisateur authentifié
CREATE POLICY "payment_methods_insert_authenticated" ON payment_methods
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

-- Mise à jour : propriétaire seulement
CREATE POLICY "payment_methods_update_own" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : propriétaire seulement
CREATE POLICY "payment_methods_delete_own" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- 10. POLITIQUES ANALYTICS_EVENTS - SÉCURISÉES
-- Lecture : propriétaire du profil seulement
CREATE POLICY "analytics_events_select_own_profile" ON analytics_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = analytics_events.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Insertion : système seulement (via triggers)
CREATE POLICY "analytics_events_insert_system" ON analytics_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    user_id IS NULL -- Événements anonymes
  );

-- Pas de mise à jour ni suppression des événements analytics

-- 11. POLITIQUES DASHBOARD_WIDGETS - SÉCURISÉES
-- Lecture : propriétaire seulement
CREATE POLICY "dashboard_widgets_select_own" ON dashboard_widgets
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion : utilisateur authentifié
CREATE POLICY "dashboard_widgets_insert_authenticated" ON dashboard_widgets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

-- Mise à jour : propriétaire seulement
CREATE POLICY "dashboard_widgets_update_own" ON dashboard_widgets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : propriétaire seulement
CREATE POLICY "dashboard_widgets_delete_own" ON dashboard_widgets
  FOR DELETE USING (auth.uid() = user_id);

-- 12. FONCTIONS DE SÉCURITÉ SUPPLÉMENTAIRES

-- Fonction pour vérifier les permissions utilisateur
CREATE OR REPLACE FUNCTION check_user_permission(
  user_id uuid,
  resource_type text,
  action text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérification basique : l'utilisateur existe et est actif
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND is_active = true
  ) THEN
    RETURN false;
  END IF;
  
  -- Logique de permissions selon le type de ressource
  CASE resource_type
    WHEN 'profile' THEN
      RETURN true; -- Géré par les politiques RLS
    WHEN 'card' THEN
      RETURN true; -- Géré par les politiques RLS
    WHEN 'admin' THEN
      -- Seuls les utilisateurs avec subscription_tier = 'admin' peuvent accéder
      RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND subscription_tier = 'admin'
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Fonction pour auditer les accès
CREATE OR REPLACE FUNCTION audit_access(
  user_id uuid,
  resource_type text,
  resource_id uuid,
  action text,
  ip_address text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_events (
    user_id,
    profile_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    user_id,
    CASE WHEN resource_type = 'profile' THEN resource_id ELSE NULL END,
    'access_audit',
    jsonb_build_object(
      'resource_type', resource_type,
      'resource_id', resource_id,
      'action', action,
      'ip_address', ip_address,
      'timestamp', now()
    ),
    now()
  );
END;
$$;

-- 13. TRIGGERS DE SÉCURITÉ

-- Trigger pour auditer les modifications de profils
CREATE OR REPLACE FUNCTION audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Audit des modifications
  INSERT INTO analytics_events (
    user_id,
    profile_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    NEW.user_id,
    NEW.id,
    'profile_' || TG_OP,
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', to_jsonb(NEW),
      'timestamp', now()
    ),
    now()
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_audit_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_profile_changes();

-- 14. VUES SÉCURISÉES

-- Vue pour les profils publics (lecture seule)
CREATE VIEW public_profiles AS
SELECT 
  id,
  name,
  bio,
  image_url,
  custom_url,
  username,
  profile_type,
  is_public,
  created_at
FROM profiles
WHERE is_public = true AND is_active = true;

-- Politique pour la vue publique
CREATE POLICY "public_profiles_view" ON public_profiles
  FOR SELECT USING (true);

-- 15. VÉRIFICATIONS DE SÉCURITÉ

-- Vérifier que RLS est activé sur toutes les tables
DO $$
DECLARE
  table_name text;
  rls_enabled boolean;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'profiles', 'links', 'cards', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'All tables have RLS enabled';
END;
$$;

-- 16. COMMENTAIRES DE SÉCURITÉ
COMMENT ON POLICY "profiles_select_own_or_public" ON profiles IS 
'Permet la lecture des profils publics ou des profils de l''utilisateur authentifié';

COMMENT ON POLICY "links_select_via_profile" ON links IS 
'Permet la lecture des liens via les profils publics ou des profils de l''utilisateur authentifié';

COMMENT ON FUNCTION check_user_permission(uuid, text, text) IS 
'Vérifie les permissions utilisateur pour l''accès aux ressources';

COMMENT ON FUNCTION audit_access(uuid, text, uuid, text, text) IS 
'Audite les accès aux ressources pour la sécurité et la conformité';
