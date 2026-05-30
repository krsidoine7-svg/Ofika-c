-- Table pour les annonces système
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error', 'promo'
    target_audience TEXT DEFAULT 'all', -- 'all', 'free', 'pro'
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Sécurité RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les annonces actives
CREATE POLICY "Anyone can view active announcements"
ON public.announcements
FOR SELECT
TO authenticated, anon
USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
);

-- Politique : Seuls les admins peuvent gérer les annonces
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Index
CREATE INDEX idx_announcements_active ON public.announcements (is_active, expires_at);
