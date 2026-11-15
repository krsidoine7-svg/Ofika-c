/**
 * Hook personnalisé pour récupérer les analytics du dashboard
 * Récupère le total de scans de tous les profils de l'utilisateur
 * Version corrigée avec logs et stabilité améliorée
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DailyMetricPoint {
  date: string
  label: string
  views: number
  scans: number
}

interface DashboardAnalytics {
  totalScans: number
  totalViews: number
  totalClicks: number
  totalContacts: number
  dailyData: DailyMetricPoint[]
  loading: boolean
  error: string | null
}

// Générateur de 30 jours consécutifs avec baselines à zéro
function computeDailyMetrics(events: any[]): DailyMetricPoint[] {
  const result: DailyMetricPoint[] = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    result.push({
      date: dateStr,
      label,
      views: 0,
      scans: 0
    })
  }

  const map = new Map(result.map(r => [r.date, r]))

  events.forEach(e => {
    if (!e.created_at) return
    const eventDate = e.created_at.split('T')[0]
    const entry = map.get(eventDate)
    if (entry) {
      if (e.event_type === 'profile_viewed') entry.views++
      if (e.event_type === 'qr_scanned') entry.scans++
    }
  })

  return result
}

// Cache mémoire global (TTL 60s) pour éviter de scanner la table analytics_events à chaque navigation
const dashboardAnalyticsCache = new Map<string, { data: { totalScans: number; totalViews: number; totalClicks: number; totalContacts: number; dailyData: DailyMetricPoint[] }; timestamp: number }>()
const CACHE_TTL = 60000

export function useDashboardAnalytics(profileIds: string[]) {
  const cacheKey = profileIds.sort().join(',')
  const cached = cacheKey ? dashboardAnalyticsCache.get(cacheKey) : null
  const hasFreshCache = !!(cached && (Date.now() - cached.timestamp < CACHE_TTL))

  const [analytics, setAnalytics] = useState<DashboardAnalytics>(() => ({
    totalScans: hasFreshCache && cached ? cached.data.totalScans : 0,
    totalViews: hasFreshCache && cached ? cached.data.totalViews : 0,
    totalClicks: hasFreshCache && cached ? cached.data.totalClicks : 0,
    totalContacts: hasFreshCache && cached ? cached.data.totalContacts : 0,
    dailyData: hasFreshCache && cached ? cached.data.dailyData : computeDailyMetrics([]),
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
          totalContacts: 0,
          dailyData: computeDailyMetrics([]),
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
        
        // 1. Récupérer tous les événements analytics pour les profils de l'utilisateur
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

        // 2. Récupérer le nombre réel de contacts captés
        let contactsCount = 0
        try {
          const { count } = await supabase
            .from('captured_contacts')
            .select('id', { count: 'exact', head: true })
            .in('profile_id', profileIds)
          contactsCount = count || 0
        } catch (_) {
          contactsCount = 0
        }

        // Calculer les totaux
        const totalViews = events?.filter(e => e.event_type === 'profile_viewed').length || 0
        const totalClicks = events?.filter(e => e.event_type === 'link_clicked').length || 0
        const totalScans = events?.filter(e => e.event_type === 'qr_scanned').length || 0
        const totalVcardEvents = events?.filter(e => e.event_type === 'vcard_downloaded' || e.event_type === 'contact_added').length || 0
        const totalContacts = Math.max(contactsCount, totalVcardEvents)

        // Générer les séries temporelles quotidiennes sur 30 jours
        const dailyData = computeDailyMetrics(events || [])

        const calculated = { totalScans, totalViews, totalClicks, totalContacts, dailyData }
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
