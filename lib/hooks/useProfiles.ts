"use client"

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, ProfileWithLinks } from '@/lib/types/database'
import { toast } from 'sonner'
import { BusinessRulesService } from '@/lib/services/business-rules'
import { ErrorService } from '@/lib/services/error-service'
import { useAuth } from './useAuth'

export function useProfiles(userId?: string) {
  const [profiles, setProfiles] = useState<ProfileWithLinks[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: sharedUser } = useAuth()
  
  const supabase = useMemo(() => createClient(), [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 🔒 SÉCURITÉ : Utiliser l'utilisateur du contexte si disponible
      if (!sharedUser) {
        setProfiles([])
        return
      }

      // 🕵️ Détection automatique de l'impersonation via cookie (client-side bypass)
      let impersonatedId = null
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/x-impersonating-user=([^;]+)/)
        impersonatedId = match ? match[1] : null
      }
      
      // 🔒 SÉCURITÉ : Filtrer uniquement les profils de l'utilisateur connecté (ou cible Mascarade)
      const targetUserId = userId || impersonatedId || sharedUser.id
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des profils')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [supabase, userId, sharedUser?.id])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles
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

      // S'assurer que l'utilisateur existe dans l'une des tables de comptes (users ou admin_users)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser && !existingAdmin) {
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
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error
      
      toast.success('Profil supprimé avec succès')
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



