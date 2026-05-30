// =====================================================
// SYSTÈME DE RATE LIMITING SIMPLE EN MÉMOIRE
// Pour production, utiliser Redis ou une autre solution persistante
// =====================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Map en mémoire pour stocker les compteurs
// ATTENTION: Sera réinitialisé à chaque redémarrage du serveur
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Vérifie si une requête est autorisée selon les limites de taux
 * @param identifier - Identifiant unique (IP, user_id, etc.)
 * @param limit - Nombre maximum de requêtes autorisées
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute par défaut
): {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Si pas d'entrée ou entrée expirée
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs
    }
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier si la limite est dépassée
  if (entry.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000) // en secondes
    }
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Rate limiter pour les scans de QR codes
 * Limite: 100 scans par IP par heure
 */
export function rateLimitQRScan(ipAddress: string) {
  return checkRateLimit(`qr-scan:${ipAddress}`, 100, 60 * 60 * 1000)
}

/**
 * Rate limiter pour la création de QR codes
 * Limite: 20 créations par utilisateur par heure
 */
export function rateLimitQRCreation(userId: string) {
  return checkRateLimit(`qr-create:${userId}`, 20, 60 * 60 * 1000)
}

/**
 * Rate limiter pour le téléchargement de QR codes
 * Limite: 30 téléchargements par IP par heure
 */
export function rateLimitQRDownload(ipAddress: string) {
  return checkRateLimit(`qr-download:${ipAddress}`, 30, 60 * 60 * 1000)
}

/**
 * Réinitialiser le rate limit pour un identifiant (utile pour les tests)
 */
export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier)
}
