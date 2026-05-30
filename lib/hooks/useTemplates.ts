'use client'

import { useState, useEffect } from 'react'
import { TemplateSchema } from '@/lib/types/template'

interface UseTemplatesReturn {
  templates: TemplateSchema[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook pour récupérer les templates disponibles
 */
export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<TemplateSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/templates')
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des templates')
      }
      
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  }
}

/**
 * Hook pour récupérer un template spécifique par son slug
 */
export function useTemplate(slug: string | null) {
  const { templates, loading, error } = useTemplates()
  const [template, setTemplate] = useState<TemplateSchema | null>(null)

  useEffect(() => {
    if (slug && templates.length > 0) {
      const found = templates.find(t => t.slug === slug)
      setTemplate(found || null)
    }
  }, [slug, templates])

  return {
    template,
    loading,
    error
  }
}
