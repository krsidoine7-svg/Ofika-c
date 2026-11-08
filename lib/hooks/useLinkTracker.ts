"use client"

import { trackLinkClick } from '@/lib/services/profile-analytics'

/**
 * Valide et sécurise une URL contre les attaques XSS (OWASP A03 / A05)
 */
function sanitizeDestinationUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()

  // Bloquer expressément les protocoles malveillants
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    console.warn('⚠️ Blocked unsafe link scheme:', trimmed)
    return null
  }

  // Permettre les liens téléphone et email
  if (lower.startsWith('tel:') || lower.startsWith('mailto:')) {
    return trimmed
  }

  // Préfixer https:// si l'URL ne contient pas de protocole
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    // Si c'est un chemin relatif interne
    if (trimmed.startsWith('/')) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  return trimmed
}

/**
 * Hook pour suivre les clics sur les liens d'un profil
 */
export function useLinkTracker(profileId: string) {
  const trackAndOpen = (linkId: string, url: string) => {
    try {
      const safeUrl = sanitizeDestinationUrl(url)
      if (!safeUrl) {
        console.warn('Invalid or blocked URL:', url)
        return
      }

      // On ne veut pas bloquer l'ouverture du lien si le tracking échoue
      trackLinkClick(profileId, linkId, safeUrl).catch(err => {
        console.error('Error tracking link click:', err)
      })
      
      // Ouverture réelle et sécurisée du lien
      if (typeof window !== 'undefined') {
        window.open(safeUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error('Unexpected error in trackAndOpen:', err)
    }
  }

  return { trackAndOpen }
}
