-- Migration : Ajout des colonnes de suivi de paiement Wave dans la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS wave_payment_id TEXT,
ADD COLUMN IF NOT EXISTS wave_payment_url TEXT;

COMMENT ON COLUMN public.orders.wave_payment_id IS 'Identifiant ou référence de paiement Wave';
COMMENT ON COLUMN public.orders.wave_payment_url IS 'Lien de paiement Wave Direct généré';
