import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { design_choice } = await request.json()
    
    // Valider le design_choice (adapté aux nouveaux designs)
    const allowedDesigns = ['classic', 'modern', 'minimal', 'ofika-optimized', 'design1', 'design2', 'design-classic']
    if (!design_choice || !allowedDesigns.includes(design_choice)) {
      return NextResponse.json({ 
        error: `design_choice doit être l'une des valeurs suivantes : ${allowedDesigns.join(', ')}` 
      }, { status: 400 })
    }

    // Vérifier que la carte appartient à l'utilisateur
    const { data: card, error: cardError } = await supabase
      .from('digital_nfc_cards')
      .select('id, user_id, preview_data')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ 
        error: 'Carte NFC non trouvée ou non autorisée' 
      }, { status: 404 })
    }

    // Mettre à jour le design
    const { data, error } = await supabase
      .from('digital_nfc_cards')
      .update({ 
        design_choice: design_choice,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('id, design_choice, preview_data')
      .single()

    if (error) {
      console.error('Error updating design:', error)
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour du design' 
      }, { status: 500 })
    }

    const p = data.preview_data as Record<string, any> || {}

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        design_choice: data.design_choice,
        profile_name: p.profile_name
      }
    })

  } catch (error) {
    console.error('Error in design update API:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
