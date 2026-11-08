import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { AuditService } from '@/lib/services/audit-service'

import { requireStaffAuth } from '@/lib/auth/admin-guard'

export const dynamic = 'force-dynamic'

/**
 * Gestion des actions critiques sur les utilisateurs :
 * - Toggle Admin Status
 * - Mise à jour de Plan (Subscription Tier)
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Vérification stricte des droits administrateur
    const authCheck = await requireStaffAuth()
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const body = await request.json()
    const { userId, action, tier } = body

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identifiant utilisateur (userId) manquant ou invalide' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    if (action === 'TOGGLE_ADMIN') {
      const { isAdmin, email } = body
      const newRole = isAdmin ? 'admin' : 'client'

      // Empêcher un admin de rétrograder son propre compte
      if (userId === authCheck.user?.id && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Impossible de révoquer vos propres privilèges administrateur' },
          { status: 400 }
        )
      }

      const { error } = await adminSupabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      await AuditService.log({
        action: 'USER_ROLE_UPDATE',
        targetType: 'user',
        targetId: userId,
        details: { isAdmin: !!isAdmin, email, updatedBy: authCheck.user?.id }
      })

      return NextResponse.json({ success: true, message: `Rôle mis à jour vers ${newRole}` })
    }

    if (action === 'UPDATE_PLAN') {
      const { previousTier } = body

      if (!tier || typeof tier !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Le plan (tier) est requis' },
          { status: 400 }
        )
      }

      const { error } = await adminSupabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', userId)

      if (error) throw error

      await AuditService.log({
        action: 'USER_ROLE_UPDATE',
        targetType: 'user',
        targetId: userId,
        details: { previousTier, newTier: tier, updatedBy: authCheck.user?.id }
      })

      return NextResponse.json({ success: true, message: `Plan mis à jour vers ${tier}` })
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('API User PATCH error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * Suppression d'un utilisateur (réservé aux administrateurs)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Vérification stricte des droits administrateur
    const authCheck = await requireStaffAuth()
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant utilisateur (id) manquant' },
        { status: 400 }
      )
    }

    // Empêcher un admin de supprimer son propre compte
    if (userId === authCheck.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer votre propre compte administrateur' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Avant de supprimer, on récupère l'email pour le log d'audit
    const { data: userData } = await adminSupabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const { error } = await adminSupabase.from('users').delete().eq('id', userId)
    if (error) throw error

    await AuditService.log({
      action: 'USER_DELETE',
      targetType: 'user',
      targetId: userId,
      details: { email: userData?.email, deletedBy: authCheck.user?.id }
    })

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès' })
  } catch (error: any) {
    console.error('API User DELETE error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

