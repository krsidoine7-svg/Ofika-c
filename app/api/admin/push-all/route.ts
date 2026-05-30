import { NextRequest, NextResponse } from 'next/server'
import webPush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Configuration VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@ofika.ci'

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webPush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    )
  } catch (err) {
    console.error('Erreur config Web Push:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, icon, url } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // 1. Récupérer toutes les souscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) {
      console.error('Erreur récupération souscriptions:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sentCount: 0, 
        message: 'Aucun abonné trouvé.' 
      })
    }

    // 2. Préparer le payload
    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: icon || '/assets/logos/logo-orange.svg',
      badge: '/assets/logos/logo-orange.svg',
      data: {
        url: url || '/dashboard'
      }
    })

    // 3. Envoyer à tout le monde (en parallèle avec limite ou simple loop)
    let successCount = 0
    let failureCount = 0

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }
        await webPush.sendNotification(pushSubscription, payload)
        successCount++
      } catch (err: any) {
        console.error(`Erreur envoi à ${sub.endpoint}:`, err.statusCode)
        failureCount++
        
        // Si la souscription est expirée ou invalide (404 ou 410), on la supprime
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id)
        }
      }
    })

    await Promise.all(sendPromises)

    return NextResponse.json({ 
      success: true, 
      sentCount: successCount,
      failedCount: failureCount,
      message: `${successCount} notifications envoyées, ${failureCount} échecs.` 
    })

  } catch (error: any) {
    console.error('Erreur globale push-all:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
