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

export function useDashboardAnalytics(profileIds: string[]) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    totalScans: 0,
    totalViews: 0,
    totalClicks: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profileIds || profileIds.length === 0) {
        console.log('📊 useDashboardAnalytics: Aucun profil à analyser')
        setAnalytics({
          totalScans: 0,
          totalViews: 0,
          totalClicks: 0,
          loading: false,
          error: null
        })
        return
      }

      console.log(`📊 useDashboardAnalytics: Chargement analytics pour ${profileIds.length} profil(s)`)
      console.log('Profile IDs:', profileIds)

      try {
        const supabase = createClient()
        
        // Récupérer tous les événements analytics pour les profils de l'utilisateur
        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('event_type, profile_id, created_at')
          .in('profile_id', profileIds)

        if (error) {
          console.error('❌ Error fetching dashboard analytics:', error)
          setAnalytics(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }))
          return
        }

        console.log(`✅ Analytics events récupérés: ${events?.length || 0} événements`)
        
        if (events && events.length > 0) {
          console.log('Exemple d\'événements:', events.slice(0, 3))
        }

        // Calculer les totaux
        const totalViews = events?.filter(e => e.event_type === 'profile_viewed').length || 0
        const totalClicks = events?.filter(e => e.event_type === 'link_clicked').length || 0
        const totalScans = events?.filter(e => e.event_type === 'qr_scanned').length || 0

        console.log('📈 Statistiques calculées:', { 
          totalViews, 
          totalClicks, 
          totalScans,
          total: totalViews + totalClicks + totalScans
        })

        setAnalytics({
          totalScans,
          totalViews,
          totalClicks,
          loading: false,
          error: null
        })
      } catch (err: any) {
        console.error('❌ Error in useDashboardAnalytics:', err)
        setAnalytics(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Une erreur est survenue'
        }))
      }
    }

    fetchAnalytics()
  }, [profileIds.join(',')]) // ✅ Utiliser join pour une comparaison stable

  return analytics
}
