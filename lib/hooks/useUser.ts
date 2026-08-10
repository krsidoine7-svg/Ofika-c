"use client"

import { useState, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { z } from 'zod'

// Import des nouvelles validations configurables
import { updateUserSchema } from '@/lib/validations/user-profile'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
})

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis pour confirmation'),
})

// Types inférés
type UpdateUserData = z.infer<typeof updateUserSchema>
type ChangePasswordData = z.infer<typeof changePasswordSchema>
type DeleteAccountData = z.infer<typeof deleteAccountSchema>

// Configuration sécurisée
const API_CONFIG = {
  timeout: 10000, // 10 secondes
  maxRetries: 2,
  retryDelay: 1000,
}

// Utilitaire pour les requêtes API avec timeout et gestion d'erreurs
async function apiRequest(
  url: string,
  options: RequestInit = {},
  retries = API_CONFIG.maxRetries
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)
    return response

  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé')
    }

    // Retry logic pour les erreurs réseau temporaires
    if (retries > 0 && (
      error instanceof TypeError || // Erreur réseau
      (error instanceof Response && error.status >= 500) // Erreur serveur
    )) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay))
      return apiRequest(url, options, retries - 1)
    }

    throw error
  }
}

export function useUser() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache local pour éviter les appels répétés
  const userDataCache = useMemo(() => new Map<string, { data: any; timestamp: number }>(), [])

  // Récupérer les données complètes de l'utilisateur avec cache
  const getUserData = useCallback(async (userId?: string, forceRefresh = false) => {
    // 🕵️ Détection de l'impersonation via cookie
    let impersonatedId = null
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/x-impersonating-user=([^;]+)/)
      impersonatedId = match ? match[1] : null
    }

    const targetId = userId || impersonatedId || user?.id
    
    if (!targetId) {
      setError('ID utilisateur non disponible')
      return null
    }

    const cacheKey = `user_${targetId}`
    const cached = userDataCache.get(cacheKey)
    const now = Date.now()
    const CACHE_DURATION = 30 * 1000 // 30 secondes (au lieu de 5 minutes)

    // Utiliser le cache si valide
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest(`/api/users/${targetId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé')
        } else if (response.status === 404) {
          throw new Error('Utilisateur non trouvé')
        } else {
          throw new Error(errorData.error || `Erreur ${response.status}`)
        }
      }

      const data = await response.json()

      // Mettre en cache
      userDataCache.set(cacheKey, { data, timestamp: now })

      return data

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des données'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, userDataCache])

  // Mettre à jour les données de l'utilisateur avec validation
  const updateUser = useCallback(async (data: UpdateUserData) => {
    if (!user) {
      const message = 'Vous devez être connecté'
      setError(message)
      toast.error(message)
      return false
    }

    // Validation des données
    const validation = updateUserSchema.safeParse(data)
    if (!validation.success) {
      const message = validation.error.errors[0]?.message || 'Données invalides'
      setError(message)
      toast.error(message)
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(validation.data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 400) {
          throw new Error(errorData.error || 'Données invalides')
        } else if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        } else if (response.status === 403) {
          throw new Error('Modification non autorisée')
        } else if (response.status === 409) {
          throw new Error('Email déjà utilisé')
        } else {
          throw new Error(errorData.error || `Erreur ${response.status}`)
        }
      }

      const updatedUser = await response.json()

      // Invalider complètement le cache et rafraîchir l'utilisateur
      userDataCache.clear() // Clear all cache instead of just one entry
      await refreshUser()

      toast.success('Profil mis à jour avec succès')
      return updatedUser

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, refreshUser, userDataCache])

  // Changer le mot de passe avec validation renforcée
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    if (!user) {
      const message = 'Vous devez être connecté'
      setError(message)
      toast.error(message)
      return false
    }

    // Validation des mots de passe
    const validation = changePasswordSchema.safeParse(data)
    if (!validation.success) {
      const message = validation.error.errors[0]?.message || 'Données invalides'
      setError(message)
      toast.error(message)
      return false
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (data.currentPassword === data.newPassword) {
      const message = 'Le nouveau mot de passe doit être différent de l\'actuel'
      setError(message)
      toast.error(message)
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify(validation.data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 400) {
          throw new Error(errorData.error || 'Mot de passe actuel incorrect')
        } else if (response.status === 401) {
          throw new Error(errorData.error || 'Session expirée. Veuillez vous reconnecter.')
        } else if (response.status === 429) {
          throw new Error('Trop de tentatives. Veuillez réessayer plus tard.')
        } else {
          throw new Error(errorData.error || `Erreur ${response.status}`)
        }
      }

      toast.success('Mot de passe changé avec succès')
      return true

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  // Supprimer le compte avec confirmation renforcée
  const deleteAccount = useCallback(async (confirmationData: DeleteAccountData) => {
    if (!user) {
      const message = 'Vous devez être connecté'
      setError(message)
      toast.error(message)
      return false
    }

    // Validation des données de confirmation
    const validation = deleteAccountSchema.safeParse(confirmationData)
    if (!validation.success) {
      const message = validation.error.errors[0]?.message || 'Mot de passe requis'
      setError(message)
      toast.error(message)
      return false
    }

    // Double confirmation pour éviter les suppressions accidentelles
    const confirmMessage = '⚠️ ATTENTION: Cette action est irréversible. Toutes vos données seront supprimées définitivement. Confirmer la suppression ?'
    if (!confirm(confirmMessage)) {
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest(`/api/users/${user.id}`, {
        method: 'DELETE',
        body: JSON.stringify(validation.data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 400) {
          throw new Error(errorData.error || 'Mot de passe incorrect')
        } else if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        } else if (response.status === 403) {
          throw new Error('Suppression non autorisée')
        } else {
          throw new Error(errorData.error || `Erreur ${response.status}`)
        }
      }

      toast.success('Compte supprimé avec succès')

      // Déconnexion propre et redirection sécurisée
      setTimeout(async () => {
        try {
          // Nettoyer le cache avant la redirection
          userDataCache.clear()
          // Utiliser Next.js router au lieu de window.location pour une meilleure UX
          window.location.href = '/?message=account_deleted'
        } catch (error) {
          // Fallback en cas d'erreur
          window.location.href = '/'
        }
      }, 2000)

      return true

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du compte'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, userDataCache])

  return useMemo(() => ({
    user,
    loading,
    error,
    getUserData,
    updateUser,
    changePassword,
    deleteAccount,
  }), [user, loading, error, getUserData, updateUser, changePassword, deleteAccount])
}
