// =====================================================
// SERVICES POUR LES ANALYTICS DE PROFILS
// =====================================================

import { createClient } from '@/lib/supabase/client'

const getSupabase = () => createClient()

export interface ProfileViewEvent {
  profile_id: string
  event_type: 'profile_viewed' | 'link_clicked' | 'qr_scanned' | 'contact_added' | 'share_clicked'
  event_data?: {
    link_id?: string
    link_url?: string
    referrer?: string
    user_agent?: string
    action_type?: string
    ip?: string
    city?: string
    country?: string
    browser?: string
    os?: string
  }
  user_agent?: string
  device_type?: 'mobile' | 'desktop' | 'tablet'
}

/**
 * Récupère les informations de géolocalisation et IP via une API externe
 */
/**
 * Appelle l'API interne de tracking (plus fiable car côté serveur)
 */
async function sendToTrackingAPI(data: any): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        device_type: getDeviceType(),
        event_data: {
          ...data.event_data,
          browser: getBrowser(),
          os: getOS(),
          referrer: typeof document !== 'undefined' ? document.referrer : undefined
        }
      })
    })
    return await res.json()
  } catch (err) {
    console.warn('⚠️ Tracking API call failed, trying direct fallback as backup')
    return { success: false }
  }
}

/**
 * Enregistre une vue de profil
 */
export async function trackProfileView(
  profileId: string,
  additionalData?: Partial<ProfileViewEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendToTrackingAPI({
      profile_id: profileId,
      event_type: 'profile_viewed',
      event_data: {
        ...additionalData?.event_data
      }
    })
  } catch (error) {
    console.error('Error in trackProfileView:', error)
    return { success: false, error: 'Erreur lors de l\'enregistrement de la vue' }
  }
}

/**
 * Enregistre un clic sur un lien
 */
export async function trackLinkClick(
  profileId: string,
  linkId: string,
  linkUrl: string,
  additionalData?: Partial<ProfileViewEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendToTrackingAPI({
      profile_id: profileId,
      event_type: 'link_clicked',
      event_data: {
        link_id: linkId,
        link_url: linkUrl,
        ...additionalData?.event_data
      }
    })
  } catch (error) {
    console.error('Error in trackLinkClick:', error)
    return { success: false, error: 'Erreur lors de l\'enregistrement du clic' }
  }
}

/**
 * Enregistre un scan de QR code
 */
export async function trackQRScan(
  profileId: string,
  additionalData?: Partial<ProfileViewEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    return await sendToTrackingAPI({
      profile_id: profileId,
      event_type: 'qr_scanned',
      event_data: {
        ...additionalData?.event_data
      }
    })
  } catch (error) {
    console.error('Error in trackQRScan:', error)
    return { success: false, error: 'Erreur lors de l\'enregistrement du scan' }
  }
}

/**
 * Enregistre une action de contact (vCard, partage)
 */
export async function trackContactAction(
  profileId: string,
  actionType: 'vcard_download' | 'share_clicked',
  additionalData?: Partial<ProfileViewEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const eventType = actionType === 'vcard_download' ? 'contact_added' : 'share_clicked'
    
    const { error } = await getSupabase()
      .from('analytics_events')
      .insert({
        profile_id: profileId,
        event_type: eventType,
        event_data: { action_type: actionType, ...additionalData?.event_data },
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        device_type: getDeviceType(),
        created_at: new Date().toISOString()
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error tracking contact action:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Détecte le navigateur
 */
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Trident')) return 'Internet Explorer'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

/**
 * Détecte le système d'exploitation
 */
export function getOS(): string {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('X11')) return 'UNIX'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone')) return 'iOS'
  return 'Other'
}

/**
 * Détecte le type d'appareil basé sur l'user agent
 */
export function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile'
  } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * Récupère les statistiques d'un profil
 */
export async function getProfileAnalytics(profileId: string): Promise<{
  success: boolean
  data?: {
    total_views: number
    total_link_clicks: number
    total_qr_scans: number
    total_contact_actions: number
    device_breakdown: {
      mobile: number
      desktop: number
      tablet: number
    }
    countries: Record<string, number>
    cities: Record<string, number>
    browsers: Record<string, number>
    oss: Record<string, number>
    last_30_days: number
    last_7_days: number
    daily_data: Array<{
      date: string
      views: number
      scans: number
      clicks: number
      contacts: number
    }>
    recent_events: any[]
  }
  error?: string
}> {
  try {
    const { data: events, error } = await getSupabase()
      .from('analytics_events')
      .select('event_type, device_type, created_at, event_data')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching profile analytics:', error)
      return { success: false, error: error.message }
    }

    // Statistiques de base
    const total_views = events?.filter(e => e.event_type === 'profile_viewed').length || 0
    const total_link_clicks = events?.filter(e => e.event_type === 'link_clicked').length || 0
    const total_qr_scans = events?.filter(e => e.event_type === 'qr_scanned').length || 0
    const total_contact_actions = events?.filter(e => e.event_type === 'contact_added' || e.event_type === 'share_clicked').length || 0

    const device_breakdown = {
      mobile: events?.filter(e => e.device_type === 'mobile').length || 0,
      desktop: events?.filter(e => e.device_type === 'desktop').length || 0,
      tablet: events?.filter(e => e.device_type === 'tablet').length || 0
    }

    // Initialiser les nouveaux breakdowns
    const countries: Record<string, number> = {}
    const cities: Record<string, number> = {}
    const browsers: Record<string, number> = {}
    const oss: Record<string, number> = {}

    events?.forEach(e => {
      const data = e.event_data || {}
      
      // Géo
      const country = data.country || 'Inconnu'
      const city = data.city || 'Inconnu'
      countries[country] = (countries[country] || 0) + 1
      cities[city] = (cities[city] || 0) + 1
      
      // Tech
      const browser = data.browser || 'Inconnu'
      const os = data.os || 'Inconnu'
      browsers[browser] = (browsers[browser] || 0) + 1
      oss[os] = (oss[os] || 0) + 1
    })

    // Dates
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const last_30_days = events?.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length || 0
    const last_7_days = events?.filter(e => new Date(e.created_at) >= sevenDaysAgo).length || 0

    // Données quotidiennes
    const daily_data: any[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const displayDate = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      const dayEvents = events?.filter(e => e.created_at.startsWith(dateStr)) || []
      
      daily_data.push({
        date: displayDate,
        views: dayEvents.filter(e => e.event_type === 'profile_viewed').length,
        scans: dayEvents.filter(e => e.event_type === 'qr_scanned').length,
        clicks: dayEvents.filter(e => e.event_type === 'link_clicked').length,
        contacts: dayEvents.filter(e => e.event_type === 'contact_added' || e.event_type === 'share_clicked').length
      })
    }

    return {
      success: true,
      data: {
        total_views,
        total_link_clicks,
        total_qr_scans,
        total_contact_actions,
        device_breakdown,
        countries,
        cities,
        browsers,
        oss,
        last_30_days,
        last_7_days,
        daily_data,
        recent_events: (events || []).reverse().slice(0, 50) // Retourner les 50 derniers events
      }
    }
  } catch (error) {
    console.error('Error in getProfileAnalytics:', error)
    return { success: false, error: 'Erreur lors de la récupération des analytics' }
  }
}
