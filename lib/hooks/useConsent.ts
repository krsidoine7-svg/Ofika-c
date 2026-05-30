'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserConsent, ConsentUpdateData, ConsentPreferences } from '@/lib/types/consent'
import { useAuth } from '@/lib/hooks/useAuth'

export function useConsent() {
  const { user } = useAuth()
  const [consent, setConsent] = useState<UserConsent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Charger les consentements de l'utilisateur
  const loadConsent = useCallback(async () => {
    if (!user) {
      setConsent(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          consent_essential,
          consent_analytics,
          consent_marketing,
          consent_data_processing,
          consent_updated_at,
          consent_version
        `)
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setConsent({
          essential: data.consent_essential ?? true,
          analytics: data.consent_analytics ?? false,
          marketing: data.consent_marketing ?? false,
          dataProcessing: data.consent_data_processing ?? false,
          updatedAt: data.consent_updated_at ?? new Date().toISOString(),
          version: data.consent_version ?? '1.0'
        })
      }
    } catch (err) {
      console.error('Erreur lors du chargement des consentements:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Mettre à jour les consentements
  const updateConsent = useCallback(async (newConsent: Partial<UserConsent>) => {
    if (!user) {
      setError('Utilisateur non connecté')
      return { success: false, error: 'Utilisateur non connecté' }
    }

    try {
      setError(null)

      const updateData: ConsentUpdateData = {
        consent_essential: newConsent.essential,
        consent_analytics: newConsent.analytics,
        consent_marketing: newConsent.marketing,
        consent_data_processing: newConsent.dataProcessing,
        consent_updated_at: new Date().toISOString(),
        consent_version: '1.0'
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Mettre à jour l'état local
      setConsent(prev => prev ? { ...prev, ...newConsent } : null)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [user, supabase])

  // Obtenir les préférences de consentement
  const getConsentPreferences = useCallback((): ConsentPreferences => {
    if (!consent) {
      return {
        canReceiveAnalytics: false,
        canReceiveMarketing: false,
        canProcessCardData: false,
        hasGivenEssentialConsent: false
      }
    }

    return {
      canReceiveAnalytics: consent.analytics,
      canReceiveMarketing: consent.marketing,
      canProcessCardData: consent.dataProcessing,
      hasGivenEssentialConsent: consent.essential
    }
  }, [consent])

  // Vérifier si l'utilisateur peut créer une carte NFC
  const canCreateCard = useCallback((): boolean => {
    if (!consent) return false
    return consent.essential && consent.dataProcessing
  }, [consent])

  // Vérifier si l'utilisateur peut recevoir des analytics
  const canTrackAnalytics = useCallback((): boolean => {
    if (!consent) return false
    return consent.essential && consent.analytics
  }, [consent])

  // Vérifier si l'utilisateur peut recevoir du marketing
  const canReceiveMarketing = useCallback((): boolean => {
    if (!consent) return false
    return consent.essential && consent.marketing
  }, [consent])

  // Charger les consentements au montage
  useEffect(() => {
    loadConsent()
  }, [loadConsent])

  return {
    consent,
    loading,
    error,
    updateConsent,
    getConsentPreferences,
    canCreateCard,
    canTrackAnalytics,
    canReceiveMarketing,
    refreshConsent: loadConsent
  }
}
