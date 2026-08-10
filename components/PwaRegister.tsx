'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Enregistrement du service worker après le chargement de la page
      // pour ne pas ralentir le chargement initial.
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker enregistré avec succès :', registration.scope)
          })
          .catch((err) => {
            console.error('[PWA] Échec de l\'enregistrement du Service Worker :', err)
          })
      })
    }
  }, [])

  return null
}
