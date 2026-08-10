-- ÉTAPE 1: Création de la table `geniuspay_webhook_events` pour l'idempotence
CREATE TABLE IF NOT EXISTS public.geniuspay_webhook_events (
  id VARCHAR(100) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Activation RLS sur la table geniuspay_webhook_events (accès uniquement via service_role / serveur)
ALTER TABLE public.geniuspay_webhook_events ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Complétion de la table `orders` existante
-- La table possède déjà payment_method, payment_status, payment_reference, currency, total_amount, etc.
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS fees DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
