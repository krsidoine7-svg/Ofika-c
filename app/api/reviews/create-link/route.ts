import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'


// ========================================
// VALIDATION SCHEMA
// ========================================

const createLinkSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .trim(),
  fields_config: z.object({
    name_required: z.boolean().optional(),
    email_required: z.boolean().optional(),
    comment_required: z.boolean().optional(),
    media_enabled: z.boolean().optional(),
    purchase_verification: z.boolean().optional(),
  }).optional(),
})

// ========================================
// UTILITAIRES
// ========================================

/**
 * Génère un slug unique à partir du titre
 * Format: titre-normalisé-{random}
 */
function generateSlug(title: string): string {
  // Normaliser le titre
  const base = title
    .toLowerCase()
    .normalize('NFD') // Décomposer les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer caractères spéciaux par -
    .replace(/^-+|-+$/g, '') // Supprimer - en début/fin
    .substring(0, 150) // Limiter longueur
  
  // Ajouter identifiant unique
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${base}-${random}`
}

/**
 * Vérifie l'unicité du slug et régénère si nécessaire
 */
async function ensureUniqueSlug(
  supabase: any,
  baseTitle: string,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const slug = generateSlug(baseTitle)
    
    // Vérifier si le slug existe déjà
    const { data, error } = await supabase
      .from('review_links')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    if (error) throw error
    
    // Slug disponible
    if (!data) {
      return slug
    }
  }
  
  // Si après maxRetries on n'a pas trouvé de slug unique
  throw new Error('Impossible de générer un slug unique')
}

// ========================================
// API HANDLER
// ========================================

/**
 * POST /api/reviews/create-link
 * Créer un nouveau lien de collecte d'avis
 * 
 * Auth: Required
 * Body: { title, fields_config? }
 * Returns: { id, slug, public_url, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ========================================
    // AUTH CHECK
    // ========================================
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      )
    }
    
    // ========================================
    // VALIDATION
    // ========================================
    const body = await request.json()
    const validated = createLinkSchema.parse(body)
    
    // ========================================
    // GÉNÉRATION SLUG UNIQUE
    // ========================================
    const slug = await ensureUniqueSlug(supabase, validated.title)
    
    // ========================================
    // INSERTION EN BASE
    // ========================================
    const { data, error } = await supabase
      .from('review_links')
      .insert({
        user_id: user.id,
        title: validated.title,
        slug,
        fields_config: validated.fields_config || {
          name_required: false,
          email_required: false,
          comment_required: false,
          media_enabled: false,
          purchase_verification: false,
        },
      })
      .select()
      .single()
    
    if (error) {
      console.error('[create-link] Insert error:', error)
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création du lien',
          details: error.message 
        },
        { status: 500 }
      )
    }
    
    // ========================================
    // BUILD PUBLIC URL
    // ========================================
    const publicUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')}/avis/${data.slug}`
    
    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        public_url: publicUrl,
      },
    }, { status: 201 })
    
  } catch (error) {
    console.error('[create-link] Error:', error)
    
    // Erreur de validation Zod
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
    
    // Erreur générique
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
