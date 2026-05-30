-- =====================================================
-- MODULE 5 : INTÉGRATION PAIEMENTS - BASE DE DONNÉES
-- =====================================================

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table des méthodes de paiement
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insérer les méthodes de paiement africaines
INSERT INTO public.payment_methods (name, provider, icon_url) VALUES
('Orange Money', 'lygos', '/icons/orange-money.svg'),
('MTN Money', 'lygos', '/icons/mtn-money.svg'),
('Moov Money', 'lygos', '/icons/moov-money.svg'),
('Wave', 'lygos', '/icons/wave.svg')
ON CONFLICT (name) DO NOTHING;

-- 4. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_lygos_payment_id ON public.orders(lygos_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
-- Politique pour les commandes : utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

-- Politique pour les méthodes de paiement : publiques si actives
CREATE POLICY "Payment methods are public" ON public.payment_methods
    FOR SELECT USING (is_active = true);

-- 7. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Créer une fonction pour vérifier la limite de cartes par utilisateur
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
CREATE TRIGGER check_card_limit_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION check_user_card_limit();

-- 9. Créer une vue pour les statistiques des commandes
CREATE OR REPLACE VIEW public.order_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
    SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as total_revenue,
    ROUND(
        COUNT(CASE WHEN status = 'paid' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as conversion_rate
FROM public.orders;

-- 10. Créer une fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_order_stats(user_uuid UUID)
RETURNS TABLE (
    total_orders BIGINT,
    paid_orders BIGINT,
    pending_orders BIGINT,
    failed_orders BIGINT,
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
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END), 0) as total_spent,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) < 2 as can_order_more
    FROM public.orders
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer une fonction pour nettoyer les commandes expirées (plus de 24h en pending)
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.orders
    WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer un commentaire sur les tables
COMMENT ON TABLE public.orders IS 'Table des commandes de cartes NFC/QR avec intégration Lygos';
COMMENT ON TABLE public.payment_methods IS 'Méthodes de paiement disponibles (Orange Money, MTN, Moov, Wave)';
COMMENT ON COLUMN public.orders.card_type IS 'Type de carte: nfc_qr ou qr_only';
COMMENT ON COLUMN public.orders.quantity IS 'Quantité (limité à 2 par utilisateur)';
COMMENT ON COLUMN public.orders.lygos_payment_id IS 'ID de paiement Lygos pour tracking';
COMMENT ON COLUMN public.orders.lygos_payment_url IS 'URL de paiement Lygos';

-- 13. Afficher le statut de la création
SELECT 
    'Payment database setup completed successfully!' as status,
    NOW() as timestamp,
    'Tables orders and payment_methods are ready for use' as message;
