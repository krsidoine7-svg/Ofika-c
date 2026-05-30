import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// ========================================
// VALIDATION SCHEMA
// ========================================

const moderateReviewSchema = z.object({
  moderation_status: z.enum(['pending', 'approved', 'rejected']),
  moderation_note: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
  is_verified: z.boolean().optional(),
})

// ========================================
// API HANDLER
// ========================================

/**
 * PATCH /api/reviews/moderate/[reviewId]
 * Modérer un avis (approuver, rejeter, modifier visibilité)
 * 
 * Auth: Required (propriétaire du lien associé)
 * Body: { moderation_status, moderation_note?, is_public?, is_verified? }
 * Returns: Updated review
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const supabase = await createClient()
    const { reviewId } = await params
    
    // ========================================
    // AUTH CHECK
    // ========================================
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // ========================================
    // VALIDATION
    // ========================================
    const body = await request.json()
    const validated = moderateReviewSchema.parse(body)
    
    // ========================================
    // VÉRIFIER QUE L'AVIS EXISTE ET APPARTIENT À UN LIEN DE L'USER
    // ========================================
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        link_id,
        review_links!inner(user_id)
      `)
      .eq('id', reviewId)
      .single()
    
    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }
    
    // Vérifier propriété via le lien associé
    const linkUserId = (review as any).review_links?.user_id
    if (linkUserId !== user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }
    
    // ========================================
    // UPDATE
    // ========================================
    const { data, error } = await supabase
      .from('reviews')
      .update({
        moderation_status: validated.moderation_status,
        moderation_note: validated.moderation_note || null,
        is_public: validated.is_public ?? undefined,
        is_verified: validated.is_verified ?? undefined,
      })
      .eq('id', reviewId)
      .select()
      .single()
    
    if (error) {
      console.error('[moderate] Update error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la modération' },
        { status: 500 }
      )
    }
    
    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      message: `Avis ${validated.moderation_status === 'approved' ? 'approuvé' : validated.moderation_status === 'rejected' ? 'rejeté' : 'mis en attente'}`,
      data,
    })
    
  } catch (error) {
    console.error('[moderate] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reviews/moderate/[reviewId]
 * Supprimer un avis
 * 
 * Auth: Required (propriétaire du lien associé)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const supabase = await createClient()
    const { reviewId } = await params
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Vérifier propriété
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        client_name,
        link_id,
        review_links!inner(user_id)
      `)
      .eq('id', reviewId)
      .single()
    
    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Avis non trouvé' },
        { status: 404 }
      )
    }
    
    const linkUserId = (review as any).review_links?.user_id
    if (linkUserId !== user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }
    
    // Supprimer
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
    
    if (error) {
      console.error('[moderate] Delete error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Avis supprimé',
    })
    
  } catch (error) {
    console.error('[moderate] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
