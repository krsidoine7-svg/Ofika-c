-- ========================================
-- Migration 001: Setup des 5 fonctionnalités Ofika
-- ========================================

-- 1️⃣ EMOJIS POUR CONTACTS
-- ========================================

-- Ajouter colonnes emojis aux contacts existants
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS emojis JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS emoji_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Index pour recherche par emoji
CREATE INDEX IF NOT EXISTS idx_contacts_emojis ON contacts USING GIN (emojis);
CREATE INDEX IF NOT EXISTS idx_contacts_emoji_tags ON contacts USING GIN (emoji_tags);

-- Commentaire
COMMENT ON COLUMN contacts.emojis IS 'Émotions/tags visuels associés au contact (max 5)';


-- 2️⃣ NOTIFICATIONS PUSH WEB
-- ========================================

-- Table pour stocker les push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_endpoint UNIQUE(user_id, endpoint)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_push_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_created_at ON push_subscriptions(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);


-- 3️⃣ TRACKING DES ACTIVITÉS (pour rappels automatisés)
-- ========================================

CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'call', 'email', 'message', 'add', 'edit', 'share')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_activities_user_contact ON contact_activities(user_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON contact_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON contact_activities(activity_type);

-- RLS
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON contact_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON contact_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4️⃣ CONSENTEMENTS RGPD
-- ========================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_storage', 'push_notifications', 'analytics', 'marketing')),
  consent_given BOOLEAN DEFAULT FALSE,
  consent_version TEXT DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_consent UNIQUE(user_id, consent_type)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_type ON user_consents(consent_type);

-- RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents" ON user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consents" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 5️⃣ FONCTION POUR DÉTECTER CONTACTS OUBLIÉS
-- ========================================

CREATE OR REPLACE FUNCTION get_forgotten_contacts(days_threshold INTEGER DEFAULT 7)
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  last_activity_date TIMESTAMPTZ,
  days_since_activity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contact_id,
    c.name as contact_name,
    MAX(ca.created_at) as last_activity_date,
    EXTRACT(DAY FROM NOW() - MAX(ca.created_at))::INTEGER as days_since_activity
  FROM contacts c
  LEFT JOIN contact_activities ca ON ca.contact_id = c.id
  WHERE c.user_id = auth.uid()
  GROUP BY c.id, c.name
  HAVING MAX(ca.created_at) < NOW() - (days_threshold || ' days')::INTERVAL
    OR MAX(ca.created_at) IS NULL
  ORDER BY last_activity_date ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire
COMMENT ON FUNCTION get_forgotten_contacts IS 'Retourne les contacts sans activité depuis X jours';


-- 6️⃣ FONCTION POUR LOGGER LES ACTIVITÉS
-- ========================================

CREATE OR REPLACE FUNCTION log_contact_activity(
  p_contact_id UUID,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO contact_activities (user_id, contact_id, activity_type, metadata)
  VALUES (auth.uid(), p_contact_id, p_activity_type, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7️⃣ VUE POUR STATISTIQUES UTILISATEUR
-- ========================================

CREATE OR REPLACE VIEW user_activity_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT contact_id) as total_contacts_tracked,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as activities_last_7_days,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as activities_last_30_days,
  MAX(created_at) as last_activity_at
FROM contact_activities
GROUP BY user_id;

-- Commentaire
COMMENT ON VIEW user_activity_stats IS 'Statistiques d''activité par utilisateur';


-- ========================================
-- FIN DE MIGRATION 001
-- ========================================

-- Pour vérifier l'installation :
-- SELECT * FROM information_schema.tables WHERE table_name IN ('push_subscriptions', 'contact_activities', 'user_consents');
