import { NextRequest } from 'next/server'
import { getRequestClientIp } from '@/lib/utils/request-ip'

/**
 * Service de rate limiting pour protéger contre les attaques DDoS
 */

interface RateLimitConfig {
  windowMs: number // Fenêtre de temps en ms
  maxRequests: number // Nombre max de requêtes
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private static instance: RateLimiter
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Nettoyage automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  /**
   * Vérifie si une requête est autorisée
   */
  checkLimit(
    identifier: string, 
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Nettoyer les entrées expirées
    this.cleanupExpired(windowStart)
    
    const entry = this.store.get(identifier)
    
    if (!entry || entry.resetTime < now) {
      // Nouvelle fenêtre ou entrée expirée
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs
      }
      this.store.set(identifier, newEntry)
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }
    
    if (entry.count >= config.maxRequests) {
      // Limite atteinte
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }
    
    // Incrémenter le compteur
    entry.count++
    this.store.set(identifier, entry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Nettoyage des entrées expirées
   */
  private cleanupExpired(windowStart: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < windowStart) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Nettoyage général
   */
  private cleanup(): void {
    const now = Date.now()
    this.cleanupExpired(now - 24 * 60 * 60 * 1000) // Garder seulement les dernières 24h
  }

  /**
   * Obtenir l'IP réelle de la requête
   */
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return getRequestClientIp(request)
  }
}

// Configurations de rate limiting par endpoint
export const RATE_LIMIT_CONFIGS = {
  // API générales
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  
  // Authentification
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },
  
  // Paiements
  payment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3
  },
  
  // Upload d'images
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  },
  
  // Analytics
  analytics: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  }
}

/**
 * Middleware de rate limiting pour les API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const limiter = RateLimiter.getInstance()
    const clientIP = RateLimiter.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Combiner IP + User-Agent pour un identifiant unique
    const identifier = `${clientIP}:${userAgent.substring(0, 50)}`
    
    const result = limiter.checkLimit(identifier, config)
    
    if (!result.allowed) {
      console.warn(`Rate limit exceeded for ${clientIP}`)
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      )
    }
    
    return null // Continuer la requête
  }
}

// Export des limiters spécifiques
export const fileUploadLimiter = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.upload)
export const urlValidationLimiter = createRateLimitMiddleware(RATE_LIMIT_CONFIGS.api)