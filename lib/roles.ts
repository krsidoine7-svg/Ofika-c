// =====================================================
// DÉFINITION ET CENTRALISATION DES RÔLES UTILISATEURS
// =====================================================

export type UserRole = 'CLIENT' | 'ADMIN' | 'TECH'

export const DEFAULT_ROLE: UserRole = 'CLIENT'

/**
 * Normalise n'importe quelle chaîne de rôle (base de données ou token)
 * vers l'énumération officielle UserRole (CLIENT, ADMIN, TECH).
 * Assure une rétrocompatibilité totale avec les rôles existants ('client', 'super_admin', etc.).
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return DEFAULT_ROLE

  const normalized = role.trim().toUpperCase()

  if (normalized === 'TECH') {
    return 'TECH'
  }

  if (normalized === 'ADMIN' || normalized === 'SUPER_ADMIN') {
    return 'ADMIN'
  }

  return 'CLIENT'
}

/**
 * Route d'accueil par défaut selon le rôle de l'utilisateur après connexion
 */
export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  CLIENT: '/dashboard',
  ADMIN: '/dashboard/admin',
  TECH: '/dashboard/tech',
}

/**
 * Liste des préfixes de routes autorisés pour chaque rôle
 */
export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  CLIENT: [
    '/dashboard',
    '/compte',
    '/checkout',
    '/card',
    '/cards',
    '/onboarding',
    '/order',
    '/avis',
  ],
  ADMIN: [
    '/dashboard/admin',
    '/admin',
    '/dashboard/settings',
  ],
  TECH: [
    '/dashboard/tech',
    '/tech',
    '/dashboard/admin',
    '/admin',
    '/dashboard/settings',
  ],
}

/**
 * Retourne la page de redirection appropriée pour un rôle donné
 */
export function getHomeRouteForRole(role?: string | null): string {
  const normalized = normalizeRole(role)
  return ROLE_HOME_ROUTES[normalized] || ROLE_HOME_ROUTES.CLIENT
}

/**
 * Vérifie si une URL donnée est autorisée pour un rôle donné
 */
export function isRouteAllowedForRole(pathname: string, role?: string | null): boolean {
  const normalized = normalizeRole(role)

  // 1. Les routes tech sont strictement réservées au rôle TECH
  if (pathname.startsWith('/dashboard/tech') || pathname.startsWith('/tech')) {
    return normalized === 'TECH'
  }

  // 2. Les routes admin sont réservées à ADMIN et TECH
  if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/admin')) {
    return normalized === 'ADMIN' || normalized === 'TECH'
  }

  // 3. Les admins et techniciens ne doivent pas être sur l'espace client (sauf paramètres de profil)
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/admin') && !pathname.startsWith('/dashboard/tech')) {
    if (normalized === 'ADMIN' || normalized === 'TECH') {
      // Seuls les réglages de profil sont autorisés dans /dashboard
      return pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')
    }
  }

  // 4. Par défaut pour les routes client
  return true
}

/**
 * Vérifie si l'utilisateur appartient au personnel (Staff : ADMIN ou TECH)
 */
export function isStaffRole(role?: string | null): boolean {
  const normalized = normalizeRole(role)
  return normalized === 'ADMIN' || normalized === 'TECH'
}

/**
 * Valide et assainit une URL de redirection (anti-redirection ouverte / CWE-601).
 * Garantit que la redirection reste strictement interne, sans faille de protocole,
 * et correspond aux permissions du rôle connecté.
 */
export function sanitizeRedirectUrl(rawUrl?: string | null, role?: string | null): string {
  const fallback = getHomeRouteForRole(role)
  if (!rawUrl || typeof rawUrl !== 'string') {
    return fallback
  }

  const trimmed = rawUrl.trim()

  // 1. Rejeter toute URL vide ou ne commençant pas par '/'
  if (!trimmed.startsWith('/')) {
    return fallback
  }

  // 2. Rejeter les URLs relatives de protocole (ex: //evil.com)
  if (trimmed.startsWith('//')) {
    return fallback
  }

  // 3. Rejeter les caractères de contrôle et les backslashes (\evil.com)
  if (trimmed.includes('\\') || /[\r\n\0]/.test(trimmed)) {
    return fallback
  }

  // 4. Rejeter les schémas d'URI malveillants injectés (javascript:, data:, vbscript:)
  if (/^(?:[a-z]+:)/i.test(trimmed.replace(/^\/+/, ''))) {
    return fallback
  }

  // 5. Rejeter si le parser d'URL détecte un changement d'origine
  try {
    const parsed = new URL(trimmed, 'https://ofika.local')
    if (parsed.origin !== 'https://ofika.local') {
      return fallback
    }

    // 6. Vérifier si le rôle est autorisé sur cette route
    if (!isRouteAllowedForRole(parsed.pathname, role)) {
      return fallback
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
