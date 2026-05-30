-- ========================================
-- TABLE CONTACT ANALYTICS
-- ========================================
-- Table pour tracker les actions liées aux contacts

-- Table Contact Analytics
CREATE TABLE IF NOT EXISTS contact_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('vcard_generated', 'vcard_downloaded', 'vcard_shared')),
    user_agent TEXT,
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'desktop')),
    ip_address INET,
    country VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_contact_analytics_profile_id ON contact_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_analytics_action_type ON contact_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_contact_analytics_created_at ON contact_analytics(created_at);

-- RLS Policies
ALTER TABLE contact_analytics ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres analytics
CREATE POLICY "Users can view own profile contact analytics" ON contact_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = contact_analytics.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Permettre l'insertion publique pour les analytics
CREATE POLICY "Public can insert contact analytics" ON contact_analytics
    FOR INSERT WITH CHECK (true);

-- Fonction pour obtenir les statistiques de contact d'un profil
CREATE OR REPLACE FUNCTION get_contact_stats(profile_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_generated', COUNT(*) FILTER (WHERE action_type = 'vcard_generated'),
        'total_downloaded', COUNT(*) FILTER (WHERE action_type = 'vcard_downloaded'),
        'total_shared', COUNT(*) FILTER (WHERE action_type = 'vcard_shared'),
        'device_breakdown', json_build_object(
            'mobile', COUNT(*) FILTER (WHERE device_type = 'mobile'),
            'desktop', COUNT(*) FILTER (WHERE device_type = 'desktop')
        ),
        'last_30_days', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'),
        'last_7_days', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')
    ) INTO result
    FROM contact_analytics
    WHERE profile_id = profile_uuid;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens analytics (plus de 1 an)
CREATE OR REPLACE FUNCTION cleanup_old_contact_analytics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM contact_analytics 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE contact_analytics IS 'Table pour tracker les actions liées aux contacts (génération, téléchargement, partage)';
COMMENT ON COLUMN contact_analytics.action_type IS 'Type d action: vcard_generated, vcard_downloaded, vcard_shared';
COMMENT ON COLUMN contact_analytics.device_type IS 'Type de device: mobile ou desktop';
COMMENT ON FUNCTION get_contact_stats(UUID) IS 'Fonction pour obtenir les statistiques de contact d un profil';
COMMENT ON FUNCTION cleanup_old_contact_analytics() IS 'Fonction pour nettoyer les anciens analytics (plus de 1 an)';
