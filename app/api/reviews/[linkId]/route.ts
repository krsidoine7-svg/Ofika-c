import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


/**
 * GET /api/reviews/[linkId]
 * Récupérer tous les avis d'un lien de collecte spécifique
 * Avec filtres et pagination
 * 
 * Auth: Required (propriétaire du lien)
 * Query params:
 *   - rating: number (1-5) - Filtrer par note
 *   - status: string - Filtrer par moderation_status
 *   - search: string - Recherche dans nom, email, commentaire
 *   - limit: number - Nombre de résultats (max 100)
 *   - offset: number - Pagination
 * Returns: Array of reviews
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const supabase = await createClient()
    
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
    // QUERY PARAMS
    // ========================================
    const searchParams = request.nextUrl.searchParams
    const rating = searchParams.get('rating')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // ========================================
    // GESTION DU FILTRE LINK_ID
    // ========================================
    let targetLinkIds: string[] = []

    if (params.linkId === 'all') {
      // Cas "Tous les avis" : On récupère tous les liens de l'utilisateur
      const { data: links, error: linksError } = await supabase
        .from('review_links')
        .select('id')
        .eq('user_id', user.id)

      if (linksError) {
        return NextResponse.json({ error: 'Erreur liens' }, { status: 500 })
      }

      if (!links || links.length === 0) {
        // L'utilisateur n'a aucun lien, donc aucun avis
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, limit, offset, has_more: false },
          filters: { rating: null, status, search }
        })
      }

      targetLinkIds = links.map(l => l.id)
    } else {
      // Cas "Lien spécifique" : On vérifie la propriété du lien
      const { data: link, error: linkError } = await supabase
        .from('review_links')
        .select('id, user_id')
        .eq('id', params.linkId)
        .single()
      
      if (linkError || !link) {
        return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
      }
      
      if (link.user_id !== user.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      targetLinkIds = [link.id]
    }
    
    // ========================================
    // BUILD QUERY
    // ========================================
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .in('link_id', targetLinkIds) // Utilisation de .in() pour gérer 1 ou N liens
      .order('created_at', { ascending: false })
    
    // Filtre par rating
    if (rating && !isNaN(parseInt(rating))) {
      query = query.eq('rating', parseInt(rating))
    }
    
    // Filtre par statut de modération
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('moderation_status', status)
    }
    
    // Recherche texte (nom, email, commentaire)
    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(
        `client_name.ilike.${searchTerm},client_email.ilike.${searchTerm},comment.ilike.${searchTerm}`
      )
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1)
    
    // ========================================
    // EXECUTE QUERY
    // ========================================
    const { data: reviews, error, count } = await query
    
    if (error) {
      console.error('[reviews/[linkId]] Fetch error:', error)
      return NextResponse.json(
        { error: 'Erreur de récupération des avis' },
        { status: 500 }
      )
    }
    
    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      data: reviews || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
      filters: {
        rating: rating ? parseInt(rating) : null,
        status,
        search,
      },
    })
    
  } catch (error) {
    console.error('[reviews/[linkId]] Error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
