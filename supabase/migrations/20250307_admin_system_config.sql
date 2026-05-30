-- Table de configuration système (KV Store)
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire (utilisé pour les prix, thèmes public, etc.)
CREATE POLICY "Public can view system config"
ON public.system_config
FOR SELECT
TO authenticated, anon
USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Admins can manage system config"
ON public.system_config
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Seed initial
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('pricing_plans', '{
        "free": {"price": 0, "profiles_limit": 1},
        "pro": {"price": 15000, "profiles_limit": 10, "nfc_enabled": true}
    }'::jsonb, 'Configuration des paliers de prix et limites'),
    ('platform_settings', '{
        "maintenance_mode": false,
        "contact_email": "support@ofika.com",
        "primary_color": "#f97316"
    }'::jsonb, 'Paramètres généraux de la plateforme')
ON CONFLICT (key) DO NOTHING;
