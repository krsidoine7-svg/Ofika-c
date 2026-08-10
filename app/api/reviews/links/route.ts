import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


/**
 * GET /api/reviews/links
 * Récupérer tous les liens de collecte d'avis de l'utilisateur connecté
 * Avec statistiques agrégées par lien
 * 
 * Auth: Required
 * Query params: 
 *   - active_only: boolean (optionnel)
 * Returns: Array of links with stats
 */
export async function GET(request: NextRequest) {
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
    const activeOnly = searchParams.get('active_only') === 'true'
    
    // ========================================
    // FETCH LINKS
    // ========================================
    let query = supabase
      .from('review_links')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    // Filtre actif uniquement
    if (activeOnly) {
      query = query.eq('is_active', true)
    }
    
    const { data: links, error: linksError } = await query
    
    if (linksError) {
      console.error('[links] Fetch error:', linksError)
      return NextResponse.json(
        { error: 'Erreur de récupération des liens' },
        { status: 500 }
      )
    }
    
    // ========================================
    // FETCH STATS POUR CHAQUE LIEN
    // ========================================
    const linksWithStats = await Promise.all(
      (links || []).map(async (link) => {
        // Utiliser la fonction SQL get_review_link_stats
        const { data: stats, error: statsError } = await supabase
          .rpc('get_review_link_stats', { p_link_id: link.id })
          .single()
        
        if (statsError) {
          console.error(`[links] Stats error for ${link.id}:`, statsError)
          // Retourner stats vides en cas d'erreur
          return {
            ...link,
            stats: {
              total_reviews: 0,
              avg_rating: 0,
              positive_rate: 0,
              latest_review_at: null,
            },
            public_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/avis/${link.slug}`,
          }
        }
        
        return {
          ...link,
          stats,
          public_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/avis/${link.slug}`,
        }
      })
    )
    
    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      data: linksWithStats,
      count: linksWithStats.length,
    })
    
  } catch (error) {
    console.error('[links] Error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
