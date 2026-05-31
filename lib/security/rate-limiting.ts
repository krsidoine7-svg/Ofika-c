import { NextRequest } from 'next/server'

/**
 * Service de rate limiting avancé
 * Protection contre les attaques par déni de service et brute force
 */

interface RateLimitConfig {
  windowMs: number // Fenêtre de temps en ms
  maxRequests: number // Nombre max de requêtes
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
    blocked: boolean
  }
}

// Store en mémoire (en production, utiliser Redis)
const store: RateLimitStore = {}

// Configurations par type de requête
const rateLimitConfigs: { [key: string]: RateLimitConfig } = {
  // API générale
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => `api:${getClientIP(req)}`
  },
  
  // Authentification
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 tentatives de connexion
    keyGenerator: (req) => `auth:${getClientIP(req)}`
  },
  
  // Inscription
  signup: {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 3, // 3 inscriptions par heure
    keyGenerator: (req) => `signup:${getClientIP(req)}`
  },
  
  // Upload d'images
  upload: {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 20, // 20 uploads par heure
    keyGenerator: (req) => `upload:${getClientIP(req)}`
  },
  
  // Création de profils
  profile: {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 10, // 10 profils par heure
    keyGenerator: (req) => `profile:${getClientIP(req)}`
  },
  
  // Requêtes de contact
  contact: {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 50, // 50 requêtes de contact par heure
    keyGenerator: (req) => `contact:${getClientIP(req)}`
  }
}

/**
 * Obtient l'IP du client
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

/**
 * Nettoie le store des entrées expirées
 */
function cleanupStore(): void {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

/**
 * Vérifie le rate limit
 */
export function checkRateLimit(
  req: NextRequest,
  type: keyof typeof rateLimitConfigs = 'api'
): {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
} {
  const config = rateLimitConfigs[type]
  if (!config) {
    return { allowed: true, remaining: Infinity, resetTime: 0 }
  }
  
  const key = config.keyGenerator ? config.keyGenerator(req) : `default:${getClientIP(req)}`
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Nettoyage périodique
  if (Math.random() < 0.01) { // 1% de chance
    cleanupStore()
  }
  
  // Récupération ou création de l'entrée
  let entry = store[key]
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false
    }
    store[key] = entry
  }
  
  // Vérification du blocage
  if (entry.blocked && entry.resetTime > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    }
  }
  
  // Incrémentation du compteur
  entry.count++
  
  // Vérification de la limite
  if (entry.count > config.maxRequests) {
    entry.blocked = true
    entry.resetTime = now + config.windowMs
    
    // Log de l'attaque
    console.warn(`Rate limit exceeded for ${type}:`, {
      ip: getClientIP(req),
      count: entry.count,
      maxRequests: config.maxRequests,
      userAgent: req.headers.get('user-agent'),
      url: req.url
    })
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil(config.windowMs / 1000)
    }
  }
  
  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  }
}

/**
 * Middleware de rate limiting pour les API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  type: keyof typeof rateLimitConfigs = 'api'
) {
  return async (req: NextRequest): Promise<Response> => {
    const rateLimit = checkRateLimit(req, type)
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes',
          message: 'Rate limit exceeded. Veuillez réessayer plus tard.',
          retryAfter: rateLimit.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': rateLimitConfigs[type]?.maxRequests.toString() || '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
          }
        }
      )
    }
    
    // Ajout des headers de rate limit
    const response = await handler(req)
    
    response.headers.set('X-RateLimit-Limit', rateLimitConfigs[type]?.maxRequests.toString() || '100')
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())
    
    return response
  }
}

/**
 * Rate limiting adaptatif basé sur le comportement
 */
export function adaptiveRateLimit(req: NextRequest): {
  allowed: boolean
  reason?: string
  retryAfter?: number
} {
  const ip = getClientIP(req)
  const userAgent = req.headers.get('user-agent') || ''
  const url = req.url
  
  // Détection de patterns suspects
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|java|php/i,
    /sqlmap|nikto|nmap|masscan/i
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(url)
  )
  
  if (isSuspicious) {
    // Rate limit plus strict pour les requêtes suspectes
    const strictConfig = {
      windowMs: 60 * 60 * 1000, // 1 heure
      maxRequests: 10
    }
    
    const key = `strict:${ip}`
    const now = Date.now()
    
    let entry = store[key]
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + strictConfig.windowMs,
        blocked: false
      }
      store[key] = entry
    }
    
    entry.count++
    
    if (entry.count > strictConfig.maxRequests) {
      entry.blocked = true
      return {
        allowed: false,
        reason: 'Comportement suspect détecté',
        retryAfter: Math.ceil(strictConfig.windowMs / 1000)
      }
    }
  }
  
  // Rate limit normal
  const normalRateLimit = checkRateLimit(req, 'api')
  return {
    allowed: normalRateLimit.allowed,
    retryAfter: normalRateLimit.retryAfter
  }
}

/**
 * Rate limiting par utilisateur authentifié
 */
export function userRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 60 * 1000
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const key = `user:${userId}:${action}`
  const now = Date.now()
  
  let entry = store[key]
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
      blocked: false
    }
    store[key] = entry
  }
  
  entry.count++
  
  if (entry.count > maxRequests) {
    entry.blocked = true
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime
  }
}

/**
 * Détecte les tentatives de brute force
 */
export function detectBruteForce(ip: string, windowMs: number = 15 * 60 * 1000): boolean {
  const key = `bruteforce:${ip}`
  const now = Date.now()
  
  let entry = store[key]
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
      blocked: false
    }
    store[key] = entry
  }
  
  entry.count++
  
  // Seuil de détection : 10 tentatives en 15 minutes
  if (entry.count > 10) {
    entry.blocked = true
    console.warn(`Brute force detected from IP: ${ip}`)
    return true
  }
  
  return false
}

/**
 * Réinitialise le rate limit pour une IP
 */
export function resetRateLimit(ip: string): void {
  Object.keys(store).forEach(key => {
    if (key.includes(ip)) {
      delete store[key]
    }
  })
}

/**
 * Obtient les statistiques de rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number
  blockedIPs: number
  topIPs: Array<{ ip: string; requests: number }>
} {
  const now = Date.now()
  let blockedIPs = 0
  const ipStats: { [ip: string]: number } = {}
  
  Object.entries(store).forEach(([key, entry]) => {
    if (entry.blocked && entry.resetTime > now) {
      blockedIPs++
    }
    
    const ip = key.split(':')[1] // Extraction de l'IP
    if (ip) {
      ipStats[ip] = (ipStats[ip] || 0) + entry.count
    }
  })
  
  const topIPs = Object.entries(ipStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, requests]) => ({ ip, requests }))
  
  return {
    totalEntries: Object.keys(store).length,
    blockedIPs,
    topIPs
  }
}
