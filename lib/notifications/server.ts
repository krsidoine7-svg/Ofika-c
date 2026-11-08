// =====================================================
// Notifications côté serveur : cloche du dashboard (table notifications) + push (Web Push)
// À utiliser UNIQUEMENT dans les routes API / tâches serveur.
// =====================================================

import webPush from 'web-push'
import { createAdminClient } from '@/lib/supabase/service-role'

export interface PushPayload {
  title: string
  body: string
  /** Page ouverte au clic sur la notification */
  url: string
  /** Notifications de même tag : la plus récente remplace la précédente */
  tag?: string
}

export interface StoredSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

let vapidReady: boolean | null = null
function ensureVapid(): boolean {
  if (vapidReady !== null) return vapidReady
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    console.warn('[push] Clés VAPID absentes : notifications push désactivées')
    return (vapidReady = false)
  }
  try {
    webPush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:support@ofika.ci', publicKey, privateKey)
    return (vapidReady = true)
  } catch (error) {
    console.error('[push] Configuration VAPID invalide', error)
    return (vapidReady = false)
  }
}

/** Envoie un push à une liste d'abonnements. Supprime ceux qui ont expiré. Retourne le nombre d'envois réussis. */
export async function sendPushToSubscriptions(subs: StoredSubscription[], payload: PushPayload): Promise<number> {
  if (!subs.length || !ensureVapid()) return 0
  const admin = createAdminClient()
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.tag,
    data: { url: payload.url },
  })
  let sent = 0
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body, { TTL: 60 * 60 * 24 })
        sent++
      } catch (error: any) {
        // 404 / 410 : abonnement expiré ou révoqué (ou créé avec d'anciennes clés VAPID) → on le supprime
        if (error?.statusCode === 404 || error?.statusCode === 410 || error?.statusCode === 403) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('[push] Échec d’envoi', error?.statusCode || error)
        }
      }
    }),
  )
  return sent
}

/** Push vers tous les appareils d'un utilisateur connecté (propriétaire de profil, admin…). */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const admin = createAdminClient()
  const { data } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', userId)
  return sendPushToSubscriptions((data || []) as StoredSubscription[], payload)
}

/**
 * Notifie un utilisateur : ligne dans la cloche du dashboard + push sur ses appareils.
 * Ne lève jamais d'erreur (une notification ratée ne doit pas casser l'action principale).
 */
export async function notifyUser(
  userId: string,
  n: { type: string; title: string; message: string; url: string; orderId?: string; push?: boolean },
): Promise<void> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('notifications').insert({
      user_id: userId,
      type: n.type,
      title: n.title,
      message: n.message,
      action_url: n.url,
      order_id: n.orderId ?? null,
      read: false,
    })
    if (error) console.error('[notifications] Insertion impossible', error.message)
    if (n.push !== false) await sendPushToUser(userId, { title: n.title, body: n.message, url: n.url, tag: n.type })
  } catch (error) {
    console.error('[notifications] Échec de notification', error)
  }
}

/** Propriétaire d'un profil public (pour le notifier). */
export async function getProfileOwner(profileId: string): Promise<{ userId: string; name: string; slug: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('user_id, name, username, custom_url').eq('id', profileId).maybeSingle()
  if (!data?.user_id) return null
  return { userId: data.user_id, name: data.name || 'votre contact', slug: data.custom_url || data.username || profileId }
}
