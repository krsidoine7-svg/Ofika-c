-- ========================================
-- ÉTAPE 7: CRÉATION DES TRIGGERS
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape crée les triggers pour automatiser certaines tâches

-- Trigger pour définir une image par défaut lors de la création d'utilisateur
CREATE TRIGGER trigger_set_default_user_image
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_user_image();

-- Trigger pour vérifier le maximum de cartes par utilisateur
CREATE TRIGGER trigger_check_max_cards
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION check_max_cards();

-- Appliquer le trigger updated_at sur toutes les tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_card_designs_updated_at
    BEFORE UPDATE ON card_designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_dashboard_widgets_updated_at
    BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vérification des triggers créés
SELECT 
    'Triggers Created' as status,
    COUNT(*) as trigger_count
FROM pg_trigger 
WHERE tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'dashboard_widgets')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

SELECT 'Étape 7 terminée: Triggers créés avec succès!' as final_status;
