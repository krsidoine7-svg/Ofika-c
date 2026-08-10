-- Migration : Remplacement de lygos_payment_url par wave_payment_url dans la table orders
ALTER TABLE public.orders RENAME COLUMN lygos_payment_url TO wave_payment_url;
