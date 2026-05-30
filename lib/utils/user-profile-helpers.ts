// =====================================================
// UTILITAIRES POUR LE PROFIL UTILISATEUR
// =====================================================

import { UserProfileData, SupportedLanguage } from '@/lib/types/user-profile'
import { DEFAULTS, SUPPORTED_LANGUAGES } from '@/lib/constants/user-profile'

// ... (existing code)

// Fonction utilitaire pour charger les données dans le formulaire
export function populateFormWithUserData(
  data: UserProfileData,
  userEmail: string | undefined,
  setValue: (field: string, value: any) => void
): void {
  console.log('🎨 Populating form with data:', data)
  console.log('📧 User email from Auth:', userEmail)
  
  setValue('name', data.name || '')
  // Priorité à l'email des données utilisateur, puis à l'email de l'utilisateur auth
  setValue('email', data.email || userEmail || '')
  setValue('phone', data.phone || '')
  setValue('image', data.image || '')
  setValue('preferred_language', (data.preferred_language as SupportedLanguage) || DEFAULTS.language)
  
  console.log('✨ Form populated with:', {
    name: data.name || '',
    email: data.email || userEmail || '',
    phone: data.phone || '',
    image: data.image || '',
    preferred_language: (data.preferred_language as SupportedLanguage) || DEFAULTS.language
  })
}

// Fonction pour obtenir les options de langue formatées pour le Select
export function getLanguageOptions() {
  return Object.values(SUPPORTED_LANGUAGES).map((lang: any) => ({
    value: lang.code,
    label: lang.displayName
  }))
}

// Fonction pour valider et normaliser les données utilisateur
export function normalizeUserData(data: any): UserProfileData {
  return {
    id: data.id || '',
    name: data.name || null,
    email: data.email || null,
    phone: data.phone || null,
    image: data.image || null,
    preferred_language: data.preferred_language || DEFAULTS.language,
    created_at: data.created_at || null,
    updated_at: data.updated_at || null,
  }
}