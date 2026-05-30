-- Création de la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    action_url TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation de RLS sur les notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour les notifications
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Fonction pour créer une notification automatique lors du changement de statut d'une commande
CREATE OR REPLACE FUNCTION public.handle_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Ne rien faire si le statut n'a pas changé
    IF (OLD.status = NEW.status) THEN
        RETURN NEW;
    END IF;

    -- Logique de notification selon le statut
    IF (NEW.status = 'paid') THEN
        INSERT INTO public.notifications (user_id, type, title, message, order_id, action_url)
        VALUES (NEW.user_id, 'payment_success', 'Paiement confirmé !', 'Votre paiement a été validé. Nous préparons votre carte.', NEW.id, '/dashboard/orders');
    
    ELSIF (NEW.status = 'preparing') THEN
        INSERT INTO public.notifications (user_id, type, title, message, order_id, action_url)
        VALUES (NEW.user_id, 'production_started', 'En production', 'Votre carte NFC personnalisée est en cours de fabrication.', NEW.id, '/dashboard/orders');
    
    ELSIF (NEW.status = 'shipped') THEN
        INSERT INTO public.notifications (user_id, type, title, message, order_id, action_url)
        VALUES (NEW.user_id, 'shipped', 'Commande expédiée !', 'Bonne nouvelle ! Votre carte est en route vers l''adresse indiquée.', NEW.id, '/dashboard/orders');
    
    ELSIF (NEW.status = 'delivered') THEN
        INSERT INTO public.notifications (user_id, type, title, message, order_id, action_url)
        VALUES (NEW.user_id, 'delivered', 'Commande livrée', 'Votre carte Ofika a été livrée. Profitez bien de votre nouveau réseau !', NEW.id, '/dashboard/orders');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour déclencher la fonction lors d'une mise à jour de la table orders
DROP TRIGGER IF EXISTS on_order_status_update ON public.orders;
CREATE TRIGGER on_order_status_update
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_order_status_notification();

-- Publication pour le temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
