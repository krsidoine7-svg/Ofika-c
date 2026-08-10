-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- Soft Delete Migration
-- ========================================

-- 1. Ajouter la colonne deleted_at aux deux tables
ALTER TABLE review_links ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Mettre à jour les politiques RLS pour review_links
DROP POLICY IF EXISTS "review_links_select" ON review_links;
CREATE POLICY "review_links_select" 
  ON review_links
  FOR SELECT
  USING (deleted_at IS NULL AND (is_active = true OR auth.uid() = user_id));

DROP POLICY IF EXISTS "review_links_update" ON review_links;
CREATE POLICY "review_links_update" 
  ON review_links
  FOR UPDATE
  USING (deleted_at IS NULL AND auth.uid() = user_id)
  WITH CHECK (true);

-- 3. Mettre à jour les politiques RLS pour reviews
DROP POLICY IF EXISTS "reviews_select_owner" ON reviews;
CREATE POLICY "reviews_select_owner" 
  ON reviews
  FOR SELECT
  USING (
    deleted_at IS NULL AND
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "reviews_update_owner" ON reviews;
CREATE POLICY "reviews_update_owner" 
  ON reviews
  FOR UPDATE
  USING (
    deleted_at IS NULL AND
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  )
  WITH CHECK (true);
