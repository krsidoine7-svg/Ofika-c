-- =====================================================
-- FIX: Restoration des politiques RLS pour qr_redirects et qr_scans
-- =====================================================

-- 1. Activer RLS au cas où
ALTER TABLE public.qr_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- 2. Nettoyer les anciennes politiques pour qr_redirects
DROP POLICY IF EXISTS "Users can view own redirects" ON public.qr_redirects;
DROP POLICY IF EXISTS "Users can create own redirects" ON public.qr_redirects;
DROP POLICY IF EXISTS "Users can update own redirects" ON public.qr_redirects;
DROP POLICY IF EXISTS "Users can delete own redirects" ON public.qr_redirects;
DROP POLICY IF EXISTS "Public can read active redirects for redirection" ON public.qr_redirects;
DROP POLICY IF EXISTS "Anyone can read active redirects" ON public.qr_redirects;

-- 3. Recréer les politiques pour qr_redirects
CREATE POLICY "Users can view own redirects"
  ON public.qr_redirects FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own redirects"
  ON public.qr_redirects FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own redirects"
  ON public.qr_redirects FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own redirects"
  ON public.qr_redirects FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Public can read active redirects for redirection"
  ON public.qr_redirects FOR SELECT
  USING (
    is_active = true 
    AND (
      auth.uid()::text = user_id  -- Le propriétaire voit tout
      OR 
      (auth.uid() IS NULL)  -- Public voit uniquement pour redirection
    )
  );

-- 4. Nettoyer les anciennes politiques pour qr_scans
DROP POLICY IF EXISTS "Users can view own scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Anyone can create scans" ON public.qr_scans;

-- 5. Recréer les politiques pour qr_scans
CREATE POLICY "Users can view own scans"
  ON public.qr_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_redirects
      WHERE qr_redirects.id = qr_scans.qr_redirect_id
      AND qr_redirects.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Anyone can create scans"
  ON public.qr_scans FOR INSERT
  WITH CHECK (true);
