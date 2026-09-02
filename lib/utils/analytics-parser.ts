// =====================================================
// UTILS DE PARSING & GÉOLOCALISATION DES SCANS / ANALYTICS
// =====================================================

export interface ParsedUserAgent {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop' | 'Inconnu'
  os: string
  browser: string
}

export interface LocationInfo {
  country: string
  city: string
}

/**
 * Analyse une chaîne User-Agent pour en extraire le type d'appareil, le système d'exploitation et le navigateur.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) {
    return { deviceType: 'Inconnu', os: 'Inconnu', browser: 'Inconnu' }
  }

  // 1. Détection du type d'appareil
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' | 'Inconnu' = 'Desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet'
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile'
  }

  // 2. Détection du Système d'Exploitation (OS)
  let os = 'Inconnu'
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS (\d+_\d+)/)
    os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS'
  } else if (/Android/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (/Windows NT 10/i.test(ua)) {
    os = 'Windows 10/11'
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows'
  } else if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/)
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS'
  } else if (/Linux/i.test(ua)) {
    os = 'Linux'
  }

  // 3. Détection du Navigateur
  let browser = 'Inconnu'
  if (/CriOS|Chrome/i.test(ua) && !/Edg|OPR|Safari/i.test(ua)) {
    browser = 'Chrome'
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR/i.test(ua)) {
    browser = 'Safari'
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = 'Firefox'
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge'
  } else if (/OPR|Opera/i.test(ua)) {
    browser = 'Opera'
  } else if (/FBAN|FBAV/i.test(ua)) {
    browser = 'Facebook App'
  } else if (/Instagram/i.test(ua)) {
    browser = 'Instagram App'
  } else if (/WhatsApp/i.test(ua)) {
    browser = 'WhatsApp'
  }

  return { deviceType, os, browser }
}

/**
 * Extrait le pays et la ville depuis les en-têtes HTTP de Vercel/Cloudflare,
 * ou fournit un fallback selon l'IP si en réseau local / dev.
 */
export function getLocationFromHeaders(headersList: Headers | Map<string, string>): LocationInfo {
  const getHeader = (key: string) => {
    if (typeof (headersList as Headers).get === 'function') {
      return (headersList as Headers).get(key)
    }
    return (headersList as any)[key] || null
  }

  const countryHeader = getHeader('x-vercel-ip-country') || getHeader('cf-ipcountry') || getHeader('x-country')
  const cityHeader = getHeader('x-vercel-ip-city') || getHeader('cf-ipcity') || getHeader('x-city')

  let country = countryHeader ? decodeURIComponent(countryHeader) : ''
  let city = cityHeader ? decodeURIComponent(cityHeader) : ''

  if (country === 'CI' || country === 'ci') {
    country = "Côte d'Ivoire"
  }

  if (!country) country = 'Côte d\'Ivoire'
  if (!city) city = 'Abidjan'

  return { country, city }
}
