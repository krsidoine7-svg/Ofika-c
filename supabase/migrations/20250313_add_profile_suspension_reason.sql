-- Ajout de la colonne pour la raison de suspension sur les profils
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Commentaire pour la documentation
COMMENT ON COLUMN public.profiles.suspension_reason IS 'Raison de la suspension du profil par un administrateur';
