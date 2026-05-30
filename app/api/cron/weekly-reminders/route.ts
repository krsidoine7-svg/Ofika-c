import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webPush from 'web-push'

export const dynamic = 'force-dynamic'

// Configuration Web Push
// Configuration Web Push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:krsidoine7@gmail.com'

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webPush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    )
  } catch (e) {
    console.error('Erreur config VAPID:', e)
  }
}

export async function GET(request: Request) {
  try {
    // Vérifier l'autorisation (secret Vercel Cron)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'
    
    // En développement, permettre l'accès sans header si localhost
    const isLocalhost = request.headers.get('host')?.includes('localhost')
    
    if (!isLocalhost && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Créer client Supabase avec service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[Cron] Starting weekly reminders check...')

    // Récupérer tous les utilisateurs avec au moins un contact (optimisation possible)
    const { data: users, error: usersError } = await supabase
      .from('contacts')
      .select('user_id')
      .not('user_id', 'is', null)
      
    console.log('--- DEBUG CRON ---')
    console.log('Users found (raw):', users?.length)
    if (usersError) console.error('Users Error:', usersError)

    if (usersError) throw usersError

    const uniqueUserIds = [...new Set(users?.map(u => u.user_id) || [])]
    console.log('Unique IDs:', uniqueUserIds)
    console.log('------------------')
    console.log(`[Cron] Checking ${uniqueUserIds.length} users for forgotten contacts`)

    let totalNotificationsSent = 0
    const results = []

    // Interface pour typering RPC result
    interface ForgottenContact {
      contact_id: string
      contact_name: string
      last_activity_date: string
      days_since_activity: number
    }

    // Pour chaque utilisateur, vérifier les contacts oubliés
    for (const userId of uniqueUserIds) {
      try {
        // Appeler la fonction SQL pour obtenir les contacts oubliés
        const { data: rawData, error: contactsError } = await supabase
          .rpc('get_forgotten_contacts', { days_threshold: 0 })
          .eq('user_id', userId)

        const forgottenContacts = (rawData || []) as unknown as ForgottenContact[]

        if (contactsError) {
          console.error(`[Cron] Error for user ${userId}:`, contactsError)
          continue
        }

        if (forgottenContacts.length === 0) {
          continue
        }

        console.log(`[Cron] Found ${forgottenContacts.length} forgotten contacts for user ${userId}`)

        // Récupérer les souscriptions push de cet utilisateur
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId)

        if (!subscriptions || subscriptions.length === 0) {
          console.log(`[Cron] User ${userId} has no push subscriptions`)
          continue
        }

        // Préparer le message de notification
        const contactNames = forgottenContacts.slice(0, 3).map(c => c.contact_name).join(', ')
        const moreCount = forgottenContacts.length > 3 ? ` et ${forgottenContacts.length - 3} autre(s)` : ''

        const notificationPayload = JSON.stringify({
          title: '📇 Rappel de contacts',
          body: `N'oubliez pas de recontacter : ${contactNames}${moreCount}`,
          icon: '/assets/logos/logo-icon.svg',
          badge: '/assets/logos/logo-icon.svg',
          data: {
            url: '/dashboard/contacts',
            type: 'weekly_reminder',
            contactCount: forgottenContacts.length
          },
          tag: `weekly-reminder-${Date.now()}`
        })

        // Envoyer à chaque device de l'utilisateur
        let userSentCount = 0
        
        for (const sub of subscriptions) {
          try {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }

            await webPush.sendNotification(pushSubscription, notificationPayload)
            userSentCount++
            totalNotificationsSent++
          } catch (pushError: any) {
            console.error(`Error sending push to ${sub.endpoint}:`, pushError)
            
            // Si le souscription est invalide (410 Gone), on la supprime
            if (pushError.statusCode === 410) {
              console.log('Deleting expired subscription...')
              await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            }
          }
        }

        if (userSentCount > 0) {
           results.push({ userId, status: 'sent', count: userSentCount })
           console.log(`[Cron] ✅ Sent ${userSentCount} notifications to user ${userId}`)
        }

      } catch (userError) {
        console.error(`[Cron] Error processing user ${userId}:`, userError)
        results.push({ userId, status: 'error', error: String(userError) })
      }
    }

    // --- RAPPELS POUR INVITÉS (GUESTS) ---
    const { data: guestSubs } = await supabase
      .from('push_subscriptions')
      .select('*, profiles(full_name, profile_name)')
      .is('user_id', null)
      .not('target_profile_id', 'is', null)

    if (guestSubs && guestSubs.length > 0) {
      for (const sub of (guestSubs as any[])) {
        try {
          const profileName = sub.profiles?.full_name || sub.profiles?.profile_name || 'votre contact'
          const guestPayload = JSON.stringify({
            title: '🤝 Rappel Ofika',
            body: `N'oubliez pas de recontacter ${profileName}.`,
            icon: '/assets/logos/logo-icon.svg',
            badge: '/assets/logos/logo-icon.svg',
            data: { url: `/${sub.target_profile_id}`, type: 'guest_followup' }
          })

          await webPush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          }, guestPayload)
          totalNotificationsSent++
        } catch (pushError: any) {
          if (pushError.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          }
        }
      }
    }

    console.log(`[Cron] ✅ Weekly reminders completed. Sent ${totalNotificationsSent} notifications`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersChecked: uniqueUserIds.length,
      notificationsSent: totalNotificationsSent,
      results
    })

  } catch (error: any) {
    console.error('[Cron] Fatal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
