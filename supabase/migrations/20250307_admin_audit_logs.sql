-- Création de la table pour le journal d'audit administratif
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'user', 'order', 'nfc_card', 'profile', 'system'
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Activation de la sécurité RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les administrateurs peuvent voir les logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Politique : Système/Admins peuvent insérer des logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Index pour la performance des recherches
CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_admin_id ON public.admin_audit_logs (admin_id);
CREATE INDEX idx_audit_logs_target ON public.admin_audit_logs (target_type, target_id);

-- Fonction pour automatiser certains logs (optionnel, on privilégiera l'API pour plus de contexte)
COMMENT ON TABLE public.admin_audit_logs IS 'Table de traçabilité des actions administratives sensibles.';
