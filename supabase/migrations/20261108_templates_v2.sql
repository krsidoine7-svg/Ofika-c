-- =====================================================
-- Templates v2 : bascule des 11 anciens designs vers les 8 nouveaux
-- Date : 08/11/2026
--
-- - Chaque profil public qui utilise un ancien design passe sur le nouveau
--   template le plus proche (même correspondance que lib/templates/registry.ts).
-- - Ses couleurs personnalisées sont effacées : elles n'ont pas le même rôle
--   dans le nouveau design. L'utilisateur pourra les redéfinir.
-- - Ne touche QUE la table profiles (les cartes NFC utilisent aussi
--   "design1/design2" pour le visuel de la carte physique : on n'y touche pas).
--
-- Sans danger à relancer : les profils déjà migrés ne sont plus concernés.
-- =====================================================

BEGIN;

WITH mapping(old_id, new_id) AS (
  VALUES
    ('design1', 'editorial'), ('design-modern', 'editorial'), ('classic', 'editorial'),
    ('design2', 'bento'), ('design-glass', 'bento'), ('design3', 'bento'), ('design-neo', 'bento'),
    ('grid', 'bento'), ('creative', 'bento'),
    ('design4', 'organique'), ('design-minimal', 'organique'), ('premium', 'organique'),
    ('design-premium', 'organique'), ('showcase', 'organique'), ('nature', 'organique'),
    ('design7', 'noir_luxe'), ('design-bento', 'noir_luxe'), ('prestige', 'noir_luxe'),
    ('cjcd', 'noir_luxe'), ('dark', 'noir_luxe'),
    ('influencer', 'immersif'), ('design-influencer', 'immersif'), ('social_creator', 'immersif'),
    ('social-creator', 'immersif'), ('design-social', 'immersif'),
    ('ecommerce', 'boutique'), ('design-ecommerce', 'boutique'),
    ('freelance', 'suisse'), ('design-freelance', 'suisse')
)
UPDATE profiles p
SET
  design_choice  = m.new_id,
  theme_settings = COALESCE(p.theme_settings, '{}'::jsonb)
                   - 'primary_color' - 'secondary_color' - 'palette_id' - 'link_order',
  updated_at     = NOW()
FROM mapping m
WHERE p.design_choice = m.old_id;

-- Profils sans design ou avec un identifiant inconnu → Éditorial (template par défaut)
UPDATE profiles
SET
  design_choice  = 'editorial',
  theme_settings = COALESCE(theme_settings, '{}'::jsonb)
                   - 'primary_color' - 'secondary_color' - 'palette_id' - 'link_order',
  updated_at     = NOW()
WHERE design_choice IS NULL
   OR design_choice NOT IN ('editorial', 'carte', 'bento', 'noir_luxe', 'immersif', 'boutique', 'organique', 'suisse');

COMMIT;
