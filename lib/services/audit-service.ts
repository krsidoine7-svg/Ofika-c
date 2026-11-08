import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export type AuditAction = 
  | 'LOGIN_ADMIN'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'ACCESS_DENIED_403'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PRICE_TAMPER_ATTEMPT'
  | 'MFA_CHALLENGE_SUCCESS'
  | 'MFA_CHALLENGE_FAILED'
  | 'MFA_ENROLL_SUCCESS'
  | 'IMPERSONATION_START'
  | 'IMPERSONATION_STOP'
  | 'USER_ROLE_UPDATE'
  | 'USER_DELETE'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_CREATE'
  | 'NFC_CARD_UPDATE'
  | 'SYSTEM_CONFIG_UPDATE'
  | 'ANNOUNCEMENT_CREATE'
  | 'ANNOUNCEMENT_UPDATE'
  | 'ANNOUNCEMENT_DELETE'
  | 'ANNOUNCEMENT_TOGGLE'
  | 'PROFILE_STATUS_UPDATE'
  | 'MODERATION_BAN'
  | 'MODERATION_UNBAN'

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AuditDetails {
  previousValue?: any
  newValue?: any
  reason?: string
  [key: string]: any
}

export interface LogParams {
  action: AuditAction
  targetType: 'user' | 'order' | 'nfc_card' | 'profile' | 'system' | 'announcement' | 'link' | 'qr_redirect' | 'security' | 'auth'
  targetId?: string
  details?: AuditDetails
  severity?: AuditSeverity
  actorId?: string
  actorEmail?: string
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  /**
   * Enregistre un événement administratif ou de sécurité dans le journal d'audit
   */
  static async log({
    action,
    targetType,
    targetId,
    details = {},
    severity = 'info',
    actorId,
    actorEmail,
    ipAddress,
    userAgent
  }: LogParams) {
    try {
      let finalAdminId = actorId
      let finalUserEmail = actorEmail

      // Si l'auteur n'est pas fourni, tenter de récupérer l'utilisateur connecté
      if (!finalAdminId) {
        try {
          const supabase = await createServerClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            finalAdminId = user.id
            finalUserEmail = user.email
          }
        } catch {}
      }

      // Utiliser le client admin (service role) pour garantir l'écriture
      // même sans session active (ex: tentatives d'accès non autorisées, échecs de login)
      const adminSupabase = createAdminClient()

      const logRecord: Record<string, any> = {
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        severity,
        created_at: new Date().toISOString()
      }

      if (finalAdminId) logRecord.admin_id = finalAdminId
      if (finalUserEmail) logRecord.user_email = finalUserEmail
      if (ipAddress) logRecord.ip_address = ipAddress
      if (userAgent) logRecord.user_agent = userAgent

      const { error } = await adminSupabase
        .from('admin_audit_logs')
        .insert([logRecord])

      if (error) {
        console.error('[AuditService] Insert error:', error)
        return { error }
      }

      return { success: true }
    } catch (err) {
      console.error('[AuditService] Unexpected error:', err)
      return { error: err }
    }
  }
}
