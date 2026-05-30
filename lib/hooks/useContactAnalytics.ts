// =====================================================
// HOOK POUR LES ANALYTICS DE CONTACTS
// =====================================================

import { useState, useEffect, useCallback } from 'react'
import { ContactAnalytics, ContactAnalyticsStats, ContactAnalyticsFilters } from '@/lib/types/contact-analytics'
import { 
  trackContactAction, 
  getContactAnalyticsStats, 
  getContactAnalyticsHistory 
} from '@/lib/services/contact-analytics'

export function useContactAnalytics(profileId: string) {
  const [stats, setStats] = useState<ContactAnalyticsStats | null>(null)
  const [history, setHistory] = useState<ContactAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getContactAnalyticsStats(profileId)
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error || 'Erreur lors du chargement des statistiques')
      }
    } catch (err) {
      console.error('Error loading contact analytics stats:', err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  // Charger l'historique
  const loadHistory = useCallback(async (filters?: ContactAnalyticsFilters) => {
    try {
      setError(null)
      
      const response = await getContactAnalyticsHistory(profileId, filters)
      
      if (response.success && response.data) {
        setHistory(response.data)
      } else {
        setError(response.error || 'Erreur lors du chargement de l\'historique')
      }
    } catch (err) {
      console.error('Error loading contact analytics history:', err)
      setError('Erreur lors du chargement de l\'historique')
    }
  }, [profileId])

  // Enregistrer une action
  const trackAction = useCallback(async (
    actionType: ContactAnalytics['action_type'],
    userAgent?: string,
    deviceType?: ContactAnalytics['device_type']
  ) => {
    try {
      const response = await trackContactAction(profileId, actionType, userAgent, deviceType)
      
      if (response.success) {
        // Recharger les statistiques après une nouvelle action
        await loadStats()
        return true
      } else {
        console.error('Error tracking action:', response.error)
        return false
      }
    } catch (err) {
      console.error('Error in trackAction:', err)
      return false
    }
  }, [profileId, loadStats])

  // Charger les données au montage
  useEffect(() => {
    if (profileId) {
      loadStats()
      loadHistory()
    }
  }, [profileId]) // Simplification des dépendances

  return {
    stats,
    history,
    loading,
    error,
    trackAction,
    refreshStats: loadStats,
    refreshHistory: loadHistory
  }
}

// Hook pour une action spécifique
export function useTrackContactAction() {
  const [isTracking, setIsTracking] = useState(false)

  const trackAction = useCallback(async (
    profileId: string,
    actionType: ContactAnalytics['action_type'],
    userAgent?: string,
    deviceType?: ContactAnalytics['device_type']
  ) => {
    try {
      setIsTracking(true)
      
      const response = await trackContactAction(profileId, actionType, userAgent, deviceType)
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Error tracking contact action:', error)
      return { success: false, error: 'Erreur lors de l\'enregistrement de l\'action' }
    } finally {
      setIsTracking(false)
    }
  }, [])

  return {
    trackAction,
    isTracking
  }
}