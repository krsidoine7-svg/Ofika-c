-- ============================================================================
-- Migration : Suppression du design NFC hérité "design1/classic"
-- Objectif   : forcer les nouvelles cartes à utiliser les designs 2 ou 3
-- Date       : 2025-11-21
-- ============================================================================

-- 1) Mettre à jour la valeur par défaut utilisée lors de la création d'une carte
ALTER TABLE public.nfc_profiles
  ALTER COLUMN design_choice SET DEFAULT 'design2';

-- 2) Normaliser les enregistrements existants encore basés sur l'ancien design
UPDATE public.nfc_profiles
SET design_choice = 'design2'
WHERE design_choice IS NULL
   OR design_choice = ''
   OR design_choice IN ('classic', 'design1');

-- (Optionnel) vous pouvez aussi décider de convertir les anciens alias "creative"
-- vers "design3" si nécessaire :
-- UPDATE public.nfc_profiles
-- SET design_choice = 'design3'
-- WHERE design_choice = 'creative';

-- 3) (Facultatif) Mettre à jour la documentation / Drizzle après exécution :
--    npx drizzle-kit generate


