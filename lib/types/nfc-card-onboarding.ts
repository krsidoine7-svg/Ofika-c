// =====================================================
// MODULE 9 : ONBOARDING CARTE NFC - TYPES TYPESCRIPT
// =====================================================

// Types pour les données du formulaire NFC
export interface NFCCardFormData {
  // Informations obligatoires
  fullName: string
  company: string
  jobTitle: string
  bio?: string
  phone: string
  email: string
  
  // Réseaux sociaux (optionnels) - Format unifié
  social_links?: { platform: string; url: string }[]
  custom_links?: { title: string; url: string; type?: string }[]
  
  // Rétrocompatibilité (si besoin)
  instagram?: string
  tiktok?: string
  linkedin?: string
  otherLinks?: string
  
  // Localisation
  location?: string
  
  // Profil
  profileName: string
  username?: string
  customUrl?: string
  
  // Logo
  logoFile?: File
  logoUrl?: string
  
  // Photo de profil
  profilePhotoFile?: File
  profilePhotoUrl?: string
  
  // Consentements
  consentEssential?: boolean
  consentDataProcessing?: boolean
  
  // Données de la carte créée (pour l'association et l'étape SUCCESS)
  createdCardId?: string
  createdCardNfcLink?: string
  createdCardData?: any
}

// Types pour les modèles de design
export interface CardDesign {
  id: string
  name: string
  description: string
  preview: string
  layout: {
    logoPosition: 'top-left' | 'top-center' | 'top-right'
    textAlignment: 'left' | 'center' | 'right'
    qrPosition: 'bottom-right' | 'bottom-center' | 'bottom-left'
    cardStyle: 'minimal' | 'gradient' | 'clean' | 'branded'
  }
}

// Types pour les options de couleur
export interface ColorOption {
  id: string
  name: string
  primary: string
  secondary: string
  textColor: 'white' | 'black'
  gradient: string
}

// Types pour le profil NFC complet
export interface NFCProfile {
  id: string
  user_id: string
  full_name: string
  company: string
  job_title: string
  bio?: string
  phone: string
  email: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  other_links?: string
  location?: string
  profile_name: string
  username?: string
  custom_url?: string
  logo_url?: string
  nfc_link: string
  qr_code_url?: string
  design_choice: string
  color_theme: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

// Types pour l'état de l'onboarding
export interface OnboardingState {
  currentStep: number
  totalSteps: number
  formData: NFCCardFormData
  selectedDesign: CardDesign | null
  selectedColor: ColorOption | null
  isLoading: boolean
  error: string | null
}

// Types pour les actions de l'onboarding
export type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<NFCCardFormData> }
  | { type: 'SET_DESIGN'; payload: CardDesign }
  | { type: 'SET_COLOR'; payload: ColorOption }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }

// Types pour les props des composants
export interface NFCCardStepProps {
  onNext: () => void
  onPrev: () => void
  onDataChange: (data: Partial<NFCCardFormData>) => void
  onValidationChange?: (isValid: boolean) => void
  formData: NFCCardFormData
  isLoading?: boolean
  error?: string | null
}

export interface NFCCardDesignStepProps extends NFCCardStepProps {
  selectedDesign: CardDesign | null
  selectedColor: ColorOption | null
  onDesignChange: (design: CardDesign) => void
  onColorChange: (color: ColorOption) => void
}


// Types pour les réponses API
export interface CreateNFCProfileResponse {
  success: boolean
  data?: NFCProfile
  error?: string
}

export interface UploadLogoResponse {
  success: boolean
  url?: string
  error?: string
}

// Types pour les statistiques
export interface NFCProfileStats {
  profile_id: string
  created_at: string
  status: string
  has_logo: boolean
  design: string
  color_theme: string
  social_links_count: number
}

// Types pour la validation
export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

// Types pour les constantes
export const CARD_DESIGNS: CardDesign[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Design épuré et professionnel',
    preview: '/designs/classic-preview.png',
    layout: {
      logoPosition: 'top-left',
      textAlignment: 'center',
      qrPosition: 'bottom-right',
      cardStyle: 'minimal'
    }
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Style contemporain avec gradients',
    preview: '/designs/modern-preview.png',
    layout: {
      logoPosition: 'top-center',
      textAlignment: 'center',
      qrPosition: 'bottom-center',
      cardStyle: 'gradient'
    }
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Simplicité et élégance',
    preview: '/designs/minimal-preview.png',
    layout: {
      logoPosition: 'top-right',
      textAlignment: 'left',
      qrPosition: 'bottom-left',
      cardStyle: 'clean'
    }
  },
  {
    id: 'ofika-optimized',
    name: 'Ofika Optimisé',
    description: 'Design spécialement conçu pour Ofika',
    preview: '/designs/ofika-preview.png',
    layout: {
      logoPosition: 'top-center',
      textAlignment: 'center',
      qrPosition: 'bottom-center',
      cardStyle: 'branded'
    }
  }
]

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'ofika', name: 'Ofika', primary: '#f97316', secondary: '#ec4899', textColor: 'white', gradient: 'from-orange-500 to-pink-500' },
  { id: 'blue', name: 'Bleu', primary: '#3b82f6', secondary: '#8b5cf6', textColor: 'white', gradient: 'from-blue-500 to-purple-500' },
  { id: 'green', name: 'Vert', primary: '#10b981', secondary: '#06b6d4', textColor: 'white', gradient: 'from-green-500 to-cyan-500' },
  { id: 'red', name: 'Rouge', primary: '#ef4444', secondary: '#f97316', textColor: 'white', gradient: 'from-red-500 to-orange-500' },
  { id: 'purple', name: 'Violet', primary: '#8b5cf6', secondary: '#ec4899', textColor: 'white', gradient: 'from-purple-500 to-pink-500' },
  { id: 'gray', name: 'Gris', primary: '#6b7280', secondary: '#374151', textColor: 'white', gradient: 'from-gray-500 to-gray-700' },
  { id: 'black', name: 'Noir', primary: '#000000', secondary: '#1f2937', textColor: 'white', gradient: 'from-black to-gray-800' },
  { id: 'white', name: 'Blanc', primary: '#ffffff', secondary: '#f3f4f6', textColor: 'black', gradient: 'from-white to-gray-100' }
]

// Types pour les étapes de l'onboarding
export const ONBOARDING_STEPS = {
  INTRO: 1,
  FORM: 2,
  SIGNUP: 3,
  DESIGN: 4,
  PROFILE_SELECTION: 5,
  SUCCESS: 6
} as const

export type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS]
