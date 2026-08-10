-- Création de la table products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XOF',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insertion du produit par défaut
INSERT INTO public.products (name, type, price, currency, description)
VALUES ('Carte NFC + QR Code', 'nfc_qr', 7200, 'XOF', 'Carte complète avec technologie NFC et QR Code')
ON CONFLICT (type) DO UPDATE SET price = EXCLUDED.price;

-- Configuration RLS pour products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produits visibles par tous les utilisateurs authentifiés" 
ON public.products FOR SELECT 
TO authenticated 
USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Admins peuvent tout faire sur les produits"
ON public.products FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.role = 'admin'
    )
);


