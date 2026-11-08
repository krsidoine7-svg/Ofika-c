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

  // Vérification de la source de vérité en base de données
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !userData) {
    return { error: 'Compte utilisateur introuvable ou inactif.', status: 403, user, role: null }
  }

  const role = normalizeRole(userData.role)

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
