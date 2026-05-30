// =====================================================
// HOOK REACT POUR LE RESET AUTOMATIQUE DES STATS
// =====================================================

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  autoResetStatsIfNeeded,
  getStatsResetInfo,
  type StatsResetStatus
} from '@/lib/services/stats-reset'
import { toast } from 'sonner'

export interface StatsResetInfo {
  lastResetDate: string
  daysSinceReset: number
  daysUntilNextReset: number
  nextResetDate: string
  resetCycleProgress: number
}

/**
 * Hook pour gérer le reset automatique des statistiques
 * Vérifie au chargement du composant si un reset est nécessaire
 */
export function useStatsAutoReset() {
  const { user } = useAuth()
  const [checking, setChecking] = useState(false)
  const [resetPerformed, setResetPerformed] = useState(false)
  const [resetInfo, setResetInfo] = useState<StatsResetInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const checkAndReset = async () => {
      setChecking(true)
      setError(null)

      try {
        // Vérifier et effectuer le reset si nécessaire
        const result = await autoResetStatsIfNeeded(user.id)

        if (!result.success) {
          setError(result.error || 'Erreur lors de la vérification')
          return
        }

        // Si un reset a été effectué, afficher une notification
        if (result.resetPerformed) {
          setResetPerformed(true)
          toast.success('📊 Statistiques réinitialisées', {
            description: 'Vos statistiques ont été automatiquement réinitialisées après 40 jours.',
            duration: 5000
          })
          console.log('✅ Stats auto-reset effectué:', result.message)
        }

        // Récupérer les infos de reset pour l'affichage
        const infoResult = await getStatsResetInfo(user.id)
        if (infoResult.success && infoResult.data) {
          setResetInfo(infoResult.data)
        }
      } catch (err) {
        console.error('Erreur dans useStatsAutoReset:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setChecking(false)
      }
    }

    checkAndReset()
  }, [user?.id])

  return {
    checking,
    resetPerformed,
    resetInfo,
    error
  }
}

/**
 * Hook léger pour afficher uniquement les informations de reset
 * Sans déclencher le reset automatique
 */
export function useStatsResetInfo() {
  const { user } = useAuth()
  const [resetInfo, setResetInfo] = useState<StatsResetInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const fetchInfo = async () => {
      setLoading(true)
      try {
        const result = await getStatsResetInfo(user.id)
        if (result.success && result.data) {
          setResetInfo(result.data)
        }
      } catch (err) {
        console.error('Erreur dans useStatsResetInfo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInfo()
  }, [user?.id])

  return {
    resetInfo,
    loading
  }
}
