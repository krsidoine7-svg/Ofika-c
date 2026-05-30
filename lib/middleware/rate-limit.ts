// =====================================================
// MIDDLEWARE - RATE LIMITING CENTRALISÉ
// =====================================================

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
  blocked?: boolean
  blockUntil?: number
}

// Store en mémoire (utiliser Redis en production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt && (!entry.blockUntil || now > entry.blockUntil)) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Nettoyage toutes les minutes

export interface RateLimitConfig {
  /**
   * Nombre maximum de requêtes autorisées
   */
  maxRequests: number
  
  /**
   * Fenêtre de temps en millisecondes
   */
  windowMs: number
  
  /**
   * Durée de blocage en cas de dépassement (optionnel)
   */
  blockDurationMs?: number
  
  /**
   * Message d'erreur personnalisé
   */
  message?: string
  
  /**
   * Fonction pour extraire l'identifiant (par défaut: IP)
   */
  keyGenerator?: (request: NextRequest) => string
}

/**
 * Vérifie le rate limit pour une requête
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number; error?: string } {
  
  const {
    maxRequests,
    windowMs,
    blockDurationMs,
    message = 'Trop de requêtes. Veuillez réessayer plus tard.',
    keyGenerator = defaultKeyGenerator
  } = config

  const identifier = keyGenerator(request)
  const now = Date.now()
  
  // Récupérer ou créer l'entrée
  let entry = rateLimitStore.get(identifier)
  
  // Vérifier si l'utilisateur est bloqué
  if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
    const remainingBlockTime = Math.ceil((entry.blockUntil - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockUntil,
      error: `${message} Bloqué pour ${remainingBlockTime}s.`
    }
  }
  
  // Réinitialiser si la fenêtre est expirée
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs
    }
    rateLimitStore.set(identifier, entry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt
    }
  }
  
  // Incrémenter le compteur
  entry.count++
  
  // Vérifier la limite
  if (entry.count > maxRequests) {
    // Bloquer temporairement si configuré
    if (blockDurationMs) {
      entry.blocked = true
      entry.blockUntil = now + blockDurationMs
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      error: message
    }
  }
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Générateur de clé par défaut (basé sur IP)
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Ajouter le path pour avoir des limites par endpoint
  const path = new URL(request.url).pathname
  
  return `${ip}:${path}`
}

/**
 * Générateur de clé par user ID (pour utilisateurs authentifiés)
 */
export function userIdKeyGenerator(userId: string, request: NextRequest): string {
  const path = new URL(request.url).pathname
  return `user:${userId}:${path}`
}

/**
 * Middleware HOF pour protéger les routes API
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = checkRateLimit(request, config)
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: result.error || 'Trop de requêtes',
          resetAt: result.resetAt 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.resetAt),
          }
        }
      )
    }
    
    // Ajouter les headers de rate limit
    const response = await handler(request)
    
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(result.resetAt))
    
    return response
  }
}

/**
 * Configurations prédéfinies par type d'endpoint
 */
export const RateLimitPresets = {
  // Endpoints publics (lecture)
  public: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  
  // Endpoints d'authentification
  auth: {
    maxRequests: 5,
    windowMs: 60000,
    blockDurationMs: 300000, // 5 minutes
    message: 'Trop de tentatives. Compte temporairement bloqué.'
  },
  
  // Endpoints de création
  create: {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Endpoints de mise à jour
  update: {
    maxRequests: 30,
    windowMs: 60000,
  },
  
  // Endpoints de suppression
  delete: {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Endpoints sensibles (paiements, etc.)
  sensitive: {
    maxRequests: 5,
    windowMs: 60000,
    blockDurationMs: 600000, // 10 minutes
  },
  
  // Endpoints gourmands (uploads, etc.)
  heavy: {
    maxRequests: 5,
    windowMs: 300000, // 5 minutes
  }
} as const

/**
 * Réinitialiser le rate limit pour un identifier (admin only)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Obtenir les stats de rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number
  blockedEntries: number
  entries: Array<{ key: string; count: number; blocked: boolean }>
} {
  const entries = Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    blocked: entry.blocked || false
  }))
  
  return {
    totalEntries: rateLimitStore.size,
    blockedEntries: entries.filter(e => e.blocked).length,
    entries
  }
}
