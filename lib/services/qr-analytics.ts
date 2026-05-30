// =====================================================
// SERVICE ANALYTICS AVANCÉS POUR QR CODES
// Métriques détaillées, graphiques, exports
// =====================================================

import { createClient } from '@/lib/supabase/client'

// Types
export interface QRAnalytics {
  // Métriques globales
  total_scans: number
  unique_visitors: number
  scan_rate: number // Scans par jour moyen
  
  // Périodes
  scans_today: number
  scans_yesterday: number
  scans_this_week: number
  scans_last_week: number
  scans_this_month: number
  scans_last_month: number
  
  // Évolution
  growth_rate_daily: number // %
  growth_rate_weekly: number // %
  growth_rate_monthly: number // %
  
  // Top stats
  top_countries: Array<{ country: string; count: number; percentage: number }>
  top_cities: Array<{ city: string; count: number; percentage: number }>
  top_devices: Array<{ device: string; count: number; percentage: number }>
  top_os: Array<{ os: string; count: number; percentage: number }>
  top_browsers: Array<{ browser: string; count: number; percentage: number }>
  
  // Timeline
  scans_by_day: Array<{ date: string; count: number }>
  scans_by_hour: Array<{ hour: number; count: number }>
  scans_by_day_of_week: Array<{ day: string; count: number }>
  
  // Metadata
  first_scan_at?: string
  last_scan_at?: string
  avg_scans_per_day: number
}

export interface TimeRange {
  start: Date
  end: Date
}

/**
 * Calcule les analytics complets pour un QR code
 */
