-- =====================================================
-- FIX: Correction des politiques RLS permissives (WITH CHECK true)
-- =====================================================

-- 1. Correction de la table qr_scans
DROP POLICY IF EXISTS "Anyone can create scans" ON public.qr_scans;

CREATE POLICY "Anyone can create scans"
  ON public.qr_scans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qr_redirects
      WHERE qr_redirects.id = qr_scans.qr_redirect_id
    )
  );

-- 2. Correction de la table review_links
DROP POLICY IF EXISTS "review_links_update" ON public.review_links;

CREATE POLICY "review_links_update"
  ON public.review_links FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Correction de la table reviews
DROP POLICY IF EXISTS "reviews_update_owner" ON public.reviews;

CREATE POLICY "reviews_update_owner"
  ON public.reviews FOR UPDATE
  USING (
    link_id IN (
      SELECT id FROM public.review_links WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    link_id IN (
      SELECT id FROM public.review_links WHERE user_id = auth.uid()
    )
  );
