/**
 * Hook personnalisé pour récupérer les analytics du dashboard
 * Récupère le total de scans de tous les profils de l'utilisateur
 * Version corrigée avec logs et stabilité améliorée
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardAnalytics {
  totalScans: number
  totalViews: number
  totalClicks: number
  loading: boolean
  error: string | null
}

// Cache mémoire global (TTL 60s) pour éviter de scanner la table analytics_events à chaque navigation
const dashboardAnalyticsCache = new Map<string, { data: { totalScans: number; totalViews: number; totalClicks: number }; timestamp: number }>()
const CACHE_TTL = 60000

export function useDashboardAnalytics(profileIds: string[]) {
  const cacheKey = profileIds.sort().join(',')
  const cached = cacheKey ? dashboardAnalyticsCache.get(cacheKey) : null
  const hasFreshCache = !!(cached && (Date.now() - cached.timestamp < CACHE_TTL))

  const [analytics, setAnalytics] = useState<DashboardAnalytics>(() => ({
    totalScans: hasFreshCache && cached ? cached.data.totalScans : 0,
    totalViews: hasFreshCache && cached ? cached.data.totalViews : 0,
    totalClicks: hasFreshCache && cached ? cached.data.totalClicks : 0,
    loading: !hasFreshCache && profileIds.length > 0,
    error: null
  }))

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profileIds || profileIds.length === 0) {
        setAnalytics({
          totalScans: 0,
          totalViews: 0,
          totalClicks: 0,
          loading: false,
          error: null
        })
        return
      }

      // Utiliser le cache si frais
      const currentCached = dashboardAnalyticsCache.get(cacheKey)
      if (currentCached && (Date.now() - currentCached.timestamp < CACHE_TTL)) {
        setAnalytics({
          ...currentCached.data,
          loading: false,
          error: null
        })
        return
      }

      try {
        const supabase = createClient()
        
        // Récupérer tous les événements analytics pour les profils de l'utilisateur
        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('event_type, profile_id, created_at')
          .in('profile_id', profileIds)

        if (error) {
          setAnalytics(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }))
          return
        }

        // Calculer les totaux
        const totalViews = events?.filter(e => e.event_type === 'profile_viewed').length || 0
        const totalClicks = events?.filter(e => e.event_type === 'link_clicked').length || 0
        const totalScans = events?.filter(e => e.event_type === 'qr_scanned').length || 0

        const calculated = { totalScans, totalViews, totalClicks }
        dashboardAnalyticsCache.set(cacheKey, { data: calculated, timestamp: Date.now() })

        setAnalytics({
          ...calculated,
          loading: false,
          error: null
        })
      } catch (err: any) {
        setAnalytics(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Une erreur est survenue'
        }))
      }
    }

    fetchAnalytics()
  }, [cacheKey]) // ✅ Utiliser join pour une comparaison stable

  return analytics
}
