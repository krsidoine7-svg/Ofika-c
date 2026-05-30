"use client"

import { createClient } from '@/lib/supabase/client'

export interface UrlAvailabilityResult {
  isAvailable: boolean
  suggestion?: string
  error?: string
}

export async function checkCustomUrlAvailability(
  customUrl: string,
  excludeProfileId?: string
): Promise<UrlAvailabilityResult> {
  const supabase = createClient()
  
  try {
    // Nettoyer l'URL
    const cleanUrl = customUrl.trim().toLowerCase()
    
    if (!cleanUrl) {
      return {
        isAvailable: true,
        suggestion: ''
      }
    }

    // Vérifier si l'URL existe déjà
    let query = supabase
      .from('profiles')
      .select('id, custom_url')
      .eq('custom_url', cleanUrl)
      .eq('is_active', true)

    // Exclure le profil actuel si on est en mode édition
    if (excludeProfileId) {
      query = query.neq('id', excludeProfileId)
    }

    const { data, error } = await query

    if (error) {
      return {
        isAvailable: false,
        error: error.message
      }
    }

    if (data && data.length > 0) {
      // L'URL existe déjà, suggérer des alternatives
      const suggestions = generateUrlSuggestions(cleanUrl)
      return {
        isAvailable: false,
        suggestion: suggestions[0] || `${cleanUrl}-${Date.now()}`
      }
    }

    return {
      isAvailable: true
    }
  } catch (error) {
    return {
      isAvailable: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function checkUsernameAvailability(
  username: string,
  excludeProfileId?: string
): Promise<UrlAvailabilityResult> {
  const supabase = createClient()
  
  try {
    const cleanUsername = username.trim().toLowerCase()
    
    if (!cleanUsername) {
      return {
        isAvailable: true,
        suggestion: ''
      }
    }

    let query = supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .eq('is_active', true)

    if (excludeProfileId) {
      query = query.neq('id', excludeProfileId)
    }

    const { data, error } = await query

    if (error) {
      return {
        isAvailable: false,
        error: error.message
      }
    }

    if (data && data.length > 0) {
      const suggestions = generateUrlSuggestions(cleanUsername)
      return {
        isAvailable: false,
        suggestion: suggestions[0] || `${cleanUsername}-${Date.now()}`
      }
    }

    return {
      isAvailable: true
    }
  } catch (error) {
    return {
      isAvailable: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

function generateUrlSuggestions(baseUrl: string): string[] {
  const suggestions: string[] = []
  
  // Ajouter des suffixes numériques
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseUrl}${i}`)
  }
  
  // Ajouter des suffixes avec l'année
  const currentYear = new Date().getFullYear()
  suggestions.push(`${baseUrl}${currentYear}`)
  
  // Ajouter des suffixes avec des mots
  const suffixes = ['pro', 'official', 'new', 'real']
  for (const suffix of suffixes) {
    suggestions.push(`${baseUrl}-${suffix}`)
  }
  
  return suggestions
}

export async function validateProfileUniqueness(
  customUrl: string,
  username: string,
  excludeProfileId?: string
): Promise<{
  customUrlAvailable: boolean
  usernameAvailable: boolean
  customUrlSuggestion?: string
  usernameSuggestion?: string
  errors: string[]
}> {
  const errors: string[] = []
  
  const [customUrlResult, usernameResult] = await Promise.all([
    checkCustomUrlAvailability(customUrl, excludeProfileId),
    checkUsernameAvailability(username, excludeProfileId)
  ])

  if (customUrlResult.error) {
    errors.push(`Erreur URL personnalisée: ${customUrlResult.error}`)
  }

  if (usernameResult.error) {
    errors.push(`Erreur nom d'utilisateur: ${usernameResult.error}`)
  }

  return {
    customUrlAvailable: customUrlResult.isAvailable,
    usernameAvailable: usernameResult.isAvailable,
    customUrlSuggestion: customUrlResult.suggestion,
    usernameSuggestion: usernameResult.suggestion,
    errors
  }
}
