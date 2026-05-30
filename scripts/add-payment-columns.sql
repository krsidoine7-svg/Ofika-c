-- Ajouter les colonnes pour le paiement Lygos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS lygos_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS lygos_payment_url TEXT;

-- Créer un index pour les requêtes sur l'ID de paiement
CREATE INDEX IF NOT EXISTS idx_orders_lygos_payment_id 
ON orders (lygos_payment_id);
 