-- =====================================================
-- À EXÉCUTER UNE FOIS dans Supabase → SQL Editor (ou via `supabase db query --linked -f`)
-- Regroupe, dans le bon ordre :
--   1. migrations/20260810_add_theme_settings.sql  (colonne des couleurs personnalisées)
--   2. migrations/20261108_templates_v2.sql        (bascule des anciens templates vers les 8 nouveaux)
-- Sans danger à relancer.
-- =====================================================

BEGIN;

-- 1. Colonne des couleurs personnalisées
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{}'::jsonb;

-- 2. Bascule des anciens designs → nouveau template le plus proche, couleurs effacées
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

UPDATE profiles
SET
  design_choice  = 'editorial',
  theme_settings = COALESCE(theme_settings, '{}'::jsonb)
                   - 'primary_color' - 'secondary_color' - 'palette_id' - 'link_order',
  updated_at     = NOW()
WHERE design_choice IS NULL
   OR design_choice NOT IN ('editorial', 'carte', 'bento', 'noir_luxe', 'immersif', 'boutique', 'organique', 'suisse');

COMMIT;

-- Vérification : doit lister uniquement les 8 nouveaux templates
SELECT design_choice, COUNT(*) AS nb_profils FROM profiles GROUP BY design_choice ORDER BY nb_profils DESC;
