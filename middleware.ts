import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'

// =====================================================
// CONFIGURATION SÉCURISÉE DU MIDDLEWARE
// =====================================================

// Rate limiting thread-safe (Map locale)
// NOTE: En production (Serverless), privilégier Redis/Upstash pour un rate-limit partagé.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 200 // requests par minute
const API_RATE_LIMIT_MAX_REQUESTS = 150 // requests API par minute (augmenté pour éviter les 429)

// Origins autorisés (strict)
const ALLOWED_ORIGINS = [
  'https://ofika.ci',
  'https://ofika.vercel.app',
  process.env.NODE_ENV === 'development' ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') : null
].filter(Boolean) as string[]

// =====================================================
// UTILITAIRES DE SÉCURITÉ
// =====================================================

/**
 * Rate limiting sécurisé avec nettoyage automatique
 */
function checkRateLimit(identifier: string, maxRequests: number): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(identifier)

  // Nettoyer les anciennes entrées (garbage collection)
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * Détection d'attaques courantes
 */
function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname

  const suspiciousPatterns = [
    /sqlmap/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
    /wp-admin/i,
    /phpmyadmin/i,
    /\b\.env\b/i,
    /\b\.git\b/i,
    /wp-content/i,
    /wp-includes/i,
    /etc\/passwd/i,
    /cgi-bin/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(path) || pattern.test(userAgent))) {
    return true
  }

  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-client-ip']
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header)
    if (value && value.split(',').length > 10) { // Seuil augmenté pour éviter les faux positifs mais limiter les abus
      return true
    }
  }

  return false
}

/**
 * Sanitisation de l'IP client
 */
function getClientIP(request: NextRequest): string {
  const sources = [
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    request.headers.get('x-real-ip'),
    request.headers.get('cf-connecting-ip'),
  ]

  for (const ip of sources) {
    if (ip && typeof ip === 'string' && ip !== 'unknown') {
      if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)) {
        return ip
      }
    }
  }

  return 'unknown'
}

// =====================================================
// MIDDLEWARE PRINCIPAL
// =====================================================

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const clientIP = getClientIP(request)
  const path = request.nextUrl.pathname
  const isApiRoute = path.startsWith('/api/')
  const isProduction = process.env.NODE_ENV === 'production'

  // 1. Détection d'activité suspecte (Logging Sécurité)
  if (detectSuspiciousActivity(request)) {
    logger.security(`Activité suspecte bloquée`, {
      ip: clientIP,
      method: request.method,
      path,
      userAgent: request.headers.get('user-agent')
    })
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Rate limiting (Exemption pour localhost en dev)
  const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'unknown'
  const maxRequests = isApiRoute ? API_RATE_LIMIT_MAX_REQUESTS : RATE_LIMIT_MAX_REQUESTS

  if (!isLocalhost && !checkRateLimit(clientIP, maxRequests)) {
    logger.warn(`Rate limit atteint`, { ip: clientIP, path })
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // 3. Initialisation de la réponse
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Optimisation de performance : n'appeler l'API Supabase Auth que pour les routes protégées ou gérant l'auth
  const needsAuthCheck = path.startsWith('/dashboard') || path.startsWith('/auth/login') || path.startsWith('/auth/signup')

  if (needsAuthCheck) {
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({ name, value, ...options })
            })
          },
        },
      }
    )

    // SESSION : Récupération sécurisée du user
    const { data: { user } } = await supabase.auth.getUser()

    // 4. PROTECTION DES ROUTES (RBAC / Auth Enforcement)
    if (!user && path.startsWith('/dashboard')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirection stricte des administrateurs vers le dashboard admin (sauf pour les paramètres de profil)
    if (user && path.startsWith('/dashboard') && !path.startsWith('/dashboard/admin')) {
      const role = user.app_metadata?.role
      if (role === 'admin' || role === 'super_admin') {
        // Autoriser l'accès aux paramètres de profil pour l'admin
        if (path !== '/dashboard/settings' && !path.startsWith('/dashboard/settings/')) {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        }
      }
    }

    // Redirection si déjà connecté
    if (user && (path.startsWith('/auth/login') || path.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 5. HEADERS DE SÉCURITÉ OWASP (CSP, HSTS, etc.)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.supabase.co https://*.vercel-scripts.com https://*.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com https://*.lygosapp.com https://api.qrserver.com https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.lygosapp.com https://ipapi.co;
    worker-src 'self' blob:;
    child-src 'self' blob:;
    frame-src 'self' https://*.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const securityHeaders = {
    'Content-Security-Policy': cspHeader,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // CORS sécurisé
  const origin = request.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
  }

  // 6. Logging Performance et Activité
  if (isApiRoute && request.method !== 'GET') {
    const duration = Date.now() - startTime
    logger.performance(`${request.method} ${path}`, duration, { ip: clientIP.substring(0, 7) + '***' })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
  ],
}

