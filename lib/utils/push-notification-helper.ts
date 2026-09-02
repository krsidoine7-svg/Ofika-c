/**
 * Utility for Web Push Notifications & Audio Chimes
 */

// Génère un bip sonore agréable via Web Audio API (compatible tous navigateurs sans fichier externe)
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    const now = ctx.currentTime

    // Première note (Mi - 659.25 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    // Deuxième note (La - 880 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.2, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.3)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.45)
  } catch (err) {
    console.warn('Audio chime fallback error:', err)
  }
}

// Demander l'autorisation pour les notifications Web Push du navigateur
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Déclencher une notification Push sur l'écran du navigateur
export function triggerWebPushNotification(title: string, options?: { body?: string; url?: string; tag?: string }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  // Jouer le son
  playNotificationChime()

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || 'Nouveau message reçu sur Ofika',
        icon: '/favicon.ico',
        tag: options?.tag || 'ofika-message',
      })

      if (options?.url) {
        notif.onclick = () => {
          window.focus()
          window.location.href = options.url!
        }
      }
    } catch (err) {
      console.warn('Error triggering Web Push notification:', err)
    }
  }
}
