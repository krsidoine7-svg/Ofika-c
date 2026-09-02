// =====================================================
// SERVICE POUR LA GESTION DES QR CODES DYNAMIQUES
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type { 
  QRRedirect, 
  CreateQRRedirectInput, 
  UpdateQRRedirectInput,
  QRRedirectStats 
} from '@/lib/types/qr-redirect'
import { 
  validateTargetUrl, 
  validateTitle, 
  validateDescription,
  normalizeToFullUrl
} from '@/lib/utils/qr-validation'
import { rateLimitQRCreation } from '@/lib/utils/rate-limit'
import { getLocationFromIP } from './ip-geolocation'

/**
 * Génère un code court unique (version plus sécurisée avec crypto)
 */
async function generateUniqueShortCode(supabase: any): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Générer un code de 8 caractères de manière plus aléatoire
    let shortCode = ''
    
    // Utiliser crypto.getRandomValues pour plus de sécurité si disponible
    if (typeof window !== 'undefined' && window.crypto) {
      const randomValues = new Uint32Array(8)
      window.crypto.getRandomValues(randomValues)
      for (let i = 0; i < 8; i++) {
        shortCode += chars.charAt(randomValues[i] % chars.length)
      }
    } else {
      // Fallback pour côté serveur
      for (let i = 0; i < 8; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    }

    // Vérifier l'unicité
    const { data, error } = await supabase
      .from('qr_redirects')
      .select('short_code')
      .eq('short_code', shortCode)
      .maybeSingle()

    if (!data) {
      return shortCode
    }
    
    attempts++
  }

  throw new Error('Impossible de générer un code unique après plusieurs tentatives')
}

/**
 * Crée une nouvelle redirection QR
 */
export async function createQRRedirect(
  input: CreateQRRedirectInput
): Promise<{ success: boolean; data?: QRRedirect; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Rate limiting par utilisateur
    const rateLimit = await rateLimitQRCreation(user.id)
    if (!rateLimit.allowed) {
      return { 
        success: false, 
        error: `Trop de créations. Réessayez dans ${rateLimit.retryAfter} secondes` 
      }
    }

    const rawTargetUrl = input.target_url || input.nfc_link || ''
    const targetUrl = normalizeToFullUrl(rawTargetUrl)
    const redirectType = input.type || input.redirect_type || 'custom'

    // Validation de l'URL cible
    const urlValidation = validateTargetUrl(targetUrl)
    if (!urlValidation.valid) {
      return { success: false, error: urlValidation.error }
    }

    // Validation du titre
    const titleValidation = validateTitle(input.title)
    if (!titleValidation.valid) {
      return { success: false, error: titleValidation.error }
    }

    // Validation de la description
    const descValidation = validateDescription(input.description)
    if (!descValidation.valid) {
      return { success: false, error: descValidation.error }
    }

    // Générer un code court unique
    const shortCode = await generateUniqueShortCode(supabase)

    // Créer la redirection
    const { data, error } = await supabase
      .from('qr_redirects')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        target_url: targetUrl,
        type: redirectType,
        title: input.title,
        description: input.description,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating QR redirect:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in createQRRedirect:', error)
    return { success: false, error: error.message || 'Erreur lors de la création' }
  }
}

/**
 * Met à jour une redirection QR
 */
