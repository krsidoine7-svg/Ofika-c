// =====================================================
// SERVICE QR CODES - VERSION CLIENT
// Pour utilisation dans les composants 'use client'
// =====================================================

import { createClient } from '@/lib/supabase/client'
import type { QRRedirect, CreateQRRedirectInput } from '@/lib/types/qr-redirect'
import { normalizeToFullUrl } from '@/lib/utils/qr-validation'

/**
 * Génère un code court unique
 */
async function generateUniqueShortCode(supabase: any): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const { data } = await supabase
      .from('qr_redirects')
      .select('id')
      .eq('short_code', code)
      .maybeSingle()

    if (!data) {
      return code
    }

    attempts++
  }

  throw new Error('Impossible de générer un code unique')
}

/**
 * Crée une nouvelle redirection QR (version client)
 */
export async function createQRRedirect(
  input: CreateQRRedirectInput
): Promise<{ success: boolean; data?: QRRedirect; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Vérifier la limite de 7 QR codes par utilisateur
    const { count, error: countError } = await supabase
      .from('qr_redirects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (countError) {
      console.error('Error counting QR codes:', countError)
      return { success: false, error: 'Erreur lors de la vérification de la limite' }
    }

    if (count !== null && count >= 7) {
      return { 
        success: false, 
        error: 'Limite atteinte : vous ne pouvez créer que 7 QR codes maximum. Supprimez-en un pour en créer un nouveau.' 
      }
    }

    const shortCode = await generateUniqueShortCode(supabase)
    const rawTargetUrl = (input as any).target_url || (input as any).nfc_link || ''
    const targetUrl = normalizeToFullUrl(rawTargetUrl)
    const redirectType = (input as any).type || (input as any).redirect_type || 'custom'

    const { data, error } = await supabase
      .from('qr_redirects')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        target_url: targetUrl,
        type: redirectType,
        title: input.title || null,
        description: input.description || null,
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
    return { success: false, error: error.message }
  }
}

/**
 * Récupère toutes les redirections QR de l'utilisateur (version client)
 */
export async function getUserQRRedirects(): Promise<{
  success: boolean
  data?: QRRedirect[]
  error?: string
}> {
  try {
    const supabase = createClient()
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
      console.error('Error fetching QR redirects:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error in getUserQRRedirects:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Met à jour une redirection QR (version client)
 */
export async function updateQRRedirect(
  id: string,
  updates: Partial<QRRedirect>
): Promise<{ success: boolean; data?: QRRedirect; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Protection des QR codes NFC Card
    if (updates.is_active !== undefined) {
      const { data: currentQR } = await supabase
        .from('qr_redirects')
        .select('redirect_type')
        .eq('id', id)
        .single()
      
      if (currentQR?.redirect_type === 'nfc_card') {
        return { success: false, error: 'Les QR codes NFC ne peuvent pas être désactivés' }
      }
    }

    const payload: any = { ...updates }
    if (payload.nfc_link) {
      payload.target_url = normalizeToFullUrl(payload.nfc_link)
      delete payload.nfc_link
    }
    if (payload.target_url) {
      payload.target_url = normalizeToFullUrl(payload.target_url)
    }
    delete payload.redirect_type

    const { data, error } = await supabase
      .from('qr_redirects')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

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
 * Supprime une redirection QR (version client)
 */
export async function deleteQRRedirect(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Protection des QR codes NFC Card
    const { data: currentQR } = await supabase
      .from('qr_redirects')
      .select('redirect_type')
      .eq('id', id)
      .single()
    
    if (currentQR?.redirect_type === 'nfc_card') {
      return { success: false, error: 'Les QR codes NFC ne peuvent pas être supprimés' }
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
 * Génère l'URL du QR code
 */
export function getQRCodeURL(shortCode: string, size: number = 300): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  const redirectUrl = `${baseUrl}/qr/${shortCode}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(redirectUrl)}`
}

/**
 * Génère l'URL de redirection complète
 */
export function getRedirectURL(shortCode: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  return `${baseUrl}/qr/${shortCode}`
}

/**
 * Récupère les statistiques d'une redirection QR (version client)
 */
export async function getQRRedirectStats(
  id: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient()
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

    // Scans by day (last 7 days)
    const scansByDay: Array<{ date: string; count: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = scans?.filter(s => {
        const scanDate = new Date(s.scanned_at).toISOString().split('T')[0]
        return scanDate === dateStr
      }).length || 0
      scansByDay.push({ date: dateStr, count })
    }

    return {
      success: true,
      data: {
        total_scans: redirect.scan_count,
        scans_today: scansToday,
        scans_this_week: scansThisWeek,
        scans_this_month: scansThisMonth,
        last_scan: redirect.last_scanned_at,
        top_devices: topDevices,
        top_countries: topCountries,
        scans_by_day: scansByDay
      }
    }
  } catch (error: any) {
    console.error('Error in getQRRedirectStats:', error)
    return { success: false, error: error.message }
  }
}
