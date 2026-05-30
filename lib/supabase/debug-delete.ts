"use client"

import { createClient } from '@/lib/supabase/client'

export interface DeleteTestResult {
  canDelete: boolean
  error?: string
  policies: any[]
  userInfo: any
}

export async function testDeletePermissions(profileId: string): Promise<DeleteTestResult> {
  const supabase = createClient()
  
  try {
    // 1. Vérifier l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        canDelete: false,
        error: 'Utilisateur non connecté',
        policies: [],
        userInfo: null
      }
    }

    // 2. Vérifier les politiques RLS pour la suppression
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' })

    // 3. Vérifier si le profil appartient à l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, name, is_active')
      .eq('id', profileId)
      .single()

    if (profileError) {
      return {
        canDelete: false,
        error: `Erreur lors de la récupération du profil: ${profileError.message}`,
        policies: policies || [],
        userInfo: { id: user.id, email: user.email }
      }
    }

    if (!profile) {
      return {
        canDelete: false,
        error: 'Profil non trouvé',
        policies: policies || [],
        userInfo: { id: user.id, email: user.email }
      }
    }

    if (profile.user_id !== user.id) {
      return {
        canDelete: false,
        error: 'Vous n\'êtes pas autorisé à supprimer ce profil',
        policies: policies || [],
        userInfo: { id: user.id, email: user.email }
      }
    }

    // 4. Tester la suppression (soft delete)
    const { error: softDeleteError } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', profileId)

    if (softDeleteError) {
      return {
        canDelete: false,
        error: `Erreur soft delete: ${softDeleteError.message}`,
        policies: policies || [],
        userInfo: { id: user.id, email: user.email }
      }
    }

    // 5. Restaurer le profil pour le test
    await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profileId)

    return {
      canDelete: true,
      policies: policies || [],
      userInfo: { id: user.id, email: user.email }
    }

  } catch (error) {
    return {
      canDelete: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      policies: [],
      userInfo: null
    }
  }
}

export async function testHardDelete(profileId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Tester la suppression définitive
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function getProfileDetails(profileId: string): Promise<{
  profile: any | null
  error?: string
}> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error) {
      return {
        profile: null,
        error: error.message
      }
    }

    return { profile: data }
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
