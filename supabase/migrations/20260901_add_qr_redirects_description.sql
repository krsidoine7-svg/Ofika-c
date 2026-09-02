-- Migration pour ajouter la colonne description manquante sur public.qr_redirects
ALTER TABLE public.qr_redirects 
ADD COLUMN IF NOT EXISTS description TEXT;
