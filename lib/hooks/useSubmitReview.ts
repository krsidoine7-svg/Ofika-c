'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// ========================================
// TYPES
// ========================================

export interface SubmitReviewInput {
  link_id: string
  rating: number
  client_name?: string
  client_email?: string
  comment?: string
  has_purchase?: boolean
  media_url?: string
  media_type?: 'image' | 'video'
  fingerprint?: string
}

export interface SubmitReviewResponse {
  success: boolean
  message: string
  data: {
    id: string
    rating: number
    created_at: string
  }
}

// ========================================
// HOOKS
// ========================================

/**
 * Hook pour soumettre un avis (formulaire public)
 * Pas d'authentification requise
 * 
 * @example
 * const { mutate: submitReview, isPending } = useSubmitReview()
 * 
 * submitReview({
 *   link_id: 'uuid',
 *   rating: 5,
 *   client_email: 'client@example.com',
 *   comment: 'Excellent !'
 * })
 */
export function useSubmitReview() {
  return useMutation({
    mutationFn: async (input: SubmitReviewInput) => {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        // Gestion des erreurs spécifiques
        if (res.status === 429) {
          throw new Error('Vous avez atteint la limite de soumissions. Veuillez réessayer dans 15 minutes.')
        }
        if (res.status === 409) {
          throw new Error(data.message || 'Vous avez déjà soumis un avis.')
        }
        throw new Error(data.error || 'Erreur de soumission')
      }
      
      return data as SubmitReviewResponse
    },
    onSuccess: (data) => {
      toast.success('Merci pour votre avis ! 🙏', {
        description: data.message || 'Votre retour a été enregistré avec succès',
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de soumission', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour générer un fingerprint navigateur unique
 * Utilisé pour la détection de doublons
 */
export function useGenerateFingerprint() {
  const generateFingerprint = (): string => {
    const data = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join('|')
    
    // Simple hash (pour production, utiliser crypto-js ou similaire)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return hash.toString(36)
  }
  
  return { generateFingerprint }
}
