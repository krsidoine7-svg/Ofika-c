"use client"

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, ProfileWithLinks } from '@/lib/types/database'
import { toast } from 'sonner'
import { BusinessRulesService } from '@/lib/services/business-rules'
import { ErrorService } from '@/lib/services/error-service'
import { useAuth } from './useAuth'

import { saveOfflineProfiles, getOfflineProfiles, addPendingMutation } from '@/lib/offline/offlineStore'

// Cache mémoire pour éviter les requêtes DB redondantes et les clignotements
const profilesCache = new Map<string, { data: ProfileWithLinks[]; timestamp: number }>()
const PROFILES_CACHE_TTL = 30000 // 30 secondes

export function invalidateProfilesCache(userId?: string) {
  if (userId) {
    profilesCache.delete(userId)
  } else {
    profilesCache.clear()
  }
}

export function useProfiles(userId?: string) {
  const { user: sharedUser } = useAuth()
  
  // 🕵️ Détection automatique de l'impersonation via cookie (client-side bypass)
  let impersonatedId = null
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/x-impersonating-user=([^;]+)/)
    impersonatedId = match ? match[1] : null
  }
  
  const targetUserId = userId || impersonatedId || sharedUser?.id

  // Lecture synchrone du cache mémoire si frais
  const cached = targetUserId ? profilesCache.get(targetUserId) : null
  const hasFreshCache = !!(cached && (Date.now() - cached.timestamp < PROFILES_CACHE_TTL))

  const [profiles, setProfiles] = useState<ProfileWithLinks[]>(() => hasFreshCache && cached ? cached.data : [])
  const [loading, setLoading] = useState(!hasFreshCache)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = useMemo(() => createClient(), [])

  const fetchProfiles = async (force = false) => {
    if (!targetUserId) {
      if (!sharedUser) {
        setProfiles([])
        setLoading(false)
      }
      return
    }

    // Si le cache est encore valide et qu'on ne force pas, pas d'appel réseau
    const currentCached = profilesCache.get(targetUserId)
    if (!force && currentCached && (Date.now() - currentCached.timestamp < PROFILES_CACHE_TTL)) {
      setProfiles(currentCached.data)
      setLoading(false)
      return
    }

    try {
      // Ne passer loading à true QUE si on n'a rien à afficher
      if (profiles.length === 0) {
        setLoading(true)
      }
      setError(null)

      // En mode hors-ligne, lire immédiatement depuis IndexedDB
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const offlineCached = await getOfflineProfiles()
        setProfiles(offlineCached || [])
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const fetchedProfiles = data || []
      setProfiles(fetchedProfiles)
      
      // Mettre à jour le cache mémoire
      profilesCache.set(targetUserId, { data: fetchedProfiles, timestamp: Date.now() })

      // Mettre en cache localement dans IndexedDB pour le futur mode hors-ligne
      saveOfflineProfiles(fetchedProfiles)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      // Fallback IndexedDB si échec réseau
      const offlineCached = await getOfflineProfiles()
      if (offlineCached && offlineCached.length > 0) {
        setProfiles(offlineCached)
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des profils')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (targetUserId) {
      fetchProfiles()
    }
  }, [supabase, targetUserId])

  return {
    profiles,
    loading,
    error,
    refetch: () => fetchProfiles(true)
  }
}

export function useCreateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = useMemo(() => createClient(), [])

  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)
      
      // MODE HORS-LIGNE : Sauvegarde locale dans IndexedDB + Queue de mutation
      if (typeof window !== 'undefined' && !navigator.onLine) {
        const offlineId = `offline-${Date.now()}`
        const offlineProfile: any = {
          ...profileData,
          id: offlineId,
          user_id: profileData.user_id || 'offline-user',
          profile_type: profileData.profile_type || 'professional',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        await addPendingMutation({
          type: 'CREATE_PROFILE',
          entity: 'profiles',
          data: offlineProfile
        })

        const existingCached = await getOfflineProfiles()
        await saveOfflineProfiles([offlineProfile, ...existingCached])

        toast.info('Profil créé en mode hors-ligne. Il sera synchronisé automatiquement dès le retour du réseau.')
        return offlineProfile
      }

      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier les contraintes métier avant la création
      const { canCreate, currentCount, maxAllowed, error: constraintError } = 
        await BusinessRulesService.canCreateProfile(user.id)

      if (!canCreate) {
        throw new Error(`Limite de profils atteinte. Vous avez ${currentCount}/${maxAllowed} profils. ${constraintError || ''}`)
      }

      // Vérifier l'unicité des URLs si fournies
      if (profileData.custom_url) {
        const { isAvailable: customUrlAvailable, error: urlError } = 
          await BusinessRulesService.isCustomUrlAvailable(profileData.custom_url)
        
        if (!customUrlAvailable) {
          throw new Error(`L'URL personnalisée "${profileData.custom_url}" est déjà utilisée`)
        }
      }

      if (profileData.username) {
        const { isAvailable: usernameAvailable, error: usernameError } = 
          await BusinessRulesService.isUsernameAvailable(profileData.username)
        
        if (!usernameAvailable) {
          throw new Error(`Le nom d'utilisateur "${profileData.username}" est déjà utilisé`)
        }
      }

      // S'assurer que l'utilisateur existe dans la table users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Créer l'utilisateur s'il n'existe dans aucune table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
            image: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          throw new Error('Erreur lors de la synchronisation de l\'utilisateur')
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...profileData,
          user_id: user.id,
          profile_type: profileData.profile_type || 'professional', // Add default profile_type
          is_active: true
        }])
        .select()
        .single()

      if (error) throw error
      
      invalidateProfilesCache(user.id)
      toast.success('Profil créé avec succès')
      return data
    } catch (err) {
      console.error('Error creating profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du profil'
      setError(errorMessage)
      
      // Utiliser le service d'erreurs centralisé
      ErrorService.handleProfileCreationError(err, {
        action: 'createProfile',
        component: 'useCreateProfile',
        userId: profileData.user_id
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createProfile,
    loading,
    error
  }
}

export function useDeleteProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = useMemo(() => createClient(), [])

  const deleteProfile = async (profileId: string) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Récupérer les infos du profil avant suppression
      const { data: profile } = await supabase
        .from('profiles')
        .select('custom_url, username, user_id')
        .eq('id', profileId)
        .maybeSingle()

      if (profile) {
        const slug = profile.custom_url || profile.username
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')
        const targetUrl = `${appUrl}/p/${slug}`

        // Supprimer / Désactiver les QR codes associés à ce profil
        await supabase
          .from('qr_redirects')
          .update({ deleted_at: new Date().toISOString(), is_active: false })
          .eq('user_id', profile.user_id)
          .ilike('target_url', `%${slug}%`)
      }

      // 2. Supprimer le profil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error
      
      invalidateProfilesCache()
      toast.success('Profil et QR code associé supprimés avec succès')
    } catch (err) {
      console.error('Error deleting profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du profil'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteProfile,
    loading,
    error
  }
}



