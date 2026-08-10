-- Correctif pour caster NEW.user_id::uuid lors des notifications de statut de commande
CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notification paiement réussi
    IF (NEW.payment_status = 'paid' OR NEW.payment_status = 'succeeded') 
       AND (OLD.payment_status IS NULL OR (OLD.payment_status != 'paid' AND OLD.payment_status != 'succeeded')) THEN
        BEGIN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'payment_success', 'Paiement confirmé !', 'Votre paiement a été validé. Nous préparons votre carte.', NEW.id, '/dashboard/orders');
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Notification error: %', SQLERRM;
        END;
    END IF;

    -- Notification préparation
    IF NEW.shipping_status = 'preparing' 
       AND (OLD.shipping_status IS NULL OR OLD.shipping_status != 'preparing') THEN
        BEGIN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'production_started', 'En production', 'Votre carte NFC personnalisée est en cours de fabrication.', NEW.id, '/dashboard/orders');
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Notification error: %', SQLERRM;
        END;
    END IF;

    -- Notification expédiée
    IF NEW.shipping_status = 'shipped' 
       AND (OLD.shipping_status IS NULL OR OLD.shipping_status != 'shipped') THEN
        BEGIN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'shipped', 'Commande expédiée !', 'Bonne nouvelle ! Votre carte est en route vers l''adresse indiquée.', NEW.id, '/dashboard/orders');
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Notification error: %', SQLERRM;
        END;
    END IF;

    -- Notification livrée
    IF NEW.shipping_status = 'delivered' 
       AND (OLD.shipping_status IS NULL OR OLD.shipping_status != 'delivered') THEN
        BEGIN
            INSERT INTO public.notifications (user_id, type, title, message, reference_id, link)
            VALUES (NEW.user_id::uuid, 'delivered', 'Commande livrée', 'Votre carte Ofika a été livrée. Profitez bien de votre nouveau réseau !', NEW.id, '/dashboard/orders');
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Notification error: %', SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
