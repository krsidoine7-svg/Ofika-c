import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// ========================================
// VALIDATION SCHEMA
// ========================================

const updateLinkSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  fields_config: z.object({
    name_required: z.boolean().optional(),
    email_required: z.boolean().optional(),
    comment_required: z.boolean().optional(),
    media_enabled: z.boolean().optional(),
    purchase_verification: z.boolean().optional(),
  }).optional(),
  is_active: z.boolean().optional(),
})

// ========================================
// GET - Récupérer un lien spécifique
// ========================================

/**
 * GET /api/reviews/links/[id]
 * Récupérer les détails d'un lien avec ses statistiques
 * 
 * Auth: Required (propriétaire uniquement)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const supabase = await createClient()
    const { linkId } = await params
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Fetch link
    const { data: link, error } = await supabase
      .from('review_links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', user.id) // Vérification propriétaire
      .is('deleted_at', null)
      .single()
    
    if (error || !link) {
      return NextResponse.json(
        { error: 'Lien non trouvé' },
        { status: 404 }
      )
    }
    
    // Fetch stats
    const { data: stats } = await supabase
      .rpc('get_review_link_stats', { p_link_id: link.id })
      .single()
    
    return NextResponse.json({
      success: true,
      data: {
        ...link,
        stats: stats || {},
        public_url: `${(process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')}/avis/${link.slug}`,
      },
    })
    
  } catch (error) {
    console.error('[links/[id]] GET Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ========================================
// PATCH - Modifier un lien
// ========================================

/**
 * PATCH /api/reviews/links/[id]
 * Modifier un lien de collecte (titre, config, actif/inactif)
 * 
 * Auth: Required (propriétaire uniquement)
 * Body: { title?, fields_config?, is_active? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const supabase = await createClient()
    const { linkId } = await params
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Validation
    const body = await request.json()
    const validated = updateLinkSchema.parse(body)
    
    // Vérifier que le lien existe et appartient à l'utilisateur
    const { data: existingLink, error: checkError } = await supabase
      .from('review_links')
      .select('id')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()
    
    if (checkError || !existingLink) {
      return NextResponse.json(
        { error: 'Lien non trouvé' },
        { status: 404 }
      )
    }
    
    // Update
    const { data, error } = await supabase
      .from('review_links')
      .update(validated)
      .eq('id', linkId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('[links/[id]] PATCH Error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        public_url: `${(process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')}/avis/${data.slug}`,
      },
    })
    
  } catch (error) {
    console.error('[links/[id]] PATCH Error:', error)
    
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

// ========================================
// DELETE - Supprimer un lien
// ========================================

/**
 * DELETE /api/reviews/links/[id]
 * Supprimer un lien de collecte (et tous les avis associés)
 * 
 * Auth: Required (propriétaire uniquement)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const supabase = await createClient()
    const { linkId } = await params
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Vérifier que le lien existe
    const { data: existingLink, error: checkError } = await supabase
      .from('review_links')
      .select('id, title')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()
    
    if (checkError || !existingLink) {
      return NextResponse.json(
        { error: 'Lien non trouvé' },
        { status: 404 }
      )
    }
    
    // Compter les avis associés (pour info)
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('link_id', linkId)
      .is('deleted_at', null)
    
    // Paramètre optionnel pour supprimer aussi les avis associés
    const searchParams = request.nextUrl.searchParams
    const deleteReviews = searchParams.get('delete_reviews') === 'true'
    const nowStr = new Date().toISOString()
    
    // Soft delete du lien
    const { error: linkError } = await supabase
      .from('review_links')
      .update({ deleted_at: nowStr })
      .eq('id', linkId)
      .eq('user_id', user.id)
    
    if (linkError) {
      console.error('[links/[id]] DELETE Link Error:', linkError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    // Soft delete des avis associés si demandé
    if (deleteReviews && count && count > 0) {
      const { error: reviewsError } = await supabase
        .from('reviews')
        .update({ deleted_at: nowStr })
        .eq('link_id', linkId)

      if (reviewsError) {
        console.error('[links/[id]] DELETE Reviews Error:', reviewsError)
        // Note: On ne fail pas tout si le lien a été archivé avec succès, mais on log l'erreur.
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Lien "${existingLink.title}" supprimé`,
      deleted_reviews_count: deleteReviews ? (count || 0) : 0,
      reviews_archived: deleteReviews
    })
    
  } catch (error) {
    console.error('[links/[id]] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
