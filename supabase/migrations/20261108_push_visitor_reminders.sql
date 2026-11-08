-- =====================================================
-- Rappel visiteur unique (08/11/2026)
-- Un visiteur qui enregistre le contact d'un profil peut demander UN rappel :
-- remind_at = quand l'envoyer, reminded_at = quand il a été envoyé (une seule fois).
-- Sans danger à relancer.
-- =====================================================

ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS remind_at   timestamptz;
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS reminded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_due_reminders
  ON public.push_subscriptions (remind_at)
  WHERE user_id IS NULL AND reminded_at IS NULL;
