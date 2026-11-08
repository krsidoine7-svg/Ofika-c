import { SupabaseClient } from '@supabase/supabase-js'
import { isStaffRole, normalizeRole } from '@/lib/roles'

export interface StaffMfaStatus {
  isStaff: boolean
  isEnrolled: boolean
  isVerified: boolean
  factorId?: string
  currentLevel?: string | null
  nextLevel?: string | null
}

/**
 * Analyse le statut MFA (Double Authentification TOTP) de l'utilisateur courant.
 * Permet de déterminer si le membre du personnel (ADMIN ou TECH) doit s'enrôler
 * ou valider son défi 2FA avant d'accéder aux fonctionnalités critiques.
 */
export async function getStaffMfaStatus(supabase: SupabaseClient): Promise<StaffMfaStatus> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { isStaff: false, isEnrolled: false, isVerified: false }
  }

  // 1. Déterminer si l'utilisateur est Staff (ADMIN ou TECH)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = normalizeRole(userData?.role || user.app_metadata?.role)
  const isStaff = isStaffRole(role)

  if (!isStaff) {
    return { isStaff: false, isEnrolled: false, isVerified: false }
  }

  // 2. Vérifier les facteurs TOTP enregistrés
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  if (factorsError || !factors) {
    return { isStaff: true, isEnrolled: false, isVerified: false }
  }

  const verifiedFactor = factors.totp.find(f => f.status === 'verified')
  const isEnrolled = !!verifiedFactor

  // 3. Vérifier le niveau d'assurance actuel (aal1 vs aal2)
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const isVerified = aalData?.currentLevel === 'aal2'

  return {
    isStaff: true,
    isEnrolled,
    isVerified,
    factorId: verifiedFactor?.id,
    currentLevel: aalData?.currentLevel,
    nextLevel: aalData?.nextLevel
  }
}
