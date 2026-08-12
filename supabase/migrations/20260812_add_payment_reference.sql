-- Ajout de la colonne payment_reference manquante
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
