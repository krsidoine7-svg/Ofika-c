-- Ajout de la politique INSERT pour pricing_config
-- Nécessaire pour l'initialisation de la configuration par un admin depuis l'interface

CREATE POLICY "Only admins can insert pricing config"
  ON pricing_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.subscription_tier = 'admin'
    )
  );
