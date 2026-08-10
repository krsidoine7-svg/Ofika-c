import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthGuard } from '@/lib/security/auth-guard'
import { InputSanitizer } from '@/lib/security/input-sanitizer'

export const dynamic = 'force-dynamic'

/**
 * Route API pour soumettre un reçu de paiement Wave (capture d'écran)
 * 
 * POST /api/orders/receipt
 * 
 * Body:
 * {
 *   order_id: string (requis)
 *   receipt_url: string (requis)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route Receipt - Soumission de preuve de paiement')

    // Protection de la route (l'utilisateur doit être connecté)
    const protectionResponse = await AuthGuard.protectRoute(request, {
      requireAuth: true,
      allowedMethods: ['POST'],
      validateData: true
    })
    if (protectionResponse) return protectionResponse

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer et sanitiser le body
    const rawData = await request.json()
    const body = InputSanitizer.sanitizeObject(rawData)

    const { order_id, receipt_url } = body

    if (!order_id || !receipt_url) {
      return NextResponse.json({ success: false, error: 'order_id et receipt_url sont requis' }, { status: 400 })
    }

    // Vérifier la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, metadata')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 })
    }

    // Mettre à jour la commande
    // On met à jour la colonne metadata avec le reçu et on met le statut à 'processing'
    const updatedMetadata = {
      ...(order.metadata || {}),
      receipt_url: receipt_url,
      receipt_uploaded_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        metadata: updatedMetadata,
        payment_status: 'processing', // Statut transitoire en attente de validation admin
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour de la commande avec le reçu:', updateError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la sauvegarde du reçu' }, { status: 500 })
    }

    console.log(`✅ Reçu enregistré pour la commande ${order_id}`)

    return NextResponse.json({
      success: true,
      message: 'Reçu enregistré avec succès. En attente de validation par l\'administrateur.'
    })

  } catch (error) {
    console.error('❌ Erreur inattendue dans /api/orders/receipt:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
