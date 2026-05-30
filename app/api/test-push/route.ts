import { NextResponse } from 'next/server'
import webPush from 'web-push'

export const dynamic = 'force-dynamic'


// Configuration VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@example.com'

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

export async function POST(request: Request) {
  try {
    const { subscription, title, body } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription object required' }, { status: 400 })
    }

    const payload = JSON.stringify({
      title: title || 'Test Notification',
      body: body || 'Ceci est un test de notification Web Push !',
      icon: '/icon-192x192.png'
    })

    await webPush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true, message: 'Notification envoyée !' })
  } catch (error: any) {
    console.error('Erreur envoi push:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
