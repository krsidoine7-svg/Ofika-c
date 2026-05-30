-- ========================================
-- ÉTAPE 4: CRÉATION DES POLITIQUES RLS
-- ========================================
-- Copiez et collez ce script dans l'éditeur SQL de Supabase
-- Cette étape définit les règles de sécurité pour chaque table

-- POLITIQUES POUR LA TABLE USERS
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = id);

-- POLITIQUES POUR LA TABLE PROFILES
-- Lecture des profils publics (pour tous)
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT USING (is_public = true);

-- Lecture des profils privés (pour le propriétaire)
CREATE POLICY "profiles_private_read" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Insertion de nouveaux profils (pour les utilisateurs connectés)
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Mise à jour des profils (pour le propriétaire)
CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Suppression des profils (pour le propriétaire)
CREATE POLICY "profiles_delete" ON profiles
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- POLITIQUES POUR LA TABLE LINKS
CREATE POLICY "Links are viewable by profile owner" ON links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND (profiles.is_public = true OR profiles.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own links" ON links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = links.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- POLITIQUES POUR LA TABLE CARDS
CREATE POLICY "Users can manage their own cards" ON cards
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE CARD_DESIGNS
CREATE POLICY "Users can manage their own card designs" ON card_designs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cards 
            WHERE cards.id = card_designs.card_id 
            AND cards.user_id = auth.uid()
        )
    );

-- POLITIQUES POUR LA TABLE ORDERS
CREATE POLICY "Users can manage their own orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE PAYMENT_METHODS
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- POLITIQUES POUR LA TABLE ANALYTICS_EVENTS
-- Lecture pour les propriétaires de profils
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = analytics_events.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Insertion pour tous (pour tracker les vues)
CREATE POLICY "Anyone can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- POLITIQUES POUR LA TABLE DASHBOARD_WIDGETS
CREATE POLICY "Users can manage their own dashboard widgets" ON dashboard_widgets
    FOR ALL USING (auth.uid() = user_id);

-- Vérifier les politiques RLS créées
SELECT 
    'RLS Policies' as status,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'profiles', 'links', 'cards', 'card_designs', 'orders', 'payment_methods', 'analytics_events', 'dashboard_widgets')
GROUP BY tablename
ORDER BY tablename;

SELECT 'Étape 4 terminée: Politiques RLS créées avec succès!' as final_status;
