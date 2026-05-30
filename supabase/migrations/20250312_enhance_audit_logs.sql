-- Ajout de la colonne severity pour filtrer les logs
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info'; -- 'info', 'warning', 'error'
ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS user_email TEXT; -- Pour faciliter l'affichage sans jointures complexes
