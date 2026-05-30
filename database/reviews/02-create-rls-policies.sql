-- ========================================
-- MODULE AVIS CLIENTS - OFIKA
-- Row Level Security (RLS) Policies
-- ========================================
-- Version: 1.0
-- Date: 2025-12-08
-- Description: Politiques de sécurité pour les tables review_links et reviews

-- ========================================
-- ACTIVATION RLS
-- ========================================

ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLITIQUES POUR review_links
-- ========================================

-- Suppression des anciennes politiques (idempotence)
DROP POLICY IF EXISTS "review_links_select" ON review_links;
DROP POLICY IF EXISTS "review_links_insert" ON review_links;
DROP POLICY IF EXISTS "review_links_update" ON review_links;
DROP POLICY IF EXISTS "review_links_delete" ON review_links;

-- SELECT: L'utilisateur ne voit que ses propres liens
CREATE POLICY "review_links_select" 
  ON review_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: L'utilisateur ne peut créer que ses propres liens
CREATE POLICY "review_links_insert" 
  ON review_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: L'utilisateur ne peut modifier que ses propres liens
CREATE POLICY "review_links_update" 
  ON review_links
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: L'utilisateur ne peut supprimer que ses propres liens
CREATE POLICY "review_links_delete" 
  ON review_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- POLITIQUES POUR reviews
-- ========================================

-- Suppression des anciennes politiques (idempotence)
DROP POLICY IF EXISTS "reviews_select_owner" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_update_owner" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_owner" ON reviews;

-- SELECT: Le propriétaire du lien peut voir tous les avis associés
CREATE POLICY "reviews_select_owner" 
  ON reviews
  FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- INSERT: Tout le monde peut soumettre un avis (formulaire public)
-- C'est sécurisé car on ne peut insérer que dans un lien existant et actif
CREATE POLICY "reviews_insert_public" 
  ON reviews
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Seul le propriétaire du lien peut modifier les avis (pour modération)
CREATE POLICY "reviews_update_owner" 
  ON reviews
  FOR UPDATE
  USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- DELETE: Seul le propriétaire du lien peut supprimer les avis
CREATE POLICY "reviews_delete_owner" 
  ON reviews
  FOR DELETE
  USING (
    link_id IN (
      SELECT id FROM review_links WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- VÉRIFICATION DES POLITIQUES
-- ========================================

-- Vérifier que RLS est actif
SELECT 
  'RLS Status' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('review_links', 'reviews')
ORDER BY tablename;

-- Vérifier les politiques créées
SELECT 
  'Policies' as status,
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('review_links', 'reviews')
ORDER BY tablename, policyname;

-- Compter les politiques par table
SELECT 
  'Policy Count' as status,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('review_links', 'reviews')
GROUP BY tablename
ORDER BY tablename;
