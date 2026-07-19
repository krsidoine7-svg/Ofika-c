-- Migration: Correction des politiques RLS SELECT/UPDATE pour pending_creations
-- Date: 2026-07-19

ALTER TABLE public.pending_creations ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture anonyme basée sur le session_id
DROP POLICY IF EXISTS "Enable select for creations" ON public.pending_creations;
CREATE POLICY "Enable select for creations" ON public.pending_creations
    FOR SELECT TO public USING (session_id IS NOT NULL);

-- Autoriser la mise à jour anonyme basée sur le session_id
DROP POLICY IF EXISTS "Enable update for creations" ON public.pending_creations;
CREATE POLICY "Enable update for creations" ON public.pending_creations
    FOR UPDATE TO public USING (session_id IS NOT NULL) WITH CHECK (session_id IS NOT NULL);
