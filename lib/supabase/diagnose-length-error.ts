"use client"

import { createClient } from '@/lib/supabase/client'

export interface ColumnInfo {
  column_name: string
  data_type: string
  character_maximum_length: number | null
  is_nullable: string
}

export async function getColumnLengths(): Promise<{
  columns: ColumnInfo[]
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Utiliser une fonction RPC pour obtenir les informations des colonnes
    const { data, error } = await supabase.rpc('get_table_schema', {
      table_name: 'profiles'
    })

    if (error) {
      return {
        columns: [],
        error: error.message
      }
    }

    return {
      columns: data || []
    }
  } catch (error) {
    return {
      columns: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function testFieldLengths(profileData: any): Promise<{
  problematicFields: string[]
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Obtenir les informations des colonnes
    const { columns, error: columnError } = await getColumnLengths()
    
    if (columnError) {
      return {
        problematicFields: [],
        error: columnError
      }
    }

    const problematicFields: string[] = []

    // Vérifier chaque champ contre sa limite de longueur
    for (const column of columns) {
      if (column.character_maximum_length && profileData[column.column_name]) {
        const value = profileData[column.column_name]
        if (typeof value === 'string' && value.length > column.character_maximum_length) {
          problematicFields.push(
            `${column.column_name}: ${value.length} caractères (limite: ${column.character_maximum_length})`
          )
        }
      }
    }

    return {
      problematicFields
    }
  } catch (error) {
    return {
      problematicFields: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export function validateProfileData(profileData: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Vérifications de base
  if (profileData.bio && profileData.bio.length > 200) {
    errors.push(`Bio: ${profileData.bio.length} caractères (limite: 200)`)
  }

  if (profileData.name && profileData.name.length > 255) {
    errors.push(`Nom: ${profileData.name.length} caractères (limite: 255)`)
  }

  if (profileData.custom_url && profileData.custom_url.length > 255) {
    errors.push(`URL personnalisée: ${profileData.custom_url.length} caractères (limite: 255)`)
  }

  if (profileData.username && profileData.username.length > 255) {
    errors.push(`Nom d'utilisateur: ${profileData.username.length} caractères (limite: 255)`)
  }

  // Vérifier les URLs des réseaux sociaux
  const socialFields = ['whatsapp', 'facebook', 'instagram', 'twitter', 'website']
  for (const field of socialFields) {
    if (profileData[field] && profileData[field].length > 500) {
      errors.push(`${field}: ${profileData[field].length} caractères (limite: 500)`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
