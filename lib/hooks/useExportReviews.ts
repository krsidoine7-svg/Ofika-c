'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// ========================================
// TYPES
// ========================================

export type ExportFormat = 'csv' | 'json'

export interface ExportFilters {
  rating?: number
  status?: 'pending' | 'approved' | 'rejected'
}

export interface ExportOptions {
  linkId: string
  format?: ExportFormat
  filters?: ExportFilters
}

export interface ExportResponse {
  success: boolean
  link: {
    id: string
    title: string
  }
  stats: {
    total: number
    avgRating: string
    ratingDistribution: Record<string, number>
    positiveRate: string
    withComment: number
    withPurchase: number
    verified: number
  }
  reviews: any[]
  exported_at: string
}

// ========================================
// HOOKS
// ========================================

/**
 * Hook pour exporter les avis en CSV ou JSON
 * 
 * @example
 * const { mutate: exportReviews, isPending } = useExportReviews()
 * 
 * // Export CSV
 * exportReviews({
 *   linkId: 'uuid',
 *   format: 'csv',
 *   filters: { rating: 5 }
 * })
 * 
 * // Export JSON
 * exportReviews({
 *   linkId: 'uuid',
 *   format: 'json'
 * })
 */
export function useExportReviews() {
  return useMutation({
    mutationFn: async ({ linkId, format = 'csv', filters }: ExportOptions) => {
      const params = new URLSearchParams()
      params.set('format', format)
      if (filters?.rating) params.set('rating', filters.rating.toString())
      if (filters?.status) params.set('status', filters.status)
      
      const url = `/api/reviews/export/${linkId}?${params.toString()}`
      const res = await fetch(url)
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur d\'export')
      }
      
      if (format === 'csv') {
        // Télécharger le fichier CSV
        const blob = await res.blob()
        const contentDisposition = res.headers.get('content-disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `avis-${linkId}.csv`
        
        // Créer un lien de téléchargement temporaire
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
        
        return { format: 'csv', filename }
      } else {
        // Retourner les données JSON
        const data = await res.json()
        return data as ExportResponse
      }
    },
    onSuccess: (data) => {
      if ('format' in data && data.format === 'csv') {
        toast.success('Export CSV réussi ! 📥', {
          description: `Fichier ${data.filename} téléchargé`,
        })
      } else if ('stats' in data) {
        toast.success('Export JSON réussi ! 📊', {
          description: `${data.stats.total} avis exportés`,
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Erreur d\'export', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook utilitaire pour copier les données JSON dans le presse-papier
 */
export function useCopyExportToClipboard() {
  return useMutation({
    mutationFn: async (data: ExportResponse) => {
      if (!navigator.clipboard) {
        throw new Error('Presse-papier non disponible')
      }
      
      const jsonString = JSON.stringify(data, null, 2)
      await navigator.clipboard.writeText(jsonString)
      
      return data
    },
    onSuccess: (data) => {
      toast.success('Données copiées ! 📋', {
        description: `${data.stats.total} avis dans le presse-papier`,
      })
    },
    onError: (error: Error) => {
      toast.error('Erreur de copie', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook pour télécharger un rapport PDF (à implémenter côté serveur)
 * Placeholder pour future fonctionnalité
 */
export function useExportPDF() {
  return useMutation({
    mutationFn: async ({ linkId }: { linkId: string }) => {
      // TODO: Implémenter l'export PDF côté serveur
      throw new Error('Export PDF non encore implémenté')
    },
    onError: (error: Error) => {
      toast.error('Fonctionnalité à venir', {
        description: 'L\'export PDF sera disponible prochainement',
      })
    },
  })
}
