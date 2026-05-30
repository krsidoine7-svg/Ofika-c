'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ========================================
// TYPES
// ========================================

export interface Review {
  id: string
  link_id: string
  client_name: string | null
  client_email: string | null
  rating: number
  comment: string | null
  has_purchase: boolean
  media_url: string | null
  media_type: 'image' | 'video' | null
  ip_address: string
  user_agent: string | null
  fingerprint: string | null
  is_verified: boolean
  is_public: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderation_note: string | null
  created_at: string
  updated_at: string
}

export interface ReviewFilters {
  rating?: number
  status?: 'pending' | 'approved' | 'rejected'
  search?: string
  limit?: number
  offset?: number
}

export interface ReviewsResponse {
  success: boolean
  data: Review[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  filters: ReviewFilters
}

export interface ModerateReviewInput {
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderation_note?: string
  is_public?: boolean
  is_verified?: boolean
}

// ========================================
// QUERY KEYS
// ========================================

export const reviewsKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewsKeys.all, 'list'] as const,
  list: (linkId: string, filters?: ReviewFilters) => 
    [...reviewsKeys.lists(), linkId, filters] as const,
  details: () => [...reviewsKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewsKeys.details(), id] as const,
}

// ========================================
// HOOKS
// ========================================

/**
 * Hook pour récupérer les avis d'un lien avec filtres
 */
export function useReviews(linkId: string | null, filters?: ReviewFilters) {
  // Utiliser 'all' si linkId est null
  const effectiveLinkId = linkId || 'all'

  return useQuery({
    queryKey: reviewsKeys.list(effectiveLinkId, filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.rating) params.set('rating', filters.rating.toString())
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.limit) params.set('limit', filters.limit.toString())
      if (filters?.offset) params.set('offset', filters.offset.toString())
      
      const url = `/api/reviews/${effectiveLinkId}${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de chargement des avis')
      }
      
      return res.json() as Promise<ReviewsResponse>
    },
    // Toujours activé maintenant que 'all' est géré
    enabled: true,
  })
}

/**
 * Hook pour modérer un avis (approuver, rejeter, etc.)
 */
export function useModerateReview(linkId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      input 
    }: { 
      reviewId: string
      input: ModerateReviewInput 
    }) => {
      const res = await fetch(`/api/reviews/moderate/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de modération')
      }
      
      const data = await res.json()
      return data.data as Review
    },
    onSuccess: (data, variables) => {
      // Invalider toutes les listes d'avis de ce lien
      queryClient.invalidateQueries({ 
        queryKey: reviewsKeys.lists() 
      })
      
      // Afficher message de succès
      const statusMessages = {
        approved: 'Avis approuvé ✓',
        rejected: 'Avis rejeté',
        pending: 'Avis remis en attente',
      }
      
      toast.success(statusMessages[variables.input.moderation_status], {
        description: variables.input.moderation_note,
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de modération', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour supprimer un avis
 */
export function useDeleteReview(linkId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/moderate/${reviewId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur de suppression')
      }
      
      return res.json()
    },
    onSuccess: () => {
      // Invalider les avis du lien
      queryClient.invalidateQueries({ 
        queryKey: reviewsKeys.lists() 
      })
      
      toast.success('Avis supprimé')
    },
    onError: (error: Error) => {
      toast.error('Erreur de suppression', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour obtenir les statistiques d'un lien
 * (Utilise les données du cache des avis)
 */
export function useReviewStats(linkId: string | null, filters?: ReviewFilters) {
  const { data } = useReviews(linkId, filters)
  
  if (!data?.data || data.data.length === 0) {
    return {
      total: 0,
      avgRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      positiveRate: 0,
      byStatus: { pending: 0, approved: 0, rejected: 0 },
    }
  }
  
  const reviews = data.data
  const total = reviews.length
  const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0)
  
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }
  
  const byStatus = {
    pending: reviews.filter(r => r.moderation_status === 'pending').length,
    approved: reviews.filter(r => r.moderation_status === 'approved').length,
    rejected: reviews.filter(r => r.moderation_status === 'rejected').length,
  }
  
  return {
    total,
    avgRating: total > 0 ? Number((ratingSum / total).toFixed(2)) : 0,
    ratingDistribution,
    positiveRate: total > 0 
      ? Number(((ratingDistribution[4] + ratingDistribution[5]) / total * 100).toFixed(1))
      : 0,
    byStatus,
  }
}
