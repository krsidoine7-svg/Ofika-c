-- Ajouter la ville et l'adresse à la table des utilisateurs
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ajouter la ville et l'adresse à la table des administrateurs pour la consistance
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Optionnel : Forcer la mise à jour du cache de schéma Supabase en rechargeant le cache PostgREST
NOTIFY pgrst, 'reload schema';
