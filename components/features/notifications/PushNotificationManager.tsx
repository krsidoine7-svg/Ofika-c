'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function PushNotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [subscribed, setSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission)
            checkSubscription()
        }
    }, [])

    const checkSubscription = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.getSubscription()
                setSubscribed(!!subscription)
            }
        } catch (error) {
            console.error('Error checking subscription:', error)
        }
    }

    const subscribeToPush = async () => {
        setLoading(true)
        try {
            // Vérifier le support
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                toast.error('Les notifications push ne sont pas supportées par votre navigateur')
                return
            }

            // Demander la permission
            const perm = await Notification.requestPermission()
            setPermission(perm)

            if (perm !== 'granted') {
                toast.error('Permission refusée pour les notifications')
                return
            }

            // Enregistrer le service worker
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            // VAPID public key
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

            // Souscrire aux push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            })

            // Enregistrer dans Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { error } = await supabase.from('push_subscriptions').upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth')),
                user_agent: navigator.userAgent
            }, { onConflict: 'endpoint' })

            if (error) throw error

            setSubscribed(true)
            toast.success('✅ Notifications activées ! Vous recevrez des rappels hebdomadaires.')
        } catch (error) {
            console.error('Error subscribing to push:', error)
            toast.error('Erreur lors de l\'activation des notifications')
        } finally {
            setLoading(false)
        }
    }

    const unsubscribeFromPush = async () => {
        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                await subscription.unsubscribe()

                // Supprimer de Supabase
                const { error } = await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint)

                if (error) throw error
            }

            setSubscribed(false)
            toast.success('Notifications désactivées')
        } catch (error) {
            console.error('Error unsubscribing:', error)
            toast.error('Erreur lors de la désactivation')
        } finally {
            setLoading(false)
        }
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-lg">🔕</span>
                <span>Notifications bloquées dans les paramètres du navigateur</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {subscribed ? (
                <button
                    onClick={unsubscribeFromPush}
                    disabled={loading}
                    className="
                        flex items-center gap-2 px-4 py-2 text-sm font-medium
                        border border-gray-300 rounded-lg
                        hover:bg-gray-50 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <span className="text-lg">🔕</span>
                    Désactiver les rappels
                </button>
            ) : (
                <button
                    onClick={subscribeToPush}
                    disabled={loading}
                    className="
                        flex items-center gap-2 px-4 py-2 text-sm font-medium
                        bg-blue-600 text-white rounded-lg
                        hover:bg-blue-700 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <span className="text-lg">🔔</span>
                    {loading ? 'Activation...' : 'Activer les rappels hebdo'}
                </button>
            )}
        </div>
    )
}

// Helpers
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return ''
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}
