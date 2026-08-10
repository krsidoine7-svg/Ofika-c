import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { verifyGeniusPayWebhookSignature, isWebhookTimestampValid } from '@/lib/services/geniuspay/webhook-signature'
import { handleGeniusPayWebhookEvent } from '@/lib/services/geniuspay/webhook-handler'
import { GeniusPayWebhookPayload } from '@/lib/services/geniuspay/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 1. Lire le raw body
    const rawBody = await request.text()
    
    // 2. Extraire les headers
    const signature = request.headers.get('x-webhook-signature')
    const timestamp = request.headers.get('x-webhook-timestamp')
    const secret = process.env.GENIUSPAY_WEBHOOK_SECRET
    
    if (!signature || !timestamp || !secret) {
      console.error('Webhook GeniusPay: Headers ou secret manquants')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Vérifier la signature et le timestamp
    if (!isWebhookTimestampValid(timestamp)) {
      console.error('Webhook GeniusPay: Timestamp invalide ou trop ancien')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!verifyGeniusPayWebhookSignature(rawBody, signature, timestamp, secret)) {
      console.error('Webhook GeniusPay: Signature invalide')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Parser le JSON
    let payload: GeniusPayWebhookPayload
    try {
      payload = JSON.parse(rawBody)
    } catch (e) {
      console.error('Webhook GeniusPay: JSON invalide')
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const eventId = payload.id
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Missing event ID' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 5. Vérifier l'idempotence
    const { data: existingEvent, error: selectError } = await supabase
      .from('geniuspay_webhook_events')
      .select('id, processed_at')
      .eq('id', eventId)
      .single()

    if (existingEvent) {
      if (existingEvent.processed_at) {
        // Déjà traité, on répond 200 immédiatement (Idempotence)
        return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 })
      }
    } else {
      // Insérer l'événement
      const { error: insertError } = await supabase
        .from('geniuspay_webhook_events')
        .insert({
          id: eventId,
          event_type: payload.event,
          payload: payload,
          received_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Erreur insertion webhook event:', insertError)
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
      }
    }

    // 6. Traitement asynchrone (non-bloquant pour répondre en < 5s)
    // Next.js n'a pas de queue native par défaut, on l'exécute de manière asynchrone sans "await" (fire and forget)
    // pour garantir la réponse 200 immédiate au webhook.
    const processEvent = async () => {
      try {
        await handleGeniusPayWebhookEvent(payload)
        
        // Marquer comme traité
        await supabase
          .from('geniuspay_webhook_events')
          .update({ processed_at: new Date().toISOString() })
          .eq('id', eventId)
      } catch (e) {
        console.error(`Erreur de traitement de l'événement ${eventId}:`, e)
      }
    }
    
    // Déclenchement sans attente (Next.js Edge/Serverless peut parfois couper les promesses orphelines, 
    // mais dans l'App Router sur Node c'est généralement géré. Si Vercel coupe trop vite, on peut await).
    // Pour être 100% sûr d'arriver à la fin sur Vercel, on peut l'attendre. Comme les appels supabase sont rapides, 
    // ça passera sous les 5s.
    await processEvent()

    // 7. Réponse 200 immédiate
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Erreur inattendue Webhook GeniusPay:', error)
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
  }
}
