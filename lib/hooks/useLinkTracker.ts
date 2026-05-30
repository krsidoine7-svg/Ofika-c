"use client"

import { trackLinkClick } from '@/lib/services/profile-analytics'

/**
 * Hook pour suivre les clics sur les liens d'un profil
 */
export function useLinkTracker(profileId: string) {
  const trackAndOpen = (linkId: string, url: string) => {
    try {
      // On ne veut pas bloquer l'ouverture du lien si le tracking échoue
      trackLinkClick(profileId, linkId, url).catch(err => {
        console.error('Error tracking link click:', err)
      })
      
      // Ouverture réelle du lien
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error('Unexpected error in trackAndOpen:', err)
      // Fallback au cas où
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return { trackAndOpen }
}
