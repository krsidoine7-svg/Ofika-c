import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'


/**
 * API pour gérer le mode Mascarade (Impersonation)
 * Seuls les administrateurs peuvent appeler cette route.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 1. Vérifier si l'utilisateur est un admin
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRecord || (userRecord.role !== 'admin' && userRecord.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { userId, action } = await request.json()

    if (action === 'start') {
      if (!userId) return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
      
      const response = NextResponse.json({ success: true, message: 'Mode Mascarade activé' })
      
      // Définir le cookie d'impersonation (expire dans 1h)
      response.cookies.set('x-impersonating-user', userId, {
        path: '/',
        httpOnly: false, // Accessible par le JS client pour les hooks de données
        maxAge: 3600, // 1 heure
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
      
      // Tracer l'action dans l'audit
      await AuditService.log({
        action: 'IMPERSONATION_START',
        targetType: 'user',
        targetId: userId,
        details: { adminId: user.id }
      })

      return response
    } 
    
    if (action === 'stop') {
      const response = NextResponse.json({ success: true, message: 'Mode Mascarade désactivé' })
      response.cookies.delete('x-impersonating-user')
      // Tracer l'action dans l'audit
      await AuditService.log({
        action: 'IMPERSONATION_STOP',
        targetType: 'user',
        details: { adminId: user.id }
      })

      return response
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })

  } catch (error: any) {
    console.error('API Impersonate error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const impersonatingId = request.cookies.get('x-impersonating-user')?.value
  
  if (!impersonatingId) {
    return NextResponse.json({ impersonatingId: null })
  }

  try {
    const supabase = await createClient()
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', impersonatingId)
      .single()

    return NextResponse.json({ 
      impersonatingId, 
      user: userData ? {
        email: userData.email,
        name: userData.name
      } : null
    })
  } catch (err) {
    return NextResponse.json({ impersonatingId, user: null })
  }
}
