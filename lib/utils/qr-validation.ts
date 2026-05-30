// =====================================================
// UTILITAIRES DE VALIDATION POUR QR CODES
// =====================================================

/**
 * Liste blanche des domaines autorisés pour les redirections
 */
const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'tel:',
  'mailto:',
  'sms:',
  'whatsapp:',
  'data:'  // Pour vCard uniquement
]

const ALLOWED_DOMAINS_FOR_PROXY = [
  'api.qrserver.com',
  'chart.googleapis.com'
]

/**
 * Valide une URL de destination pour un QR code
 */
export function validateTargetUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL requise' }
  }

  // Vérifier la longueur
  if (url.length > 2048) {
    return { valid: false, error: 'URL trop longue (max 2048 caractères)' }
  }

  // Vérifier les caractères dangereux
  if (url.includes('<') || url.includes('>') || url.includes('"') || url.includes("'")) {
    return { valid: false, error: 'URL contient des caractères non autorisés' }
  }

  // Cas spécial pour data: URLs (vCard)
  if (url.startsWith('data:text/vcard;base64,')) {
    return validateVCardDataUrl(url)
  }

  // Cas spécial pour tel:
  if (url.startsWith('tel:')) {
    return validatePhoneUrl(url)
  }

  // Cas spécial pour mailto:
  if (url.startsWith('mailto:')) {
    return validateEmailUrl(url)
  }

  // Pour les URLs normales
  try {
    const parsedUrl = new URL(url)
    
    // Vérifier le protocole
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      return { valid: false, error: `Protocole non autorisé: ${parsedUrl.protocol}` }
    }

    // Interdire les redirections vers localhost ou IPs privées (sécurité)
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      const hostname = parsedUrl.hostname.toLowerCase()
      
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('169.254.') ||
        hostname === '[::1]' ||
        hostname.endsWith('.local')
      ) {
        return { valid: false, error: 'Redirections vers des adresses locales non autorisées' }
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Format d\'URL invalide' }
  }
}

/**
 * Valide une URL de type data: pour vCard
 */
function validateVCardDataUrl(url: string): { valid: boolean; error?: string } {
  try {
    // Vérifier que c'est bien du base64
    const base64Data = url.replace('data:text/vcard;base64,', '')
    const decoded = atob(base64Data)
    
    // Vérifier que ça commence par BEGIN:VCARD
    if (!decoded.startsWith('BEGIN:VCARD')) {
      return { valid: false, error: 'vCard invalide' }
    }
    
    // Vérifier la taille (max 4KB pour une vCard)
    if (decoded.length > 4096) {
      return { valid: false, error: 'vCard trop volumineuse' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Format vCard invalide' }
  }
}

/**
 * Valide une URL de type tel:
 */
function validatePhoneUrl(url: string): { valid: boolean; error?: string } {
  const phoneNumber = url.replace('tel:', '')
  
  // Accepter seulement chiffres, +, -, espaces, parenthèses
  if (!/^[\d\s\-+()]+$/.test(phoneNumber)) {
    return { valid: false, error: 'Numéro de téléphone invalide' }
  }
  
  if (phoneNumber.length < 4 || phoneNumber.length > 20) {
    return { valid: false, error: 'Numéro de téléphone invalide (longueur)' }
  }
  
  return { valid: true }
}

/**
 * Valide une URL de type mailto:
 */
function validateEmailUrl(url: string): { valid: boolean; error?: string } {
  const emailPart = url.replace('mailto:', '').split('?')[0]
  
  // Simple validation email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPart)) {
    return { valid: false, error: 'Adresse email invalide' }
  }
  
  return { valid: true }
}

/**
 * Valide une URL pour le proxy de téléchargement (protection SSRF)
 */
export function validateProxyUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL requise' }
  }

  try {
    const parsedUrl = new URL(url)
    
    // Seul HTTPS autorisé pour le proxy
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false, error: 'Seul HTTPS est autorisé' }
    }
    
    // Vérifier que c'est un domaine autorisé
    const hostname = parsedUrl.hostname.toLowerCase()
    if (!ALLOWED_DOMAINS_FOR_PROXY.includes(hostname)) {
      return { valid: false, error: 'Domaine non autorisé pour le proxy' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'URL invalide' }
  }
}

/**
 * Sanitize les champs de texte pour vCard
 */
export function sanitizeVCardField(field: string): string {
  if (!field) return ''
  
  // Retirer les caractères de contrôle et les caractères dangereux
  return field
    .replace(/[\x00-\x1F\x7F]/g, '') // Caractères de contrôle
    .replace(/[<>'"]/g, '') // Caractères HTML dangereux
    .substring(0, 100) // Limiter la longueur
}

/**
 * Valide un numéro de téléphone
 */
export function validatePhoneNumber(phone: string, countryCode: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: 'Numéro requis' }
  }
  
  // Retirer les espaces
  const cleanPhone = phone.replace(/\s/g, '')
  
  // Vérifier que ce sont des chiffres
  if (!/^\d+$/.test(cleanPhone)) {
    return { valid: false, error: 'Le numéro doit contenir uniquement des chiffres' }
  }
  
  // Vérifier la longueur
  if (cleanPhone.length < 4 || cleanPhone.length > 15) {
    return { valid: false, error: 'Longueur de numéro invalide' }
  }
  
  return { valid: true }
}

/**
 * Valide une adresse email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email requis' }
  }
  
  // Regex simple pour email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Format d\'email invalide' }
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email trop long' }
  }
  
  return { valid: true }
}

/**
 * Valide un titre
 */
export function validateTitle(title: string | undefined): { valid: boolean; error?: string } {
  if (!title) {
    return { valid: true } // Optionnel
  }
  
  if (title.length > 200) {
    return { valid: false, error: 'Titre trop long (max 200 caractères)' }
  }
  
  return { valid: true }
}

/**
 * Valide une description
 */
export function validateDescription(description: string | undefined): { valid: boolean; error?: string } {
  if (!description) {
    return { valid: true } // Optionnel
  }
  
  if (description.length > 1000) {
    return { valid: false, error: 'Description trop longue (max 1000 caractères)' }
  }
  
  return { valid: true }
}

/**
 * Extrait l'IP réelle du client de manière sécurisée
 */
export function getClientIp(headers: Headers): string {
  // Ordre de priorité pour obtenir la vraie IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Prendre la première IP (client original)
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0] || 'unknown'
  }
  
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  
  return 'unknown'
}
