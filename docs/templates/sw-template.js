// ==========================================
// SERVICE WORKER TEMPLATE - OFIKA
// ==========================================
// À COPIER MANUELLEMENT dans public/sw.js
// (Bloqué par .gitignore - normal pour éviter versionning)
// ==========================================

self.addEventListener('install', (event) => {
    console.log('[Ofika SW] Installing Service Worker v1.0...')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('[Ofika SW] Activating Service Worker...')
    event.waitUntil(self.clients.claim())
})

// ==================================
// GESTION DES NOTIFICATIONS PUSH
// ==================================

self.addEventListener('push', (event) => {
    console.log('[Ofika SW] Push notification received')

    let notificationData = {
        title: 'Ofika',
        body: 'Nouvelle notification',
        icon: '/assets/logos/logo-icon.svg',
        badge: '/assets/logos/logo-icon.svg'
    }

    try {
        if (event.data) {
            notificationData = JSON.parse(event.data.text())
        }
    } catch (e) {
        console.error('[Ofika SW] Error parsing push data:', e)
    }

    const options = {
        body: notificationData.body || 'Vous avez une nouvelle notification',
        icon: notificationData.icon || '/assets/logos/logo-icon.svg',
        badge: notificationData.badge || '/assets/logos/logo-icon.svg',
        data: {
            url: notificationData.data?.url || '/dashboard',
            ...notificationData.data
        },
        actions: [
            { action: 'open', title: '👀 Voir', icon: '/assets/logos/logo-icon.svg' },
            { action: 'close', title: '❌ Plus tard' }
        ],
        tag: notificationData.tag || 'ofika-notification',
        requireInteraction: false, // Auto-hide après quelques secondes
        vibrate: [200, 100, 200], // Pattern de vibration mobile
        timestamp: Date.now()
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title || 'Ofika', options)
    )
})

// ==================================
// GESTION DES CLICS SUR NOTIFICATIONS
// ==================================

self.addEventListener('notificationclick', (event) => {
    console.log('[Ofika SW] Notification clicked:', event.action)

    event.notification.close()

    // Si l'action est "close", ne rien faire
    if (event.action === 'close') {
        return
    }

    // URL à ouvrir (défaut : dashboard)
    const urlToOpen = event.notification.data?.url || '/dashboard'

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Chercher une fenêtre déjà ouverte
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus()
                }
            }

            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

// ==================================
// GESTION DES ERREURS DE PUSH
// ==================================

self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('[Ofika SW] Push subscription changed')

    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: self.registration.pushManager.applicationServerKey
        }).then((subscription) => {
            console.log('[Ofika SW] Re-subscribed:', subscription.endpoint)

            // Mettre à jour la subscription côté serveur
            return fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                        auth: arrayBufferToBase64(subscription.getKey('auth'))
                    }
                })
            })
        })
    )
})

// ==================================
// HELPERS
// ==================================

function arrayBufferToBase64(buffer) {
    if (!buffer) return ''
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

// ==================================
// LOGGING (pour debug)
// ==================================

self.addEventListener('error', (event) => {
    console.error('[Ofika SW] Error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
    console.error('[Ofika SW] Unhandled rejection:', event.reason)
})

console.log('[Ofika SW] Service Worker loaded successfully ✅')
