// =====================================================
// API ROUTE: GET /api/templates/[slug]
// Description: Récupère un template spécifique par son slug
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateSchema } from '@/lib/types/template'

export const dynamic = 'force-dynamic'

/**
 * GET /api/templates/[slug]
 * Récupère un template par son slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Le slug du template est requis' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { data: template, error } = await supabase
      .from('template_schemas')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Template non trouvé' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching template:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du template' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      template: template as TemplateSchema
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/templates/[slug]:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
