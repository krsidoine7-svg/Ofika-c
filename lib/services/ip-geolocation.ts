// =====================================================
// SERVICE DE GÉOLOCALISATION IP
// Utilise ipapi.co (gratuit, 1000 req/jour)
// =====================================================

interface GeolocationData {
  country?: string
  country_name?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  timezone?: string
}

interface GeolocationResult {
  success: boolean
  country?: string
  city?: string
  error?: string
}

/**
 * Obtient la localisation d'une adresse IP
 * API: ipapi.co (gratuit 1000 req/jour)
 * Fallback: retourne undefined si erreur
 */
export async function getLocationFromIP(ip?: string): Promise<GeolocationResult> {
  // Si pas d'IP ou IP locale, skip
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { success: false }
  }

  try {
    // API ipapi.co (pas de clé requise pour usage basique)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Ofika-QR-Analytics/1.0'
      },
      // Cache 1 heure pour même IP
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.warn(`IP geolocation failed for ${ip}: ${response.status}`)
      return { success: false }
    }

    const data: GeolocationData = await response.json()

    return {
      success: true,
      country: data.country_name || data.country,
      city: data.city
    }
  } catch (error) {
    console.error('IP geolocation error:', error)
    return { success: false, error: 'Geolocation API error' }
  }
}

/**
 * Alternative with local IP database (MaxMind GeoLite2)
 * 
 * DECISION: NOT IMPLEMENTED
 * The current ipapi.co API works well for our needs (1000 req/day free tier).
 * MaxMind GeoLite2 would require:
 * - Complex setup (database download, monthly updates)
 * - Additional dependencies (@maxmind/geoip2-node)
 * - File storage and management
 * 
 * Current solution is sufficient. If we need higher volume or offline capability,
 * MaxMind can be implemented in the future.
 */
export async function getLocationFromIPLocal(ip: string): Promise<GeolocationResult> {
  // For now, use the external API
  return getLocationFromIP(ip)
}

/**
 * Obtient le pays depuis une IP (version simplifiée)
 */
export async function getCountryFromIP(ip?: string): Promise<string | undefined> {
  const result = await getLocationFromIP(ip)
  return result.country
}

/**
 * Obtient la ville depuis une IP (version simplifiée)
 */
export async function getCityFromIP(ip?: string): Promise<string | undefined> {
  const result = await getLocationFromIP(ip)
  return result.city
}

/**
 * Batch geolocation pour plusieurs IPs
 * Utile pour analytics en masse
 */
export async function getLocationsFromIPs(
  ips: string[]
): Promise<Map<string, GeolocationResult>> {
  const results = new Map<string, GeolocationResult>()
  
  // Limiter à 50 IPs max pour éviter rate limiting
  const uniqueIps = [...new Set(ips)].slice(0, 50)
  
  // Faire les requêtes en parallèle (max 5 simultanées)
  const batchSize = 5
  for (let i = 0; i < uniqueIps.length; i += batchSize) {
    const batch = uniqueIps.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (ip) => ({
        ip,
        result: await getLocationFromIP(ip)
      }))
    )
    
    batchResults.forEach(({ ip, result }) => {
      results.set(ip, result)
    })
    
    // Pause de 1s entre batches pour respecter rate limit
    if (i + batchSize < uniqueIps.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}
