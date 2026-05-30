// =====================================================
// CONSTANTES POUR LE PROFIL UTILISATEUR
// =====================================================

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    displayName: '🇫🇷 Français'
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    displayName: '🇺🇸 English'
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    displayName: '🇪🇸 Español'
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    displayName: '🇩🇪 Deutsch'
  }
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES
export type LanguageOption = typeof SUPPORTED_LANGUAGES[SupportedLanguage]

// Défauts
export const DEFAULTS = {
  language: 'fr' as SupportedLanguage,
  phoneCountryCode: '+225'
} as const

// Placeholders
export const PLACEHOLDERS = {
  name: 'Votre nom complet',
  email: 'votre@email.com',
  phone: `${DEFAULTS.phoneCountryCode} XX XX XX XX`,
  language: 'Sélectionnez une langue'
} as const

// Labels et textes
export const LABELS = {
  personalInfo: {
    title: 'Informations personnelles',
    description: 'Gérez vos informations de profil'
  },
  fields: {
    name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    language: 'Langue préférée',
    image: 'Photo de profil'
  },
  buttons: {
    submit: 'Enregistrer les modifications',
    submitting: 'Mise à jour...'
  },
  messages: {
    emailChangeWarning: 'Un email de vérification sera envoyé si vous changez votre adresse',
    imageHelp: 'JPG, PNG, GIF jusqu\'à 5MB',
    imageClickToChange: 'Cliquez sur l\'image pour la changer'
  }
} as const

// Classes CSS réutilisables
export const STYLES = {
  button: {
    primary: 'w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
  },
  input: {
    withIcon: 'pl-10'
  }
} as const