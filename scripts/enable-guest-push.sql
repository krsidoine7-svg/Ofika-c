-- =====================================================
-- MIGRATION : PUSH NOTIFICATIONS POUR INVITÉS (GUESTS)
-- =====================================================

-- 1. Autoriser le user_id à être NULL (pour les invités)
ALTER TABLE public.push_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ajouter une colonne pour identifier le profil concerné par le rappel
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='push_subscriptions' AND column_name='target_profile_id') THEN
        ALTER TABLE public.push_subscriptions ADD COLUMN target_profile_id TEXT;
    END IF;
END $$;

-- 3. Mettre à jour les politiques RLS pour permettre aux VISITEURS (anon) d'enregistrer leur abonnement
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Public can insert push subscriptions" ON public.push_subscriptions
    FOR INSERT WITH CHECK (true);

-- 4. Permettre la mise à jour par l'endpoint (cas de renouvellement du token)
DROP POLICY IF EXISTS "Public can update push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Public can update push subscriptions" ON public.push_subscriptions
    FOR UPDATE USING (true);

-- 5. Index pour les performances lors des rappels
CREATE INDEX IF NOT EXISTS idx_push_subs_target_profile ON public.push_subscriptions(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);
