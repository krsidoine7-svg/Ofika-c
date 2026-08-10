-- Migration pour ajouter la configuration de paiement Wave Unique et le reçu de commande

-- 1. Ajouter la colonne receipt_url à la table orders pour stocker la capture d'écran du reçu
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 2. Insérer/mettre à jour la configuration Wave unique dans system_config
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('payment_gateways', '{
        "wave": {
            "is_active": true,
            "wave_merchant_id": "M_ci_8aqIEVzY9rYq",
            "wave_payment_link": "https://pay.wave.com/m/M_ci_8aqIEVzY9rYq",
            "whatsapp_number": "+2250503681588",
            "base_price": 14600,
            "currency": "XOF",
            "fees": 0
        }
    }'::jsonb, 'Configurations des passerelles de paiement (Wave Marchand Direct)')
ON CONFLICT (key) 
DO UPDATE SET 
    value = EXCLUDED.value, 
    description = EXCLUDED.description,
    updated_at = now();
