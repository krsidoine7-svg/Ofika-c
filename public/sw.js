// ==========================================
// SERVICE WORKER TEMPLATE - OFIKA
// ==========================================
// À COPIER MANUELLEMENT dans public/sw.js
// (Bloqué par .gitignore - normal pour éviter versionning)
// ==========================================

// ==================================
// STRATÉGIES DE MISE EN CACHE (PWA)
// ==================================

const CACHE_NAME = 'ofika-cache-v1'
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/assets/logos/logo-orange.svg',
    '/assets/logos/logo-black.svg'
]

self.addEventListener('install', (event) => {
    console.log('[Ofika SW] Installing Service Worker v1.0...')
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(err => console.warn('Erreur pré-cache:', err))
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('[Ofika SW] Activating Service Worker...')
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    // Ne pas mettre en cache les requêtes API Supabase ou Next.js internes (sauf _next/static)
    if (
        url.pathname.startsWith('/api/') || 
        url.hostname.includes('supabase.co') ||
        (url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/'))
    ) {
        return
    }

    // Stratégie "Cache First" pour les images et assets statiques (Stale-While-Revalidate)
    if (
        event.request.destination === 'image' || 
        event.request.destination === 'style' || 
        event.request.destination === 'script' ||
        url.pathname.startsWith('/_next/static/')
    ) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache)
                        })
                    }
                    return networkResponse
                }).catch(() => null)
                return cachedResponse || fetchPromise
            })
        )
        return
    }

    // Stratégie "Network First" (Puis Cache) pour le HTML / Pages
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse))
                }
                return networkResponse
            }).catch(() => {
                // Mode hors-ligne : servir depuis le cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse
                    // Fallback (page d'accueil ou page d'erreur hors ligne si elle existait)
                    return caches.match('/')
                })
            })
        )
        return
    }
})

// ==================================
// GESTION DES NOTIFICATIONS PUSH
// ==================================

self.addEventListener('push', (event) => {
    console.log('[Ofika SW] Push notification received')

    let notificationData = {
        title: 'Ofika',
        body: 'Nouvelle notification',
        icon: '/assets/logos/logo-orange.svg',
        badge: '/assets/logos/logo-orange.svg'
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
        icon: notificationData.icon || '/assets/logos/logo-orange.svg',
        badge: notificationData.badge || '/assets/logos/logo-orange.svg',
        data: {
            url: notificationData.data?.url || '/dashboard',
            ...notificationData.data
        },
        actions: [
            { action: 'open', title: '👀 Voir', icon: '/assets/logos/logo-orange.svg' },
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
