import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      if ('serviceWorker' in navigator) {
        // Attendre que le SW soit prêt
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const subscribeToPush = async (profileId?: string) => {
    setLoading(true)
    try {
      // 1. Vérifier le support navigateur
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Les notifications ne sont pas supportées par ce navigateur')
        return false
      }

      // 2. Demander la permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        toast.error('Permission refusée pour les notifications')
        return false
      }

      // 3. Enregistrer et attendre le Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 4. Récupérer et nettoyer la clé VAPID
      const rawVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!rawVapidKey) {
        console.error('ERREUR CRITIQUE: VAPID Key manquante')
        toast.error('Configuration serveur manquante')
        return false
      }
      const vapidPublicKey = rawVapidKey.trim()

      // 5. Conversion de la clé
      let applicationServerKey: Uint8Array
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
      } catch (e) {
        console.error('Erreur conversion clé VAPID:', e)
        return false
      }

      // 6. Souscription PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      })

      // 7. Sauvegarde dans Supabase (Même sans compte connecté/guest)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user?.id || null, // Guest support
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
        user_agent: navigator.userAgent,
        target_profile_id: profileId || null
      }, { onConflict: 'endpoint' })

      if (error) {
        console.error('Erreur Supabase save push:', error)
      }

      setSubscribed(true)
      toast.success('✅ Rappels activés !', {
        description: 'Nous vous rappellerons de suivre ce contact.'
      })
      return true

    } catch (error) {
      console.error('Error subscribing to push:', error)
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      if (msg.includes('applicationServerKey')) {
        toast.error('Erreur de configuration interne (Clé invalide)')
      } else {
        toast.error(`Erreur: ${msg}`)
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    permission,
    subscribed,
    loading,
    subscribeToPush
  }
}

// --- FONCTIONS UTILITAIRES DE CONVERSION ---

/**
 * Convertit une chaîne Base64 URL-Safe en Uint8Array requis par PushManager
 * @param base64String La clé publique VAPID
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convertit un ArrayBuffer en chaîne Base64 (pour envoi vers le backend/DB)
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
