import { createClient } from '@/lib/supabase/server'

export type AuditAction = 
  | 'LOGIN_ADMIN'
  | 'IMPERSONATION_START'
  | 'IMPERSONATION_STOP'
  | 'USER_ROLE_UPDATE'
  | 'USER_DELETE'
  | 'ORDER_STATUS_UPDATE'
  | 'NFC_CARD_UPDATE'
  | 'SYSTEM_CONFIG_UPDATE'
  | 'ANNOUNCEMENT_CREATE'
  | 'ANNOUNCEMENT_UPDATE'
  | 'ANNOUNCEMENT_DELETE'
  | 'ANNOUNCEMENT_TOGGLE'
  | 'PROFILE_STATUS_UPDATE'
  | 'MODERATION_BAN'
  | 'MODERATION_UNBAN'

export interface AuditDetails {
  previousValue?: any
  newValue?: any
  reason?: string
  [key: string]: any
}

export class AuditService {
  /**
   * Enregistre une action administrative dans le journal d'audit
   */
  static async log({
    action,
    targetType,
    targetId,
    details = {}
  }: {
    action: AuditAction
    targetType: 'user' | 'order' | 'nfc_card' | 'profile' | 'system' | 'announcement' | 'link' | 'qr_redirect'
    targetId?: string
    details?: AuditDetails
  }) {
    try {
      const supabase = await createClient()
      
      // Récupérer l'admin actuel (celui qui fait l'action)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return { error: 'Admin not authenticated' }

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_id: user.id,
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          // Note: IP and UserAgent are better handled directly in API routes if needed
        }])

      if (error) {
        console.error('[AuditService] Update error:', error)
        return { error }
      }

      return { success: true }
    } catch (err) {
      console.error('[AuditService] Unexpected error:', err)
      return { error: err }
    }
  }
}
