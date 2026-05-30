-- ============================================================================
-- Migration : Renommage des designs NFC (design2 → design1, design3 → design2)
-- Objectif   : Uniformiser les noms de designs dans toute l'application
-- Date       : 2025-11-21
-- ============================================================================

-- 1) Renommer design3 → design2 (d'abord pour éviter les conflits)
UPDATE public.nfc_profiles
SET design_choice = 'design2'
WHERE design_choice = 'design3';

-- 2) Renommer design2 → design1
UPDATE public.nfc_profiles
SET design_choice = 'design1'
WHERE design_choice = 'design2';

-- 3) Mettre à jour la valeur par défaut
ALTER TABLE public.nfc_profiles
  ALTER COLUMN design_choice SET DEFAULT 'design1';

-- 4) Normaliser les valeurs NULL ou vides
UPDATE public.nfc_profiles
SET design_choice = 'design1'
WHERE design_choice IS NULL
   OR design_choice = '';

-- 5) (Optionnel) Vérifier qu'il ne reste plus d'anciennes valeurs
-- SELECT DISTINCT design_choice FROM public.nfc_profiles;

