-- =====================================================
-- MODULE 5 : INTÉGRATION PAIEMENTS - SETUP COMPLET
-- =====================================================
-- Ce script configure complètement la base de données pour les paiements
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table des commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('nfc_qr', 'qr_only')),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0 AND quantity <= 2),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    lygos_payment_id VARCHAR(100),
    lygos_payment_url TEXT,
    payment_method_name VARCHAR(50),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table des méthodes de paiement
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    provider VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    icon_url TEXT,
    description TEXT,
    fees_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insérer les méthodes de paiement africaines
INSERT INTO public.payment_methods (name, provider, icon_url, description, fees_percentage) VALUES
('Orange Money', 'lygos', '/icons/orange-money.svg', 'Paiement mobile Orange Money', 2.5),
('MTN Money', 'lygos', '/icons/mtn-money.svg', 'Paiement mobile MTN Money', 2.5),
('Moov Money', 'lygos', '/icons/moov-money.svg', 'Paiement mobile Moov Money', 2.5),
('Wave', 'lygos', '/icons/wave.svg', 'Paiement mobile Wave', 1.0)
ON CONFLICT (name) DO UPDATE SET
    provider = EXCLUDED.provider,
    icon_url = EXCLUDED.icon_url,
    description = EXCLUDED.description,
    fees_percentage = EXCLUDED.fees_percentage;

-- 4. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_lygos_payment_id ON public.orders(lygos_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method_name);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Payment methods are public" ON public.payment_methods;

-- 7. Créer les nouvelles politiques RLS
-- Politique pour les commandes : utilisateurs peuvent voir/modifier leurs propres commandes
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour les méthodes de paiement : publiques si actives
CREATE POLICY "Payment methods are public" ON public.payment_methods
    FOR SELECT USING (is_active = true);

-- 8. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Créer une fonction pour vérifier la limite de cartes par utilisateur
CREATE OR REPLACE FUNCTION check_user_card_limit()
RETURNS TRIGGER AS $$
DECLARE
    existing_orders_count INTEGER;
BEGIN
    -- Compter les commandes payées de l'utilisateur
    SELECT COUNT(*) INTO existing_orders_count
    FROM public.orders
    WHERE user_id = NEW.user_id 
    AND status = 'paid';
    
    -- Vérifier la limite (2 cartes max)
    IF existing_orders_count >= 2 THEN
        RAISE EXCEPTION 'Limite de 2 cartes par utilisateur atteinte';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger seulement sur les nouvelles commandes
DROP TRIGGER IF EXISTS check_card_limit_trigger ON public.orders;
CREATE TRIGGER check_card_limit_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION check_user_card_limit();

-- 10. Créer une vue pour les statistiques des commandes
CREATE OR REPLACE VIEW public.order_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as total_revenue,
    ROUND(
        COUNT(CASE WHEN status = 'paid' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
        2
    ) as conversion_rate,
    DATE_TRUNC('month', created_at) as month
FROM public.orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 11. Créer une fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_order_stats(user_uuid UUID)
RETURNS TABLE (
    total_orders BIGINT,
    paid_orders BIGINT,
    pending_orders BIGINT,
    failed_orders BIGINT,
    cancelled_orders BIGINT,
    total_spent DECIMAL,
    can_order_more BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END), 0) as total_spent,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) < 2 as can_order_more
    FROM public.orders
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer une fonction pour nettoyer les commandes expirées (plus de 24h en pending)
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE public.orders 
    SET status = 'cancelled'
    WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Créer une fonction pour obtenir les statistiques de paiement par méthode
CREATE OR REPLACE FUNCTION get_payment_method_stats()
RETURNS TABLE (
    payment_method VARCHAR(50),
    total_orders BIGINT,
    successful_orders BIGINT,
    total_revenue DECIMAL,
    success_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.payment_method_name as payment_method,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN o.status = 'paid' THEN 1 END) as successful_orders,
        COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.total_price ELSE 0 END), 0) as total_revenue,
        ROUND(
            COUNT(CASE WHEN o.status = 'paid' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
            2
        ) as success_rate
    FROM public.orders o
    WHERE o.payment_method_name IS NOT NULL
    GROUP BY o.payment_method_name
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- 14. Créer une table pour les logs de webhook
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    order_id UUID REFERENCES public.orders(id),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les logs de webhook
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order_id ON public.webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at);

-- RLS pour les logs de webhook (admin seulement)
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 15. Créer des commentaires sur les tables
COMMENT ON TABLE public.orders IS 'Table des commandes de cartes NFC/QR avec intégration Lygos';
COMMENT ON TABLE public.payment_methods IS 'Méthodes de paiement disponibles (Orange Money, MTN, Moov, Wave)';
COMMENT ON TABLE public.webhook_logs IS 'Logs des webhooks reçus pour le suivi et le débogage';
COMMENT ON COLUMN public.orders.card_type IS 'Type de carte: nfc_qr ou qr_only';
COMMENT ON COLUMN public.orders.quantity IS 'Quantité (limité à 2 par utilisateur)';
COMMENT ON COLUMN public.orders.lygos_payment_id IS 'ID de paiement Lygos pour tracking';
COMMENT ON COLUMN public.orders.lygos_payment_url IS 'URL de paiement Lygos';
COMMENT ON COLUMN public.orders.payment_method_name IS 'Nom de la méthode de paiement utilisée';

-- 16. Créer des données de test (optionnel - à commenter en production)
-- INSERT INTO public.orders (user_id, card_type, quantity, unit_price, total_price, status, payment_method_name)
-- SELECT 
--     auth.uid(),
--     'nfc_qr',
--     1,
--     15000,
--     15000,
--     'paid',
--     'Orange Money'
-- WHERE auth.uid() IS NOT NULL;

-- 17. Afficher le statut de la création
SELECT 
    'Payment database setup completed successfully!' as status,
    NOW() as timestamp,
    'All tables, functions, and policies are ready for production use' as message;

-- 18. Vérifier que tout est bien créé
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payment_methods', 'webhook_logs')
ORDER BY table_name;
