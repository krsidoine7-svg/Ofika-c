'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

// ========================================
// TYPES
// ========================================

export interface ReviewLinkConfig {
  name_required?: boolean
  email_required?: boolean
  comment_required?: boolean
  media_enabled?: boolean
  purchase_verification?: boolean
}

export interface ReviewLink {
  id: string
  user_id: string
  title: string
  slug: string
  fields_config: ReviewLinkConfig
  is_active: boolean
  created_at: string
  updated_at: string
  public_url?: string
  stats?: {
    total_reviews: number
    avg_rating: number
    rating_5_count: number
    rating_4_count: number
    rating_3_count: number
    rating_2_count: number
    rating_1_count: number
    positive_rate: number
    latest_review_at: string | null
  }
}

export interface CreateReviewLinkInput {
  title: string
  fields_config?: ReviewLinkConfig
}

export interface UpdateReviewLinkInput {
  title?: string
  fields_config?: ReviewLinkConfig
  is_active?: boolean
}

// ========================================
// QUERY KEYS
// ========================================

export const reviewLinksKeys = {
  all: ['review-links'] as const,
  lists: () => [...reviewLinksKeys.all, 'list'] as const,
  list: (filters: { active_only?: boolean } = {}) => 
    [...reviewLinksKeys.lists(), filters] as const,
  details: () => [...reviewLinksKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewLinksKeys.details(), id] as const,
}

// ========================================
// HOOKS
// ========================================

/**
 * Hook pour récupérer tous les liens de l'utilisateur
 * @param options.active_only - Si true, ne retourne que les liens actifs
 */
export function useReviewLinks(options?: { active_only?: boolean }) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: reviewLinksKeys.list(options),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.active_only) {
        params.set('active_only', 'true')
      }
      
      const url = `/api/reviews/links${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de chargement des liens')
      }
      
      const data = await res.json()
      return data.data as ReviewLink[]
    },
    enabled: !!user,
  })
}

/**
 * Hook pour récupérer un lien spécifique avec ses stats
 */
export function useReviewLink(id: string | null) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: reviewLinksKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('ID requis')
      
      const res = await fetch(`/api/reviews/links/${id}`)
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de chargement du lien')
      }
      
      const data = await res.json()
      return data.data as ReviewLink
    },
    enabled: !!user && !!id,
  })
}

/**
 * Hook pour créer un nouveau lien de collecte
 */
export function useCreateReviewLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateReviewLinkInput) => {
      const res = await fetch('/api/reviews/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de création')
      }
      
      const data = await res.json()
      return data.data as ReviewLink
    },
    onSuccess: (data) => {
      // Invalider le cache des listes
      queryClient.invalidateQueries({ queryKey: reviewLinksKeys.lists() })
      
      // Ajouter optimistiquement au cache
      queryClient.setQueryData(reviewLinksKeys.detail(data.id), data)
      
      toast.success('Lien créé avec succès ! 🎉', {
        description: `${data.title} est maintenant actif`,
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de création', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour modifier un lien existant
 */
export function useUpdateReviewLink(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateReviewLinkInput) => {
      const res = await fetch(`/api/reviews/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de modification')
      }
      
      const data = await res.json()
      return data.data as ReviewLink
    },
    onSuccess: (data) => {
      // Mettre à jour le cache du lien
      queryClient.setQueryData(reviewLinksKeys.detail(id), data)
      
      // Invalider les listes pour refetch
      queryClient.invalidateQueries({ queryKey: reviewLinksKeys.lists() })
      
      toast.success('Lien modifié avec succès ✓')
    },
    onError: (error: Error) => {
      toast.error('Erreur de modification', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour supprimer un lien
 */
export function useDeleteReviewLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reviews/links/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de suppression')
      }
      
      const data = await res.json()
      return { id, ...data }
    },
    onSuccess: (data) => {
      // Retirer du cache
      queryClient.removeQueries({ queryKey: reviewLinksKeys.detail(data.id) })
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: reviewLinksKeys.lists() })
      
      toast.success('Lien supprimé', {
        description: data.message,
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de suppression', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour copier l'URL publique dans le presse-papier
 */
export function useCopyReviewLink() {
  return useMutation({
    mutationFn: async (url: string) => {
      if (!navigator.clipboard) {
        throw new Error('Presse-papier non disponible')
      }
      await navigator.clipboard.writeText(url)
      return url
    },
    onSuccess: () => {
      toast.success('Lien copié ! 📋', {
        description: 'Le lien est prêt à être partagé',
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de copie', {
        description: error.message,
      })
    },
  })
}
