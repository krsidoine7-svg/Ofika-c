-- =====================================================
-- CRÉATION DE LA TABLE NOTIFICATIONS
-- =====================================================

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'order_confirmed', 
    'payment_success', 
    'production_started', 
    'shipped', 
    'delivered', 
    'payment_failed'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- Créer la fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Activer RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Créer une fonction pour obtenir les statistiques des notifications
CREATE OR REPLACE FUNCTION get_user_notification_stats(user_uuid UUID)
RETURNS TABLE (
  total_notifications BIGINT,
  unread_notifications BIGINT,
  notifications_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = FALSE) as unread_notifications,
    jsonb_object_agg(type, type_count) as notifications_by_type
  FROM (
    SELECT 
      type,
      COUNT(*) as type_count
    FROM notifications 
    WHERE user_id = user_uuid
    GROUP BY type
  ) type_stats
  CROSS JOIN (
    SELECT COUNT(*) FROM notifications WHERE user_id = user_uuid
  ) total_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les notifications lues de plus de 30 jours
  DELETE FROM notifications 
  WHERE read = TRUE 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Supprimer toutes les notifications de plus de 90 jours
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur la table
COMMENT ON TABLE notifications IS 'Table des notifications utilisateur pour les commandes et paiements';
COMMENT ON COLUMN notifications.type IS 'Type de notification: order_confirmed, payment_success, production_started, shipped, delivered, payment_failed';
COMMENT ON COLUMN notifications.read IS 'Indique si la notification a été lue par l''utilisateur';
COMMENT ON COLUMN notifications.action_url IS 'URL d''action optionnelle pour la notification';
COMMENT ON COLUMN notifications.order_id IS 'ID de la commande associée (optionnel)';

-- Insérer des données de test (optionnel - à supprimer en production)
-- INSERT INTO notifications (user_id, type, title, message, order_id) VALUES
-- ('user-uuid-here', 'order_confirmed', 'Commande confirmée', 'Votre commande a été confirmée', 'order-uuid-here');

-- Vérifier que la table a été créée correctement
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;
