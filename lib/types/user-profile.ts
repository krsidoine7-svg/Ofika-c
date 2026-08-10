// =====================================================
// TYPES POUR LE PROFIL UTILISATEUR
// =====================================================

import { SupportedLanguage } from '@/lib/constants/user-profile'
export type { SupportedLanguage }

// Interface pour les données utilisateur depuis la base de données
export interface UserProfileData {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  address?: string | null
  image?: string | null
  preferred_language?: SupportedLanguage | null
  created_at?: string
  updated_at?: string
}

// Interface pour l'état du formulaire
export interface UserProfileFormState {
  userData: UserProfileData | null
  isSubmitting: boolean
  loading: boolean
}

// Props du composant UserProfileForm
export interface UserProfileFormProps {
  className?: string
  onSuccess?: (data: UserProfileData) => void
  onError?: (error: string) => void
}

// Résultat des opérations utilisateur
export interface UserOperationResult {
  success: boolean
  data?: UserProfileData
  error?: string
}