export async function updateQRRedirect(
  id: string,
  input: UpdateQRRedirectInput
): Promise<{ success: boolean; data?: QRRedirect; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const updatePayload: any = { ...input }

    // Normalisation et validation de nfc_link / target_url si fournis
    if (updatePayload.nfc_link) {
      updatePayload.nfc_link = normalizeToFullUrl(updatePayload.nfc_link)
      updatePayload.target_url = updatePayload.nfc_link
      const urlValidation = validateTargetUrl(updatePayload.nfc_link)
      if (!urlValidation.valid) {
        return { success: false, error: urlValidation.error }
      }
    }
    if (updatePayload.target_url) {
      updatePayload.target_url = normalizeToFullUrl(updatePayload.target_url)
      const urlValidation = validateTargetUrl(updatePayload.target_url)
      if (!urlValidation.valid) {
        return { success: false, error: urlValidation.error }
      }
    }

    // Validation du titre si fourni
    if (input.title !== undefined) {
      const titleValidation = validateTitle(input.title)
      if (!titleValidation.valid) {
        return { success: false, error: titleValidation.error }
      }
    }

    // Validation de la description si fournie
    if (input.description !== undefined) {
      const descValidation = validateDescription(input.description)
      if (!descValidation.valid) {
        return { success: false, error: descValidation.error }
      }
    }

    const { data, error } = await supabase
      .from('qr_redirects')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating QR redirect:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in updateQRRedirect:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère une redirection par son short_code
 */
export async function getQRRedirectByShortCode(
  shortCode: string
): Promise<{ success: boolean; data?: QRRedirect; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('qr_redirects')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error getting QR redirect:', error)
      return { success: false, error: 'Redirection non trouvée' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in getQRRedirectByShortCode:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère toutes les redirections d'un utilisateur
 */
export async function getUserQRRedirects(): Promise<{
  success: boolean
  data?: QRRedirect[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { data, error } = await supabase
      .from('qr_redirects')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting user QR redirects:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error in getUserQRRedirects:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Supprime une redirection
 */
export async function deleteQRRedirect(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    const { error } = await supabase
      .from('qr_redirects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting QR redirect:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteQRRedirect:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Enregistre un scan de QR code
 */
export async function trackQRScan(
  shortCode: string,
  scanData: {
    userAgent?: string
    referrer?: string
    ipAddress?: string
    country?: string
    city?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/service-role')
    const { parseUserAgent } = await import('@/lib/utils/analytics-parser')
    const adminSupabase = createAdminClient()
    
    // Récupérer la redirection via adminSupabase
    const { data: redirect } = await adminSupabase
      .from('qr_redirects')
      .select('id, user_id, target_url')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single()

    if (!redirect) {
      return { success: false, error: 'Redirection non trouvée' }
    }
    
    const parsedUA = parseUserAgent(scanData.userAgent)
    const country = scanData.country || "Côte d'Ivoire"
    const city = scanData.city || "Abidjan"

    // Enregistrer le scan dans qr_scans
    const { error: scanError } = await adminSupabase
      .from('qr_scans')
      .insert({
        qr_redirect_id: redirect.id,
        user_agent: scanData.userAgent || null,
        ip_address: scanData.ipAddress || null,
        device_type: parsedUA.deviceType,
        os: parsedUA.os,
        browser: parsedUA.browser,
        country: country,
        city: city,
        referrer: scanData.referrer || 'Direct Scan',
        scanned_at: new Date().toISOString()
      })

    if (scanError) {
      console.error('❌ Erreur enregistrement scan QR:', scanError)
    } else {
      console.log(`✅ Scan enregistré avec succès pour QR "${shortCode}" (${parsedUA.deviceType}, ${parsedUA.os}, ${city})`)
    }

    // Synchroniser avec analytics_events si le lien pointe vers un profil
    try {
      const targetUrl = redirect.target_url || ''
      const urlParts = targetUrl.split('/').filter(Boolean)
      const lastSlug = urlParts[urlParts.length - 1]

      if (lastSlug) {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .or(`custom_url.eq.${lastSlug},username.eq.${lastSlug}`)
          .maybeSingle()

        if (profile) {
          await adminSupabase.from('analytics_events').insert({
            profile_id: profile.id,
            user_id: redirect.user_id,
            event_type: 'qr_scanned',
            event_data: {
              ip: scanData.ipAddress || null,
              city,
              country,
              browser: parsedUA.browser,
              os: parsedUA.os,
              referrer: scanData.referrer || 'QR Scan'
            },
            user_agent: scanData.userAgent || '',
            device_type: parsedUA.deviceType.toLowerCase() as any
          })
          console.log(`✅ Event qr_scanned synchronisé pour le profil ${profile.id}`)
        }
      }
    } catch (syncErr) {
      console.warn('⚠️ Échec de la synchronisation de l\'événement analytics_events:', syncErr)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in trackQRScan:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les statistiques d'une redirection
 */
export async function getQRRedirectStats(
  id: string
): Promise<{ success: boolean; data?: QRRedirectStats; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Vérifier que la redirection appartient à l'utilisateur
    const { data: redirect } = await supabase
      .from('qr_redirects')
      .select('scan_count, last_scanned_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!redirect) {
      return { success: false, error: 'Redirection non trouvée' }
    }

    // Récupérer les scans
    const { data: scans } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_redirect_id', id)
      .order('scanned_at', { ascending: false })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const scansToday = scans?.filter(s => new Date(s.scanned_at) >= today).length || 0
    const scansThisWeek = scans?.filter(s => new Date(s.scanned_at) >= weekAgo).length || 0
    const scansThisMonth = scans?.filter(s => new Date(s.scanned_at) >= monthAgo).length || 0

    // Top devices
    const deviceCounts: Record<string, number> = {}
    scans?.forEach(scan => {
      if (scan.device_type) {
        deviceCounts[scan.device_type] = (deviceCounts[scan.device_type] || 0) + 1
      }
    })
    const topDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top countries
    const countryCounts: Record<string, number> = {}
    scans?.forEach(scan => {
      if (scan.country) {
        countryCounts[scan.country] = (countryCounts[scan.country] || 0) + 1
      }
    })
    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Scans par jour (derniers 30 jours)
    const scansByDay: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      scansByDay[dateStr] = 0
    }
    scans?.forEach(scan => {
      const dateStr = scan.scanned_at.split('T')[0]
      if (scansByDay[dateStr] !== undefined) {
        scansByDay[dateStr]++
      }
    })
    const scansByDayArray = Object.entries(scansByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const stats: QRRedirectStats = {
      total_scans: redirect.scan_count,
      scans_today: scansToday,
      scans_this_week: scansThisWeek,
      scans_this_month: scansThisMonth,
      last_scan: redirect.last_scanned_at,
      top_devices: topDevices,
      top_countries: topCountries,
      scans_by_day: scansByDayArray
    }

    return { success: true, data: stats }
  } catch (error: any) {
    console.error('Error in getQRRedirectStats:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Parse le user agent pour extraire les informations
 */
function parseUserAgent(userAgent: string): {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  os: string
  browser: string
} {
  const ua = userAgent.toLowerCase()
  
  // Device type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/mobile|android|iphone|ipod/i.test(ua)) {
    deviceType = 'mobile'
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet'
  }

  // OS
  let os = 'Unknown'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os/i.test(ua)) os = 'macOS'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/linux/i.test(ua)) os = 'Linux'

  // Browser
  let browser = 'Unknown'
  if (/edg/i.test(ua)) browser = 'Edge'
  else if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/opera/i.test(ua)) browser = 'Opera'

  return { deviceType, os, browser }
}

/**
 * Génère l'URL du QR code pour une redirection
 */
export function getQRCodeURL(shortCode: string, size: number = 300): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')
  const redirectUrl = `${baseUrl}/qr/${shortCode}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(redirectUrl)}`
}

/**
 * Génère l'URL de redirection complète
 */
export function getRedirectURL(shortCode: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')
  return `${baseUrl}/qr/${shortCode}`
}
