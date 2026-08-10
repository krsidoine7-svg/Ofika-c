-- Fix explicit NEW.user_id::uuid cast for handle_order_status_notification PostgreSQL trigger
CREATE OR REPLACE FUNCTION public.handle_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
        RETURN NEW;
    END IF;

    BEGIN
        IF (NEW.status = 'paid') THEN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'payment_success', '✅ Paiement confirmé !', 'Votre paiement a été validé. Nous préparons votre carte.', NEW.id, '/dashboard/orders');
        ELSIF (NEW.status = 'preparing') THEN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'production_started', '🔨 En production', 'Votre carte NFC est en cours de fabrication.', NEW.id, '/dashboard/orders');
        ELSIF (NEW.status = 'shipped') THEN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'shipped', '🚚 Commande expédiée !', 'Votre carte est en route.', NEW.id, '/dashboard/orders');
        ELSIF (NEW.status = 'delivered') THEN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'delivered', '📦 Commande livrée !', 'Votre carte Ofika a été livrée !', NEW.id, '/dashboard/orders');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Notification trigger error: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
