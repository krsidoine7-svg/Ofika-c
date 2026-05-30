// =====================================================
// SERVICES POUR LES ANALYTICS DE CONTACTS
// =====================================================

import { createClient } from '@/lib/supabase/client'
import { ContactAnalytics, ContactAnalyticsResponse, ContactAnalyticsStats, ContactAnalyticsFilters } from '@/lib/types/contact-analytics'

const supabase = createClient()

/**
 * Enregistre une action d'analytics de contact
 */
export async function trackContactAction(
  profileId: string,
  actionType: ContactAnalytics['action_type'],
  userAgent?: string,
  deviceType?: ContactAnalytics['device_type']
): Promise<ContactAnalyticsResponse> {
  try {
    const { data, error } = await supabase
      .from('contact_analytics')
      .insert({
        profile_id: profileId,
        action_type: actionType,
        user_agent: userAgent || navigator.userAgent,
        device_type: deviceType || getDeviceType(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error tracking contact action:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in trackContactAction:', error)
    return { success: false, error: 'Erreur lors de l\'enregistrement de l\'action' }
  }
}

/**
 * Récupère les statistiques d'analytics pour un profil
 */
export async function getContactAnalyticsStats(profileId: string): Promise<{ success: boolean; data?: ContactAnalyticsStats; error?: string }> {
  try {
    // Statistiques générales
    const { data: generalStats, error: generalError } = await supabase
      .from('contact_analytics')
      .select('action_type, device_type, created_at')
      .eq('profile_id', profileId)

    if (generalError) {
      console.error('Error fetching general stats:', generalError)
      return { success: false, error: generalError.message }
    }

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentStats, error: recentError } = await supabase
      .from('contact_analytics')
      .select('action_type')
      .eq('profile_id', profileId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (recentError) {
      console.error('Error fetching recent stats:', recentError)
      return { success: false, error: recentError.message }
    }

    // Calculer les statistiques
    const stats: ContactAnalyticsStats = {
      total_generated: generalStats?.filter(s => s.action_type === 'vcard_generated').length || 0,
      total_downloaded: generalStats?.filter(s => s.action_type === 'vcard_downloaded').length || 0,
      total_shared: generalStats?.filter(s => s.action_type === 'vcard_shared').length || 0,
      mobile_count: generalStats?.filter(s => s.device_type === 'mobile').length || 0,
      desktop_count: generalStats?.filter(s => s.device_type === 'desktop').length || 0,
      tablet_count: generalStats?.filter(s => s.device_type === 'tablet').length || 0,
      last_30_days: recentStats?.length || 0
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getContactAnalyticsStats:', error)
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
}

/**
 * Récupère l'historique des actions d'analytics
 */
export async function getContactAnalyticsHistory(
  profileId: string,
  filters?: ContactAnalyticsFilters
): Promise<{ success: boolean; data?: ContactAnalytics[]; error?: string }> {
  try {
    let query = supabase
      .from('contact_analytics')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters?.action_type) {
      query = query.eq('action_type', filters.action_type)
    }
    
    if (filters?.device_type) {
      query = query.eq('device_type', filters.device_type)
    }
    
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching analytics history:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getContactAnalyticsHistory:', error)
    return { success: false, error: 'Erreur lors de la récupération de l\'historique' }
  }
}

/**
 * Détecte le type d'appareil basé sur l'user agent
 */
export function getDeviceType(): ContactAnalytics['device_type'] {
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
 * Vérifie si Web Share API est supporté
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'share' in navigator && 
         typeof navigator.share === 'function'
}

/**
 * Vérifie si le navigateur supporte les fichiers dans Web Share API
 */
export function isWebShareFilesSupported(): boolean {
  return isWebShareSupported() && 
         'canShare' in navigator &&
         typeof navigator.canShare === 'function'
}
