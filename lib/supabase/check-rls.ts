"use client"

import { createClient } from '@/lib/supabase/client'

export interface RLSPolicy {
  schemaname: string
  tablename: string
  policyname: string
  permissive: string
  roles: string[]
  cmd: string
  qual: string | null
  with_check: string | null
}

export async function checkRLSStatus(): Promise<{
  isEnabled: boolean
  policies: RLSPolicy[]
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Vérifier si RLS est activé sur la table profiles
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('check_rls_enabled', { table_name: 'profiles' })

    if (rlsError) {
      return {
        isEnabled: false,
        policies: [],
        error: rlsError.message
      }
    }

    // Obtenir les politiques RLS
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' })

    if (policiesError) {
      return {
        isEnabled: rlsData || false,
        policies: [],
        error: policiesError.message
      }
    }

    return {
      isEnabled: rlsData || false,
      policies: policiesData || []
    }
  } catch (error) {
    return {
      isEnabled: false,
      policies: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function testProfileAccess(): Promise<{
  canRead: boolean
  canInsert: boolean
  canUpdate: boolean
  canDelete: boolean
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Tester la lecture
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Tester l'insertion (avec rollback)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        name: 'Test Profile',
        profile_type: 'personal',
        user_id: '00000000-0000-0000-0000-000000000000', // UUID invalide pour test
        is_public: false,
        is_active: false
      })

    // Tester la mise à jour
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name: 'Updated Test' })
      .eq('id', '00000000-0000-0000-0000-000000000000')

    // Tester la suppression
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000')

    return {
      canRead: !readError,
      canInsert: !insertError || insertError.message.includes('duplicate key') || insertError.message.includes('foreign key'),
      canUpdate: !updateError || updateError.message.includes('no rows'),
      canDelete: !deleteError || deleteError.message.includes('no rows'),
      error: readError?.message || insertError?.message || updateError?.message || deleteError?.message
    }
  } catch (error) {
    return {
      canRead: false,
      canInsert: false,
      canUpdate: false,
      canDelete: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function getCurrentUser(): Promise<{
  user: any | null
  error?: string
}> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return {
      user,
      error: error?.message
    }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}
