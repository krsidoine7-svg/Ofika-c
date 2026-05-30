-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- Script de création des tables
-- ========================================
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Création des tables pour le système de collecte d'avis clients

-- ========================================
-- TABLE : review_links
-- Liens de collecte d'avis personnalisables
-- ========================================

CREATE TABLE IF NOT EXISTS review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configuration du lien
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Configuration du formulaire (JSONB pour flexibilité)
  fields_config JSONB DEFAULT '{
    "name_required": false,
    "email_required": false,
    "comment_required": false,
    "media_enabled": false,
    "purchase_verification": false
  }'::jsonb,
  
  -- Métadonnées
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commentaires pour documentation
COMMENT ON TABLE review_links IS 'Liens personnalisés pour collecter des avis clients';
COMMENT ON COLUMN review_links.slug IS 'Slug unique utilisé dans l''URL publique (/avis/[slug])';
COMMENT ON COLUMN review_links.fields_config IS 'Configuration JSON des champs requis dans le formulaire';

-- ========================================
-- TABLE : reviews
-- Avis soumis par les clients
-- ========================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES review_links(id) ON DELETE CASCADE,
  
  -- Données client
  client_name TEXT,
  client_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  has_purchase BOOLEAN DEFAULT false,
  
  -- Média (photo/vidéo)
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  
  -- Anti-fraude et tracking
  ip_address INET,
  user_agent TEXT,
  fingerprint TEXT, -- Hash unique du navigateur
  
  -- Modération et visibilité
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'pending' 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_note TEXT, -- Note privée de modération
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commentaires
COMMENT ON TABLE reviews IS 'Avis clients collectés via les liens de collecte';
COMMENT ON COLUMN reviews.fingerprint IS 'Empreinte unique du navigateur pour détecter les doublons';
COMMENT ON COLUMN reviews.moderation_status IS 'Statut de modération: pending, approved, rejected';
COMMENT ON COLUMN reviews.is_public IS 'Si false, l''avis n''est visible que par le propriétaire';

-- ========================================
-- INDEXES POUR PERFORMANCES
-- ========================================

-- Index review_links
CREATE INDEX IF NOT EXISTS idx_review_links_user_id 
  ON review_links(user_id);

CREATE INDEX IF NOT EXISTS idx_review_links_slug 
  ON review_links(slug);

CREATE INDEX IF NOT EXISTS idx_review_links_active 
  ON review_links(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_review_links_created_at 
  ON review_links(created_at DESC);

-- Index reviews (essentiels pour les requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_reviews_link_id 
  ON reviews(link_id);

CREATE INDEX IF NOT EXISTS idx_reviews_rating 
  ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
  ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_email 
  ON reviews(client_email) WHERE client_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_moderation 
  ON reviews(moderation_status);

-- Index composite pour le dashboard (requêtes les plus fréquentes)
CREATE INDEX IF NOT EXISTS idx_reviews_link_rating_date 
  ON reviews(link_id, rating, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_link_status_date 
  ON reviews(link_id, moderation_status, created_at DESC);

-- Index pour détecter les doublons (anti-fraude)
CREATE INDEX IF NOT EXISTS idx_reviews_ip_link 
  ON reviews(ip_address, link_id);

CREATE INDEX IF NOT EXISTS idx_reviews_fingerprint_link 
  ON reviews(fingerprint, link_id) WHERE fingerprint IS NOT NULL;

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Afficher les tables créées
SELECT 
  'Tables créées' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('review_links', 'reviews')
ORDER BY table_name;

-- Afficher les indexes créés
SELECT
  'Indexes créés' as status,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('review_links', 'reviews')
ORDER BY tablename, indexname;
