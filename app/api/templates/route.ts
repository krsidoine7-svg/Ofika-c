// =====================================================
// API ROUTE: GET /api/templates
// Description: Récupère tous les templates actifs
// =====================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateSchema } from '@/lib/types/template'

export const dynamic = 'force-dynamic'

/**
 * GET /api/templates
 * Récupère tous les templates actifs avec leurs schémas
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: templates, error } = await supabase
      .from('template_schemas')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des templates' },
        { status: 500 }
      )
    }
    
    // Typer les données
    const typedTemplates = templates as TemplateSchema[]
    
    return NextResponse.json({
      templates: typedTemplates,
      count: typedTemplates.length
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/templates:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * HEAD /api/templates
 * Vérifie la disponibilité de l'API
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
