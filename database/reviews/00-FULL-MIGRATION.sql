-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- MIGRATION COMPLÈTE
-- ========================================
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Script complet pour installer le module de collecte d'avis clients
-- 
-- INSTRUCTIONS:
-- 1. Ouvrir l'éditeur SQL de Supabase
-- 2. Copier-coller ce script complet
-- 3. Exécuter
-- 4. Vérifier les résultats en bas du script
--
-- Ce script est idempotent: vous pouvez le relancer sans problème
-- ========================================

BEGIN;

-- ========================================
-- ÉTAPE 1: CRÉATION DES TABLES
-- ========================================

-- Table review_links (liens de collecte)
CREATE TABLE IF NOT EXISTS review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  fields_config JSONB DEFAULT '{
    "name_required": false,
    "email_required": false,
    "comment_required": false,
    "media_enabled": false,
    "purchase_verification": false
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE review_links IS 'Liens personnalisés pour collecter des avis clients';
COMMENT ON COLUMN review_links.slug IS 'Slug unique utilisé dans l''URL publique (/avis/[slug])';

-- Table reviews (avis clients)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES review_links(id) ON DELETE CASCADE,
  client_name TEXT,
  client_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  has_purchase BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  ip_address INET,
  user_agent TEXT,
  fingerprint TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  moderation_status TEXT DEFAULT 'pending' 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reviews IS 'Avis clients collectés via les liens de collecte';

-- ========================================
-- ÉTAPE 2: INDEXES
-- ========================================

-- review_links indexes
CREATE INDEX IF NOT EXISTS idx_review_links_user_id ON review_links(user_id);
CREATE INDEX IF NOT EXISTS idx_review_links_slug ON review_links(slug);
CREATE INDEX IF NOT EXISTS idx_review_links_active ON review_links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_review_links_created_at ON review_links(created_at DESC);

-- reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_link_id ON reviews(link_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON reviews(client_email) WHERE client_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_link_rating_date ON reviews(link_id, rating, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_link_status_date ON reviews(link_id, moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_ip_link ON reviews(ip_address, link_id);
CREATE INDEX IF NOT EXISTS idx_reviews_fingerprint_link ON reviews(fingerprint, link_id) WHERE fingerprint IS NOT NULL;

-- ========================================
-- ÉTAPE 3: ROW LEVEL SECURITY
-- ========================================

-- Activer RLS
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politiques review_links
DROP POLICY IF EXISTS "review_links_select" ON review_links;
DROP POLICY IF EXISTS "review_links_insert" ON review_links;
DROP POLICY IF EXISTS "review_links_update" ON review_links;
DROP POLICY IF EXISTS "review_links_delete" ON review_links;

CREATE POLICY "review_links_select" ON review_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "review_links_insert" ON review_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_links_update" ON review_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "review_links_delete" ON review_links FOR DELETE USING (auth.uid() = user_id);

-- Politiques reviews
DROP POLICY IF EXISTS "reviews_select_owner" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_update_owner" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_owner" ON reviews;

CREATE POLICY "reviews_select_owner" ON reviews
  FOR SELECT USING (link_id IN (SELECT id FROM review_links WHERE user_id = auth.uid()));

CREATE POLICY "reviews_insert_public" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reviews_update_owner" ON reviews
  FOR UPDATE USING (link_id IN (SELECT id FROM review_links WHERE user_id = auth.uid()));

CREATE POLICY "reviews_delete_owner" ON reviews
  FOR DELETE USING (link_id IN (SELECT id FROM review_links WHERE user_id = auth.uid()));

-- ========================================
-- ÉTAPE 4: TRIGGERS
-- ========================================

-- Fonction de validation du slug
CREATE OR REPLACE FUNCTION validate_review_link_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR LENGTH(TRIM(NEW.slug)) = 0 THEN
    RAISE EXCEPTION 'Le slug ne peut pas être vide';
  END IF;
  IF NEW.slug !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
  END IF;
  IF LENGTH(NEW.slug) > 200 THEN
    RAISE EXCEPTION 'Le slug ne peut pas dépasser 200 caractères';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_slug ON review_links;
CREATE TRIGGER trigger_validate_slug
  BEFORE INSERT OR UPDATE ON review_links
  FOR EACH ROW EXECUTE FUNCTION validate_review_link_slug();

-- Fonction de nettoyage des données
CREATE OR REPLACE FUNCTION sanitize_review_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_name IS NOT NULL THEN
    NEW.client_name := TRIM(NEW.client_name);
    IF LENGTH(NEW.client_name) = 0 THEN NEW.client_name := NULL; END IF;
  END IF;
  IF NEW.client_email IS NOT NULL THEN
    NEW.client_email := TRIM(LOWER(NEW.client_email));
    IF NEW.client_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
      RAISE EXCEPTION 'Format d''email invalide: %', NEW.client_email;
    END IF;
  END IF;
  IF NEW.comment IS NOT NULL THEN
    NEW.comment := TRIM(NEW.comment);
    IF LENGTH(NEW.comment) = 0 THEN NEW.comment := NULL; END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sanitize_review ON reviews;
CREATE TRIGGER trigger_sanitize_review
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sanitize_review_data();

-- Triggers updated_at
DROP TRIGGER IF EXISTS trigger_review_links_updated_at ON review_links;
CREATE TRIGGER trigger_review_links_updated_at
  BEFORE UPDATE ON review_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ÉTAPE 5: FONCTIONS UTILITAIRES
-- ========================================

CREATE OR REPLACE FUNCTION get_review_link_stats(p_link_id UUID)
RETURNS TABLE(
  total_reviews BIGINT,
  avg_rating NUMERIC,
  rating_5_count BIGINT,
  rating_4_count BIGINT,
  rating_3_count BIGINT,
  rating_2_count BIGINT,
  rating_1_count BIGINT,
  positive_rate NUMERIC,
  latest_review_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    ROUND(AVG(rating), 2),
    COUNT(*) FILTER (WHERE rating = 5)::BIGINT,
    COUNT(*) FILTER (WHERE rating = 4)::BIGINT,
    COUNT(*) FILTER (WHERE rating = 3)::BIGINT,
    COUNT(*) FILTER (WHERE rating = 2)::BIGINT,
    COUNT(*) FILTER (WHERE rating = 1)::BIGINT,
    ROUND((COUNT(*) FILTER (WHERE rating >= 4)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1),
    MAX(created_at)
  FROM reviews WHERE link_id = p_link_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ÉTAPE 6: STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media',
  'review-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Politiques storage
DROP POLICY IF EXISTS "review_media_read_public" ON storage.objects;
DROP POLICY IF EXISTS "review_media_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "review_media_update_owner" ON storage.objects;
DROP POLICY IF EXISTS "review_media_delete_owner" ON storage.objects;

CREATE POLICY "review_media_read_public" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'review-media');

CREATE POLICY "review_media_insert_public" ON storage.objects
  FOR INSERT TO public WITH CHECK (
    bucket_id = 'review-media' AND
    (storage.foldername(name))[1] IN ('images', 'videos', 'temp')
  );

CREATE POLICY "review_media_update_owner" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'review-media');

CREATE POLICY "review_media_delete_owner" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'review-media');

COMMIT;

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

-- 1. Tables créées
SELECT 
  '✅ Tables' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_name IN ('review_links', 'reviews')
ORDER BY table_name;

-- 2. RLS actif
SELECT 
  '✅ RLS' as status,
  tablename,
  rowsecurity as enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('review_links', 'reviews');

-- 3. Politiques RLS
SELECT 
  '✅ Policies' as status,
  tablename,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('review_links', 'reviews')
GROUP BY tablename;

-- 4. Indexes
SELECT 
  '✅ Indexes' as status,
  tablename,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('review_links', 'reviews')
GROUP BY tablename;

-- 5. Triggers
SELECT 
  '✅ Triggers' as status,
  event_object_table as table_name,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND event_object_table IN ('review_links', 'reviews')
GROUP BY event_object_table;

-- 6. Storage bucket
SELECT 
  '✅ Storage' as status,
  name,
  public,
  pg_size_pretty(file_size_limit::BIGINT) as max_size
FROM storage.buckets
WHERE name = 'review-media';

-- 7. Message final
SELECT '🎉 Migration du module Avis Clients terminée avec succès!' as message;
