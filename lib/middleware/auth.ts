import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Higher-order function pour protéger les routes API avec authentification
 * Élimine la duplication du code d'authentification dans toutes les routes
 * 
 * @example
 * export const GET = withAuth(async (request, user) => {
 *   // user est garanti d'exister ici
 *   return NextResponse.json({ data: 'protected data' })
 * })
 */
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    user: User,
    params: T
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const resolvedParams = await context.params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier si le compte de l'utilisateur est actif (Soft Delete Check)
    let isActive = true
    const { data: dbUser } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', user.id)
      .maybeSingle()
      
    if (dbUser) {
      isActive = dbUser.is_active !== false
    } else {
      const { data: dbAdmin } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('id', user.id)
        .maybeSingle()
      if (dbAdmin) {
        isActive = dbAdmin.is_active !== false
      }
    }

    if (!isActive) {
      return NextResponse.json(
        { success: false, error: 'Votre compte a été désactivé' },
        { status: 403 }
      )
    }

    // --- Support du Mode Mascarade (Impersonation) ---
    const impersonatedId = request.cookies.get('x-impersonating-user')?.value
    
    if (impersonatedId && impersonatedId !== user.id) {
        // 1. Vérifier que l'utilisateur ACTUEL est un administrateur
        const { data: isAdmin } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single()

        if (isAdmin) {
            // 2. Créer un clone de l'utilisateur avec l'ID usurpé pour le reste de la requête
            const impersonatedUser = { ...user, id: impersonatedId }
            return handler(request, impersonatedUser, resolvedParams)
        }
    }
    
    return handler(request, user, resolvedParams)
  }
}

/**
 * Vérifie que l'utilisateur est propriétaire d'une ressource
 * 
 * @example
 * const ownership = await verifyOwnership('profiles', profileId, user.id)
 * if (!ownership.isOwner) {
 *   return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
 * }
 */
export async function verifyOwnership(
  table: string,
  resourceId: string,
  userId: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from(table)
    .select('id, user_id')
    .eq('id', resourceId)
    .eq('user_id', userId)
    .single()
  
  return {
    isOwner: !error && !!data,
    data,
    error
  }
}

/**
 * Version combinée : Auth + Ownership en une seule fonction
 * 
 * @example
 * export const PUT = withAuthAndOwnership('profiles', async (request, user, resource, params) => {
 *   // user et resource sont garantis d'exister
 *   return NextResponse.json({ data: resource })
 * })
 */
export function withAuthAndOwnership<T extends Record<string, any> = any>(
  table: string,
  handler: (
    request: NextRequest,
    user: User,
    resource: any,
    params?: T
  ) => Promise<NextResponse>
) {
  return withAuth<T>(async (request, user, params) => {
    const resourceId = (params as any)?.id || (params as any)?.slug
    
    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'ID de ressource manquant' },
        { status: 400 }
      )
    }
    
    const ownership = await verifyOwnership(table, resourceId as string, user.id)
    
    if (!ownership.isOwner) {
      return NextResponse.json(
        { success: false, error: 'Ressource non trouvée ou accès refusé' },
        { status: 404 }
      )
    }
    
    return handler(request, user, ownership.data, params)
  })
}
