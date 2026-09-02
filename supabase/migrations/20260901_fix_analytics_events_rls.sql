-- =====================================================
-- MIGRATION: RLS POLICY POUR LECTURE DES ANALYTICS PROFILS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile analytics" ON public.analytics_events;

CREATE POLICY "Users can view own profile analytics"
  ON public.analytics_events FOR SELECT
  TO public
  USING (
    (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = analytics_events.profile_id
      AND profiles.user_id::text = auth.uid()::text
    )
  );
