"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProfileWithLinks } from '@/lib/types/database'
import { toast } from "sonner"

const supabase = createClient()

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async (): Promise<ProfileWithLinks[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.id) {
        throw new Error('Utilisateur non connecté')
      }

      // Vérifier si l'utilisateur existe dans notre table users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // Si l'utilisateur n'existe pas, le créer
      if (userError && userError.code === 'PGRST116') {
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
          console.error('Erreur lors de la création de l\'utilisateur:', insertError)
          throw new Error('Erreur lors de la synchronisation de l\'utilisateur')
        }
      }

      // Maintenant récupérer les profils
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          links (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData: {
      name: string
      profile_type: string
      bio?: string
      image_url?: string
      custom_url?: string
      username?: string
      whatsapp?: string
      facebook?: string
      instagram?: string
      twitter?: string
      website?: string
      custom_links?: Array<{
        title: string
        url: string
        type: 'website' | 'shop' | 'other'
      }>
      is_public?: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // S'assurer que l'utilisateur existe dans notre table users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // Créer l'utilisateur s'il n'existe pas
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

      // Créer le profil
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...profileData,
          user_id: user.id,
          profile_type: profileData.profile_type || 'professional', // Add default profile_type
          is_active: true
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profil créé avec succès')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du profil')
      console.error(error)
    }
  })
}

// Soft delete (désactivation)
export function useSoftDeleteProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', profileId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profil désactivé avec succès')
    },
    onError: (error) => {
      toast.error('Erreur lors de la désactivation du profil')
      console.error('Soft delete error:', error)
    }
  })
}

// Hard delete (suppression définitive)
export function useHardDeleteProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      // D'abord supprimer les liens associés
      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('profile_id', profileId)

      if (linksError) {
        console.warn('Erreur lors de la suppression des liens:', linksError)
        // Continuer même si la suppression des liens échoue
      }

      // Ensuite supprimer le profil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profil supprimé définitivement')
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression définitive du profil')
      console.error('Hard delete error:', error)
    }
  })
}

// Hook de suppression avec choix du type
export function useDeleteProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ profileId, deleteType = 'soft' }: { 
      profileId: string
      deleteType?: 'soft' | 'hard'
    }) => {
      if (deleteType === 'hard') {
        // Suppression définitive
        const { error: linksError } = await supabase
          .from('links')
          .delete()
          .eq('profile_id', profileId)

        if (linksError) {
          console.warn('Erreur lors de la suppression des liens:', linksError)
        }

        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profileId)
        
        if (error) throw error
      } else {
        // Soft delete
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', profileId)
        
        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      const message = variables.deleteType === 'hard' 
        ? 'Profil supprimé définitivement' 
        : 'Profil supprimé avec succès'
      toast.success(message)
    },
    onError: (error, variables) => {
      const message = variables.deleteType === 'hard'
        ? 'Erreur lors de la suppression définitive du profil'
        : 'Erreur lors de la suppression du profil'
      toast.error(message)
      console.error('Delete error:', error)
    }
  })
}

// Hook pour restaurer un profil désactivé
export function useRestoreProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', profileId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profil restauré avec succès')
    },
    onError: (error) => {
      toast.error('Erreur lors de la restauration du profil')
      console.error('Restore error:', error)
    }
  })
}
