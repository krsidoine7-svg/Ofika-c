import { createClient } from '@/lib/supabase/client'

// =====================================================
// SERVICE WEBHOOK SIMPLE POUR MAKE.COM
// =====================================================

export class WebhookService {
  /**
   * Envoie des données simples au webhook Make.com
   */
  static async sendSimpleWebhook(tag: string, data: any, userId?: string, userEmail?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📡 Envoi webhook simple Make.com:', tag)

      const payload = {
        tag,
        timestamp: new Date().toISOString(),
        user_id: userId || 'anonymous',
        user_email: userEmail || 'no-email',
        data,
        app_name: 'Ofika',
        environment: process.env.NODE_ENV || 'development'
      }

      // Appel direct à notre API Route
      const response = await fetch('/api/webhooks/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur webhook:', response.status, errorText)
        return { success: false, error: `HTTP ${response.status}: ${errorText}` }
      }

      console.log('✅ Webhook simple envoyé avec succès:', tag)
      return { success: true }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du webhook simple:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

}

export class BusinessRulesService {
  private static supabase = createClient()

  /**
   * Vérifie si un utilisateur peut créer un nouveau profil
   * Contrainte : Maximum 3 profils par utilisateur
   */
  static async canCreateProfile(userId: string): Promise<{
    canCreate: boolean
    currentCount: number
    maxAllowed: number
    error?: string
  }> {
    try {
      const { data: profiles, error } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        return {
          canCreate: false,
          currentCount: 0,
          maxAllowed: 3,
          error: 'Erreur lors de la vérification des profils'
        }
      }

      const currentCount = profiles?.length || 0
      const maxAllowed = 3

      return {
        canCreate: currentCount < maxAllowed,
        currentCount,
        maxAllowed
      }
    } catch (error) {
      return {
        canCreate: false,
        currentCount: 0,
        maxAllowed: 3,
        error: 'Erreur lors de la vérification des contraintes métier'
      }
    }
  }

  /**
   * Vérifie si un profil peut ajouter un nouveau lien
   * Contrainte : Maximum 2 liens par profil
   */
  static async canAddLink(profileId: string): Promise<{
    canAdd: boolean
    currentCount: number
    maxAllowed: number
    error?: string
  }> {
    try {
      const { data: links, error } = await this.supabase
        .from('links')
        .select('id')
        .eq('profile_id', profileId)
        .eq('is_active', true)

      if (error) {
        return {
          canAdd: false,
          currentCount: 0,
          maxAllowed: 2,
          error: 'Erreur lors de la vérification des liens'
        }
      }

      const currentCount = links?.length || 0
      const maxAllowed = 2

      return {
        canAdd: currentCount < maxAllowed,
        currentCount,
        maxAllowed
      }
    } catch (error) {
      return {
        canAdd: false,
        currentCount: 0,
        maxAllowed: 2,
        error: 'Erreur lors de la vérification des contraintes métier'
      }
    }
  }

  /**
   * Vérifie si un utilisateur peut commander une nouvelle carte
   * Contrainte : Maximum 2 cartes par utilisateur
   */
  static async canOrderCard(userId: string): Promise<{
    canOrder: boolean
    currentCount: number
    maxAllowed: number
    error?: string
  }> {
    try {
      const { data: cards, error } = await this.supabase
        .from('cards')
        .select('id')
        .eq('user_id', userId)

      if (error) {
        return {
          canOrder: false,
          currentCount: 0,
          maxAllowed: 2,
          error: 'Erreur lors de la vérification des cartes'
        }
      }

      const currentCount = cards?.length || 0
      const maxAllowed = 2

      return {
        canOrder: currentCount < maxAllowed,
        currentCount,
        maxAllowed
      }
    } catch (error) {
      return {
        canOrder: false,
        currentCount: 0,
        maxAllowed: 2,
        error: 'Erreur lors de la vérification des contraintes métier'
      }
    }
  }

  /**
   * Vérifie l'unicité d'une URL personnalisée
   */
  static async isCustomUrlAvailable(
    customUrl: string, 
    excludeProfileId?: string
  ): Promise<{
    isAvailable: boolean
    error?: string
  }> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('id')
        .eq('custom_url', customUrl)
        .eq('is_active', true)

      if (excludeProfileId) {
        query = query.neq('id', excludeProfileId)
      }

      const { data, error } = await query

      if (error) {
        return {
          isAvailable: false,
          error: 'Erreur lors de la vérification de l\'URL'
        }
      }

      return {
        isAvailable: !data || data.length === 0
      }
    } catch (error) {
      return {
        isAvailable: false,
        error: 'Erreur lors de la vérification de l\'unicité'
      }
    }
  }

  /**
   * Vérifie l'unicité d'un nom d'utilisateur
   */
  static async isUsernameAvailable(
    username: string, 
    excludeProfileId?: string
  ): Promise<{
    isAvailable: boolean
    error?: string
  }> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .eq('is_active', true)

      if (excludeProfileId) {
        query = query.neq('id', excludeProfileId)
      }

      const { data, error } = await query

      if (error) {
        return {
          isAvailable: false,
          error: 'Erreur lors de la vérification du nom d\'utilisateur'
        }
      }

      return {
        isAvailable: !data || data.length === 0
      }
    } catch (error) {
      return {
        isAvailable: false,
        error: 'Erreur lors de la vérification de l\'unicité'
      }
    }
  }
}
