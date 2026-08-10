DROP POLICY IF EXISTS "review_links_select" ON review_links;
CREATE POLICY "review_links_select" 
  ON review_links
  FOR SELECT
  USING (is_active = true OR auth.uid() = user_id);