export async function getQRAnalytics(
  qrRedirectId: string,
  timeRange?: TimeRange
): Promise<{ success: boolean; data?: QRAnalytics; error?: string }> {
  try {
    const supabase = createClient()
    
    // Construire la query de base
    let query = supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_redirect_id', qrRedirectId)
    
    // Appliquer le filtre temporel si fourni
    if (timeRange) {
      query = query
        .gte('scanned_at', timeRange.start.toISOString())
        .lte('scanned_at', timeRange.end.toISOString())
    }
    
    const { data: scans, error } = await query.order('scanned_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching scans:', error)
      return { success: false, error: error.message }
    }
    
    if (!scans || scans.length === 0) {
      // Retourner des analytics vides
      return {
        success: true,
        data: getEmptyAnalytics()
      }
    }
    
    // Calculer toutes les métriques
    const analytics = calculateAnalytics(scans)
    
    return { success: true, data: analytics }
  } catch (error: any) {
    console.error('Error in getQRAnalytics:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les scans bruts pour un QR code
 */
export async function getQRScans(
  qrRedirectId: string,
  limit = 1000
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = createClient()
    
    const { data: scans, error } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_redirect_id', qrRedirectId)
      .order('scanned_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching raw scans:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data: scans || [] }
  } catch (error: any) {
    console.error('Error in getQRScans:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Calcule les analytics à partir des scans
 */
function calculateAnalytics(scans: any[]): QRAnalytics {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  
  // Métriques globales
  const total_scans = scans.length
  const unique_ips = new Set(scans.filter(s => s.ip_address).map(s => s.ip_address)).size
  
  // Scans par période
  const scans_today = scans.filter(s => new Date(s.scanned_at) >= today).length
  const scans_yesterday = scans.filter(s => {
    const date = new Date(s.scanned_at)
    return date >= yesterday && date < today
  }).length
  
  const scans_this_week = scans.filter(s => new Date(s.scanned_at) >= weekAgo).length
  const scans_last_week = scans.filter(s => {
    const date = new Date(s.scanned_at)
    return date >= twoWeeksAgo && date < weekAgo
  }).length
  
  const scans_this_month = scans.filter(s => new Date(s.scanned_at) >= monthAgo).length
  const scans_last_month = scans.filter(s => {
    const date = new Date(s.scanned_at)
    return date >= twoMonthsAgo && date < monthAgo
  }).length
  
  // Taux de croissance
  const growth_rate_daily = calculateGrowthRate(scans_today, scans_yesterday)
  const growth_rate_weekly = calculateGrowthRate(scans_this_week, scans_last_week)
  const growth_rate_monthly = calculateGrowthRate(scans_this_month, scans_last_month)
  
  // Top pays
  const top_countries = calculateTopItems(scans, 'country', 10) as Array<{ country: string; count: number; percentage: number }>
  
  // Top villes
  const top_cities = calculateTopItems(scans, 'city', 10) as Array<{ city: string; count: number; percentage: number }>
  
  // Top devices
  const top_devices = calculateTopItems(scans, 'device_type', 5) as Array<{ device: string; count: number; percentage: number }>
  
  // Top OS
  const top_os = calculateTopItems(scans, 'os', 10) as Array<{ os: string; count: number; percentage: number }>
  
  // Top browsers
  const top_browsers = calculateTopItems(scans, 'browser', 10) as Array<{ browser: string; count: number; percentage: number }>
  
  // Timeline par jour (30 derniers jours)
  const scans_by_day = calculateScansByDay(scans, 30)
  
  // Timeline par heure (24h)
  const scans_by_hour = calculateScansByHour(scans)
  
  // Timeline par jour de la semaine
  const scans_by_day_of_week = calculateScansByDayOfWeek(scans)
  
  // Dates
  const first_scan_at = scans.length > 0 ? scans[scans.length - 1].scanned_at : undefined
  const last_scan_at = scans.length > 0 ? scans[0].scanned_at : undefined
  
  // Moyenne scans/jour
  let avg_scans_per_day = 0
  if (first_scan_at) {
    const daysSinceFirst = Math.max(1, Math.floor((now.getTime() - new Date(first_scan_at).getTime()) / (24 * 60 * 60 * 1000)))
    avg_scans_per_day = total_scans / daysSinceFirst
  }
  
  const scan_rate = avg_scans_per_day
  
  return {
    total_scans,
    unique_visitors: unique_ips,
    scan_rate,
    scans_today,
    scans_yesterday,
    scans_this_week,
    scans_last_week,
    scans_this_month,
    scans_last_month,
    growth_rate_daily,
    growth_rate_weekly,
    growth_rate_monthly,
    top_countries,
    top_cities,
    top_devices,
    top_os,
    top_browsers,
    scans_by_day,
    scans_by_hour,
    scans_by_day_of_week,
    first_scan_at,
    last_scan_at,
    avg_scans_per_day
  }
}

/**
 * Calcule le taux de croissance en %
 */
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Calcule le top N des items par champ
 */
function calculateTopItems(
  scans: any[],
  field: string,
  limit: number
): any[] {
  const counts = new Map<string, number>()
  
  scans.forEach(scan => {
    const value = scan[field]
    if (value) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }
  })
  
  const total = scans.length
  let keyName = field
  if (field === 'device_type') keyName = 'device'
  
  const sorted = Array.from(counts.entries())
    .map(([value, count]) => ({
      [keyName]: value,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
  
  return sorted
}

/**
 * Calcule les scans par jour
 */
function calculateScansByDay(scans: any[], days: number): Array<{ date: string; count: number }> {
  const now = new Date()
  const result: Array<{ date: string; count: number }> = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const count = scans.filter(s => {
      const scanDate = new Date(s.scanned_at).toISOString().split('T')[0]
      return scanDate === dateStr
    }).length
    
    result.push({ date: dateStr, count })
  }
  
  return result
}

/**
 * Calcule les scans par heure (0-23)
 */
function calculateScansByHour(scans: any[]): Array<{ hour: number; count: number }> {
  const counts = new Array(24).fill(0)
  
  scans.forEach(scan => {
    const hour = new Date(scan.scanned_at).getHours()
    counts[hour]++
  })
  
  return counts.map((count, hour) => ({ hour, count }))
}

/**
 * Calcule les scans par jour de la semaine
 */
function calculateScansByDayOfWeek(scans: any[]): Array<{ day: string; count: number }> {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const counts = new Array(7).fill(0)
  
  scans.forEach(scan => {
    const dayIndex = new Date(scan.scanned_at).getDay()
    counts[dayIndex]++
  })
  
  return days.map((day, index) => ({ day, count: counts[index] }))
}

/**
 * Retourne des analytics vides
 */
function getEmptyAnalytics(): QRAnalytics {
  return {
    total_scans: 0,
    unique_visitors: 0,
    scan_rate: 0,
    scans_today: 0,
    scans_yesterday: 0,
    scans_this_week: 0,
    scans_last_week: 0,
    scans_this_month: 0,
    scans_last_month: 0,
    growth_rate_daily: 0,
    growth_rate_weekly: 0,
    growth_rate_monthly: 0,
    top_countries: [],
    top_cities: [],
    top_devices: [],
    top_os: [],
    top_browsers: [],
    scans_by_day: [],
    scans_by_hour: [],
    scans_by_day_of_week: [],
    avg_scans_per_day: 0
  }
}

/**
 * Exporte les scans en format CSV
 */
export function exportScansToCSV(scans: any[]): string {
  if (!scans || scans.length === 0) {
    return 'No data'
  }
  
  // Headers
  const headers = [
    'Date',
    'Heure',
    'Appareil',
    'Système',
    'Navigateur',
    'Pays',
    'Ville',
    'IP',
    'Referrer'
  ]
  
  // Rows
  const rows = scans.map(scan => {
    const date = new Date(scan.scanned_at)
    return [
      date.toLocaleDateString('fr-FR'),
      date.toLocaleTimeString('fr-FR'),
      scan.device_type || '-',
      scan.os || '-',
      scan.browser || '-',
      scan.country || '-',
      scan.city || '-',
      scan.ip_address || '-',
      scan.referrer || '-'
    ]
  })
  
  // Combine
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csv
}
