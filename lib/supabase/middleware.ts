import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRequestClientIp } from '@/lib/utils/request-ip'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env'
import { rateLimit } from '@/lib/rate-limit'

// Fonction de log sécurisée
function logSecurityEvent(event: string, details: any) {
  try {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY] ${timestamp} - ${event}:`, details)
  } catch (error) {
    console.error('Erreur de logging:', error)
  }
}

export async function middleware(req: NextRequest) {
  // Rate limiting pour les pages d'authentification
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    const ip = getRequestClientIp(req)
    const isAllowed = rateLimit(ip, 10, 60000) // 10 tentatives par minute
    
    if (!isAllowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, path: req.nextUrl.pathname })
      return new NextResponse('Trop de tentatives. Veuillez réessayer plus tard.', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      })
    }
  }

  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            })
          },
        },
      }
    )

    // Utilisation de getUser() au lieu de getSession() pour la sécurité
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Log des événements d'authentification
    if (user && !error) {
      logSecurityEvent('AUTHENTICATED_ACCESS', { 
        user_id: user.id, 
        path: req.nextUrl.pathname 
      })
    }

    // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth, rediriger vers le dashboard
    if (user && !error && (req.nextUrl.pathname.startsWith('/auth/login') || req.nextUrl.pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder au dashboard, rediriger vers la connexion
    if ((!user || error) && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

  } catch (error) {
    // En cas d'erreur avec Supabase, continuer sans authentification
    console.error('Middleware auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}