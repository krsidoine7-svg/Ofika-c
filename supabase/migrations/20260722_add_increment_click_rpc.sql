-- Fonction RPC pour incrémenter le compteur de clics de manière sécurisée
-- SECURITY DEFINER permet à la fonction de s'exécuter avec les privilèges de son créateur (postgres)
-- Cela permet aux utilisateurs anonymes d'incrémenter le compteur même si RLS bloque les UPDATE directs.

CREATE OR REPLACE FUNCTION public.increment_link_click(link_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Incrémenter le compteur seulement si le lien existe
  UPDATE public.links
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    updated_at = NOW()
  WHERE id = link_uuid;
END;
$$;

-- Assurez-vous que les utilisateurs anonymes et authentifiés peuvent appeler cette fonction
GRANT EXECUTE ON FUNCTION public.increment_link_click(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_link_click(UUID) TO authenticated;
