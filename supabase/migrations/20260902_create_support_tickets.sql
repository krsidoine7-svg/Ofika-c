-- =====================================================
-- MIGRATION: TABLES SUPPORT_TICKETS & TICKET_MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('review', 'suggestion', 'bug', 'support')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    author_name TEXT,
    author_role TEXT,
    author_location TEXT,
    author_avatar_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer les recherches et tris
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_is_featured ON public.support_tickets(is_featured);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- Activer RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour support_tickets
DROP POLICY IF EXISTS "Public can view featured reviews" ON public.support_tickets;
CREATE POLICY "Public can view featured reviews"
    ON public.support_tickets FOR SELECT
    TO public
    USING (is_featured = true OR category = 'review');

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    TO authenticated
    USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    TO authenticated
    WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;
CREATE POLICY "Users can update their own tickets"
    ON public.support_tickets FOR UPDATE
    TO authenticated
    USING (user_id::text = auth.uid()::text);

-- Politiques RLS pour ticket_messages
DROP POLICY IF EXISTS "Users can view messages for their tickets" ON public.ticket_messages;
CREATE POLICY "Users can view messages for their tickets"
    ON public.ticket_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id::text = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can insert messages into their tickets" ON public.ticket_messages;
CREATE POLICY "Users can insert messages into their tickets"
    ON public.ticket_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id::text = auth.uid()::text
        )
    );

-- Accès complet pour l'admin & service_role
DROP POLICY IF EXISTS "Admins full access to support_tickets" ON public.support_tickets;
CREATE POLICY "Admins full access to support_tickets"
    ON public.support_tickets FOR ALL
    TO public
    USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Admins full access to ticket_messages" ON public.ticket_messages;
CREATE POLICY "Admins full access to ticket_messages"
    ON public.ticket_messages FOR ALL
    TO public
    USING ((auth.jwt() ->> 'role' IN ('admin', 'super_admin')));
