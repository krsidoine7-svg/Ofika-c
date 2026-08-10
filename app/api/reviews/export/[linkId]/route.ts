import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


/**
 * Convertir les avis en format CSV
 */
function convertToCSV(reviews: any[]): string {
  if (reviews.length === 0) {
    return 'Date,Note,Nom,Email,Commentaire,A acheté,Statut,Vérifié\n'
  }
  
  const headers = [
    'Date',
    'Note',
    'Nom',
    'Email',
    'Commentaire',
    'A acheté',
    'Statut',
    'Vérifié',
  ]
  
  const rows = reviews.map(review => [
    new Date(review.created_at).toLocaleDateString('fr-FR'),
    review.rating.toString(),
    review.client_name || '',
    review.client_email || '',
    review.comment ? `"${review.comment.replace(/"/g, '""')}"` : '', // Escape quotes
    review.has_purchase ? 'Oui' : 'Non',
    review.moderation_status === 'approved' ? 'Approuvé' :
      review.moderation_status === 'rejected' ? 'Rejeté' : 'En attente',
    review.is_verified ? 'Oui' : 'Non',
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return csv
}

/**
 * Calculer les statistiques pour le rapport
 */
function calculateStats(reviews: any[]) {
  const total = reviews.length
  
  if (total === 0) {
    return {
      total: 0,
      avgRating: 0,
      ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      positiveRate: 0,
      withComment: 0,
      withPurchase: 0,
      verified: 0,
    }
  }
  
  const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0)
  const ratingDistribution = {
    '5': reviews.filter(r => r.rating === 5).length,
    '4': reviews.filter(r => r.rating === 4).length,
    '3': reviews.filter(r => r.rating === 3).length,
    '2': reviews.filter(r => r.rating === 2).length,
    '1': reviews.filter(r => r.rating === 1).length,
  }
  
  return {
    total,
    avgRating: (ratingSum / total).toFixed(2),
    ratingDistribution,
    positiveRate: ((ratingDistribution['4'] + ratingDistribution['5']) / total * 100).toFixed(1),
    withComment: reviews.filter(r => r.comment).length,
    withPurchase: reviews.filter(r => r.has_purchase).length,
    verified: reviews.filter(r => r.is_verified).length,
  }
}

// ========================================
// API HANDLER
// ========================================

/**
 * GET /api/reviews/export/[linkId]
 * Exporter les avis en CSV
 * 
 * Auth: Required (propriétaire du lien)
 * Query params:
 *   - format: 'csv' | 'json' (défaut: csv)
 *   - rating: number (1-5) - Filtrer par note
 *   - status: string - Filtrer par moderation_status
 * Returns: CSV file ou JSON
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
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
    // VÉRIFIER PROPRIÉTÉ DU LIEN
    // ========================================
    const { data: link, error: linkError } = await supabase
      .from('review_links')
      .select('id, title, user_id')
      .eq('id', linkId)
      .is('deleted_at', null)
      .single()
    
    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Lien non trouvé' },
        { status: 404 }
      )
    }
    
    if (link.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }
    
    // ========================================
    // QUERY PARAMS
    // ========================================
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const rating = searchParams.get('rating')
    const status = searchParams.get('status')
    
    // ========================================
    // FETCH REVIEWS
    // ========================================
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('link_id', linkId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (rating && !isNaN(parseInt(rating))) {
      query = query.eq('rating', parseInt(rating))
    }
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('moderation_status', status)
    }
    
    const { data: reviews, error } = await query
    
    if (error) {
      console.error('[export] Fetch error:', error)
      return NextResponse.json(
        { error: 'Erreur de récupération des avis' },
        { status: 500 }
      )
    }
    
    // ========================================
    // EXPORT FORMAT
    // ========================================
    
    if (format === 'json') {
      // Export JSON avec statistiques
      const stats = calculateStats(reviews || [])
      
      return NextResponse.json({
        success: true,
        link: {
          id: link.id,
          title: link.title,
        },
        stats,
        reviews: reviews || [],
        exported_at: new Date().toISOString(),
      })
    }
    
    // Export CSV (défaut)
    const csv = convertToCSV(reviews || [])
    const filename = `avis-${link.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
    
  } catch (error) {
    console.error('[export] Error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
