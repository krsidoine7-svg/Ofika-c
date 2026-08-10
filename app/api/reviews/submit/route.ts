import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// ========================================
// VALIDATION SCHEMA
// ========================================

const submitReviewSchema = z.object({
  link_id: z.string().uuid('ID de lien invalide'),
  rating: z.number()
    .int('La note doit être un nombre entier')
    .min(1, 'La note minimale est 1')
    .max(5, 'La note maximale est 5'),
  client_name: z.string().trim().max(100).optional(),
  client_email: z.string().email('Email invalide').optional(),
  comment: z.string().trim().max(5000).optional(),
  has_purchase: z.boolean().optional(),
  media_url: z.string().url('URL de média invalide').optional(),
  media_type: z.enum(['image', 'video']).optional(),
  fingerprint: z.string().optional(), // Hash navigateur pour anti-fraude
})

// ========================================
// RATE LIMITING (Simple - en mémoire)
// ========================================

// Pour production, utiliser Redis ou Upstash
const ipLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = ipLimits.get(ip)
  
  // Nettoyer les entrées expirées (simple cleanup)
  if (ipLimits.size > 10000) {
    for (const [key, value] of ipLimits.entries()) {
      if (now > value.resetAt) {
        ipLimits.delete(key)
      }
    }
  }
  
  // Pas de limite enregistrée ou expirée
  if (!limit || now > limit.resetAt) {
    ipLimits.set(ip, { 
      count: 1, 
      resetAt: now + 15 * 60 * 1000 // 15 minutes
    })
    return true
  }
  
  // Vérifier le quota
  if (limit.count >= 5) {
    return false // Max 5 avis par 15min par IP
  }
  
  // Incrémenter
  limit.count++
  return true
}

/**
 * Extraire l'IP du client
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// ========================================
// API HANDLER
// ========================================

/**
 * POST /api/reviews/submit
 * Soumettre un avis client (PUBLIC - pas d'auth requise)
 * 
 * Auth: None (public)
 * Body: { link_id, rating, client_name?, client_email?, comment?, ... }
 * Returns: { success: true, data: review }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // ========================================
    // RATE LIMITING
    // ========================================
    const clientIp = getClientIp(request)
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { 
          error: 'Trop de soumissions',
          message: 'Vous avez atteint la limite. Veuillez réessayer dans 15 minutes.'
        },
        { status: 429 }
      )
    }
    
    // ========================================
    // VALIDATION
    // ========================================
    const body = await request.json()
    const validated = submitReviewSchema.parse(body)
    
    // ========================================
    // VÉRIFIER QUE LE LIEN EXISTE ET EST ACTIF
    // ========================================
    const { data: link, error: linkError } = await supabase
      .from('review_links')
      .select('id, is_active, title, user_id, fields_config')
      .eq('id', validated.link_id)
      .single()
    
    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Lien de collecte introuvable' },
        { status: 404 }
      )
    }
    
    if (!link.is_active) {
      return NextResponse.json(
        { error: 'Ce lien de collecte n\'est plus actif' },
        { status: 403 }
      )
    }
    
    // ========================================
    // VALIDATION DES CHAMPS REQUIS (selon config)
    // ========================================
    const config = link.fields_config as any || {}
    
    if (config.name_required && !validated.client_name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      )
    }
    
    if (config.email_required && !validated.client_email) {
      return NextResponse.json(
        { error: 'L\'email est requis' },
        { status: 400 }
      )
    }
    
    if (config.comment_required && !validated.comment) {
      return NextResponse.json(
        { error: 'Le commentaire est requis' },
        { status: 400 }
      )
    }
    
    // ========================================
    // ANTI-FRAUDE: Vérifier les doublons
    // ========================================
    
    // Vérifier duplicate par IP (même lien dans les dernières 24h)
    if (clientIp !== 'unknown') {
      const { data: existingByIp } = await supabase
        .from('reviews')
        .select('id')
        .eq('link_id', validated.link_id)
        .eq('ip_address', clientIp)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
      
      if (existingByIp && existingByIp.length > 0) {
        return NextResponse.json(
          { 
            error: 'Avis déjà soumis',
            message: 'Vous avez déjà laissé un avis récemment pour ce lien.'
          },
          { status: 409 }
        )
      }
    }
    
    // Vérifier duplicate par email
    if (validated.client_email) {
      const { data: existingByEmail } = await supabase
        .from('reviews')
        .select('id')
        .eq('link_id', validated.link_id)
        .eq('client_email', validated.client_email.toLowerCase())
        .limit(1)
      
      if (existingByEmail && existingByEmail.length > 0) {
        return NextResponse.json(
          { 
            error: 'Avis déjà soumis',
            message: 'Cet email a déjà été utilisé pour laisser un avis.'
          },
          { status: 409 }
        )
      }
    }
    
    // ========================================
    // INSERTION DE L'AVIS
    // ========================================
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        link_id: validated.link_id,
        rating: validated.rating,
        client_name: validated.client_name || null,
        client_email: validated.client_email?.toLowerCase() || null,
        comment: validated.comment || null,
        has_purchase: validated.has_purchase || false,
        media_url: validated.media_url || null,
        media_type: validated.media_type || null,
        ip_address: clientIp,
        user_agent: request.headers.get('user-agent') || null,
        fingerprint: validated.fingerprint || null,
        moderation_status: 'pending', // Par défaut en attente de modération
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('[submit] Insert error:', insertError)
      return NextResponse.json(
        { 
          error: 'Erreur lors de la soumission',
          details: insertError.message
        },
        { status: 500 }
      )
    }
    
    // ========================================
    // TODO: ENVOYER EMAIL NOTIFICATION AU PROPRIÉTAIRE
    // ========================================
    // await sendReviewNotificationEmail({
    //   ownerId: link.user_id,
    //   linkTitle: link.title,
    //   review,
    // })
    
    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis !',
      data: {
        id: review.id,
        rating: review.rating,
        created_at: review.created_at,
      },
    }, { status: 201 })
    
  } catch (error) {
    console.error('[submit] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
