-- ========================================
-- ÉTAPE 2: CRÉATION DES INDEXES POUR LES PERFORMANCES
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape optimise les performances de la base de données

-- Index sur la table users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Index sur la table profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_facebook ON profiles(facebook) WHERE facebook IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_twitter ON profiles(twitter) WHERE twitter IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_website ON profiles(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_custom_links ON profiles USING GIN(custom_links);

-- Index sur la table links
CREATE INDEX IF NOT EXISTS idx_links_profile_id ON links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_order_index ON links(profile_id, order_index);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);

-- Index sur la table cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_profile_id ON cards(profile_id);
CREATE INDEX IF NOT EXISTS idx_cards_nfc_id ON cards(nfc_id);

-- Index sur la table orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Index sur la table payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider ON payment_methods(provider);

-- Index sur la table analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_date ON analytics_events(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Index sur la table dashboard_widgets
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_type ON dashboard_widgets(widget_type);

-- Vérification des index créés
SELECT 
    'Indexes Created' as status,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

SELECT 'Étape 2 terminée: Indexes créés avec succès!' as final_status;
