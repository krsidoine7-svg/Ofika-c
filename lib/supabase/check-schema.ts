"use client"

import { createClient } from '@/lib/supabase/client'

export async function checkProfileSchema(): Promise<{
  isValid: boolean
  missingColumns: string[]
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Vérifier si la table profiles existe et a les bonnes colonnes
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      return {
        isValid: false,
        missingColumns: [],
        error: error.message
      }
    }

    // Liste des colonnes requises
    const requiredColumns = [
      'whatsapp',
      'facebook', 
      'instagram',
      'twitter',
      'website',
      'custom_links'
    ]

    // Vérifier si les colonnes existent en essayant de les sélectionner
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('whatsapp, facebook, instagram, twitter, website, custom_links')
      .limit(1)

    if (testError) {
      // Analyser l'erreur pour déterminer quelles colonnes manquent
      const missingColumns: string[] = []
      
      for (const column of requiredColumns) {
        if (testError.message.includes(column)) {
          missingColumns.push(column)
        }
      }

      return {
        isValid: false,
        missingColumns,
        error: testError.message
      }
    }

    return {
      isValid: true,
      missingColumns: []
    }
  } catch (error) {
    return {
      isValid: false,
      missingColumns: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function getProfileColumns(): Promise<{
  columns: string[]
  error?: string
}> {
  const supabase = createClient()
  
  try {
    // Utiliser une requête SQL pour obtenir les colonnes
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'profiles'
    })

    if (error) {
      // Fallback: essayer de sélectionner toutes les colonnes
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (testError) {
        return {
          columns: [],
          error: testError.message
        }
      }

      // Extraire les colonnes des données de test
      const columns = testData && testData.length > 0 ? Object.keys(testData[0]) : []
      return { columns }
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
