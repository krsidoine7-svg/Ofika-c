import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizeRole, UserRole } from '@/lib/roles'
import { User } from '@supabase/supabase-js'
import { AuditService } from '@/lib/services/audit-service'

export interface StaffAuthResult {
  error: string | null
  status: number
  user: User | null
  role: UserRole | null
}

/**
 * Vérifie strictement côté serveur que la requête provient d'un utilisateur authentifié
 * ET que son rôle enregistré dans la table users correspond aux permissions requises.
 */
export async function requireStaffAuth(allowedRoles: UserRole[] = ['ADMIN', 'TECH']): Promise<StaffAuthResult> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Non authentifié. Veuillez vous connecter.', status: 401, user: null, role: null }
  }

  // 1. Accélération haute performance : si le rôle est déjà certifié dans app_metadata
  const metaRole = normalizeRole((user.app_metadata as any)?.role)
  if (allowedRoles.includes(metaRole)) {
    return { error: null, status: 200, user, role: metaRole }
  }

  // 2. Vérification de la source de vérité en base de données, avec repli sur app_metadata
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const rawRole = userData?.role || (user.app_metadata as any)?.role

  if (!rawRole) {
    return { error: 'Compte utilisateur introuvable ou rôle non configuré.', status: 403, user, role: null }
  }

  const role = normalizeRole(rawRole)

  if (!allowedRoles.includes(role)) {
    // Journaliser la tentative d'accès non autorisée
    AuditService.log({
      action: 'ACCESS_DENIED_403',
      targetType: 'security',
      targetId: user.id,
      severity: 'warning',
      actorId: user.id,
      actorEmail: user.email,
      details: {
        attemptedRole: role,
        requiredRoles: allowedRoles
      }
    }).catch(() => {})

    return { error: 'Accès refusé : privilèges insuffisants pour cette action.', status: 403, user, role }
  }

  return { error: null, status: 200, user, role }
}
