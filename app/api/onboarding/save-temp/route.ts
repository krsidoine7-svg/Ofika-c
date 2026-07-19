// =====================================================
// API ENDPOINT - SAUVEGARDER DONNÉES ONBOARDING TEMPORAIRES
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { onboardingSaveTempSchema } from '@/lib/validations'
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit'

export const dynamic = 'force-dynamic'


async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation avec Zod
    const validationResult = onboardingSaveTempSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { session_id, flow_type, step, data } = validationResult.data

    const supabase = await createClient()

    // Mapper flow_type ('nfc_card' ou 'public_page') vers type ('nfc' ou 'public_page')
    const mappedType = flow_type === 'nfc_card' ? 'nfc' : 'public_page'

    // Vérifier si une entrée existe déjà
    const { data: existing } = await supabase
      .from('pending_creations')
      .select('id')
      .eq('session_id', session_id)
      .single()

    let result

    if (existing) {
      // Mise à jour
      const { data: updated, error } = await supabase
        .from('pending_creations')
        .update({
          type: mappedType,
          step_completed: step,
          payload: data
        })
        .eq('session_id', session_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating pending creation:', error)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        )
      }

      result = updated
    } else {
      // Insertion
      const { data: inserted, error } = await supabase
        .from('pending_creations')
        .insert({
          session_id,
          type: mappedType,
          step_completed: step,
          payload: data
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting pending creation:', error)
        return NextResponse.json(
          { error: 'Erreur lors de la sauvegarde' },
          { status: 500 }
        )
      }

      result = inserted
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Données sauvegardées avec succès'
    })

  } catch (error) {
    console.error('Error in save-temp endpoint:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pending_creations')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session non trouvée' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching pending creation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in save-temp GET endpoint:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Export avec rate limiting
export const POST = withRateLimit(
  {
    ...RateLimitPresets.create,
    maxRequests: 20, // Plus permissif pour l'onboarding
  },
  handlePOST
)
