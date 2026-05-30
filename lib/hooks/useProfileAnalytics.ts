"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  trackProfileView, 
  trackLinkClick, 
  trackQRScan, 
  trackContactAction,
  getProfileAnalytics 
} from '@/lib/services/profile-analytics'

export interface ProfileAnalyticsData {
  total_views: number
  total_link_clicks: number
  total_qr_scans: number
  total_contact_actions: number
  device_breakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  last_30_days: number
  last_7_days: number
  daily_data: Array<{
    date: string
    views: number
    scans: number
    clicks: number
    contacts: number
  }>
}

export function useProfileAnalytics(profileId: string, options: { trackOnMount?: boolean } = {}) {
  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les analytics
  const loadAnalytics = useCallback(async () => {
    if (!profileId) return
    try {
      setLoading(true)
      const response = await getProfileAnalytics(profileId)
      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        setError(response.error || 'Erreur lors du chargement des analytics')
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  // Enregistrer une vue de profil
  const trackView = useCallback(async () => {
    if (!profileId) return
    try {
      await trackProfileView(profileId)
    } catch (err) {
      console.error('Error tracking profile view:', err)
    }
  }, [profileId])

  // Enregistrer un clic sur un lien
  const trackClick = useCallback(async (linkId: string, linkUrl: string) => {
    if (!profileId) return
    try {
      await trackLinkClick(profileId, linkId, linkUrl)
    } catch (err) {
      console.error('Error tracking link click:', err)
    }
  }, [profileId])

  // Enregistrer un scan QR
  const trackScan = useCallback(async () => {
    if (!profileId) return
    try {
      await trackQRScan(profileId)
    } catch (err) {
      console.error('Error tracking QR scan:', err)
    }
  }, [profileId])

  // Enregistrer une action de contact
  const trackContact = useCallback(async (actionType: 'vcard_download' | 'share_clicked') => {
    if (!profileId) return
    try {
      await trackContactAction(profileId, actionType)
    } catch (err) {
      console.error('Error tracking contact action:', err)
    }
  }, [profileId])

  // Tracker la vue automatiquement si l'option est activée
  useEffect(() => {
    if (profileId && options.trackOnMount) {
      trackView()
    }
  }, [profileId, options.trackOnMount, trackView])

  // Charger les analytics au montage
  useEffect(() => {
    if (profileId) {
      loadAnalytics()
    }
  }, [profileId, loadAnalytics])

  return {
    analytics,
    loading,
    error,
    trackView,
    trackClick,
    trackScan,
    trackContact,
    refresh: loadAnalytics
  }
}
