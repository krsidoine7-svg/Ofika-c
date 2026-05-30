// =====================================================
// VALIDATIONS POUR LE FORMULAIRE DE COMMANDE
// =====================================================

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface CustomerDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
}

// =====================================================
// VALIDATIONS INDIVIDUELLES
// =====================================================

/**
 * Valide un nom complet (lettres, espaces, tirets, apostrophes)
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Le nom est requis' }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' }
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Le nom ne peut pas dépasser 50 caractères' }
  }

  // Pattern: lettres, espaces, tirets, apostrophes, accents
  const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/
  if (!namePattern.test(name.trim())) {
    return { isValid: false, error: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes' }
  }

  return { isValid: true }
}

/**
 * Valide une adresse email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'L\'email est requis' }
  }

  if (email.trim().length > 100) {
    return { isValid: false, error: 'L\'email ne peut pas dépasser 100 caractères' }
  }

  // Pattern email robuste
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailPattern.test(email.trim())) {
    return { isValid: false, error: 'Format d\'email invalide' }
  }

  return { isValid: true }
}

/**
 * Valide un numéro de téléphone international
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true } // Le téléphone est optionnel
  }

  // Nettoyer le numéro (supprimer espaces, tirets, parenthèses)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

  // Pattern pour numéro international: + suivi de 7-15 chiffres
  const phonePattern = /^\+[1-9]\d{6,14}$/
  if (!phonePattern.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Format invalide. Utilisez le format international: +221 XX XXX XX XX' 
    }
  }

  // Vérifier les indicatifs pays africains et internationaux courants
  const validCountryCodes = [
    // Codes africains
    '+221', // Sénégal
    '+225', // Côte d'Ivoire
    '+226', // Burkina Faso
    '+227', // Niger
    '+228', // Togo
    '+229', // Bénin
    '+230', // Maurice
    '+231', // Liberia
    '+232', // Sierra Leone
    '+233', // Ghana
    '+234', // Nigeria
    '+235', // Tchad
    '+236', // Centrafrique
    '+237', // Cameroun
    '+238', // Cap-Vert
    '+239', // São Tomé
    '+240', // Guinée équatoriale
    '+241', // Gabon
    '+242', // Congo
    '+243', // RDC
    '+244', // Angola
    '+245', // Guinée-Bissau
    '+246', // Diego Garcia
    '+247', // Ascension
    '+248', // Seychelles
    '+249', // Soudan
    '+250', // Rwanda
    '+251', // Éthiopie
    '+252', // Somalie
    '+253', // Djibouti
    '+254', // Kenya
    '+255', // Tanzanie
    '+256', // Ouganda
    '+257', // Burundi
    '+258', // Mozambique
    '+260', // Zambie
    '+261', // Madagascar
    '+262', // Réunion
    '+263', // Zimbabwe
    '+264', // Namibie
    '+265', // Malawi
    '+266', // Lesotho
    '+267', // Botswana
    '+268', // Eswatini
    '+269', // Comores
    '+290', // Sainte-Hélène
    '+291', // Érythrée
    '+297', // Aruba
    '+298', // Îles Féroé
    '+299', // Groenland
    // Codes internationaux courants
    '+1',   // États-Unis/Canada
    '+33',  // France
    '+44',  // Royaume-Uni
    '+49',  // Allemagne
    '+86',  // Chine
    '+91',  // Inde
    '+55',  // Brésil
    '+7',   // Russie
    '+81',  // Japon
    '+82',  // Corée du Sud
    '+61',  // Australie
    '+27',  // Afrique du Sud
  ]

  const countryCode = cleanPhone.substring(0, 4)
  const shortCountryCode = cleanPhone.substring(0, 2)
  
  // Vérifier d'abord les codes à 4 chiffres, puis les codes à 2 chiffres
  if (!validCountryCodes.includes(countryCode) && !validCountryCodes.includes(shortCountryCode)) {
    return { 
      isValid: false, 
      error: 'Indicatif pays non reconnu. Utilisez un indicatif international valide.' 
    }
  }

  return { isValid: true }
}

/**
 * Valide une adresse
 */
export function validateAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'L\'adresse est requise pour la livraison' }
  }

  if (address.trim().length < 5) {
    return { isValid: false, error: 'L\'adresse doit contenir au moins 5 caractères' }
  }

  if (address.trim().length > 200) {
    return { isValid: false, error: 'L\'adresse ne peut pas dépasser 200 caractères' }
  }

  // Pattern: lettres, chiffres, espaces, tirets, virgules, points
  const addressPattern = /^[a-zA-ZÀ-ÿ0-9\s\-,\.]+$/
  if (!addressPattern.test(address.trim())) {
    return { isValid: false, error: 'L\'adresse contient des caractères non autorisés' }
  }

  return { isValid: true }
}

/**
 * Valide une ville
 */
export function validateCity(city: string): ValidationResult {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'La ville est requise pour la livraison' }
  }

  if (city.trim().length < 2) {
    return { isValid: false, error: 'La ville doit contenir au moins 2 caractères' }
  }

  if (city.trim().length > 50) {
    return { isValid: false, error: 'La ville ne peut pas dépasser 50 caractères' }
  }

  // Pattern: lettres, espaces, tirets, apostrophes
  const cityPattern = /^[a-zA-ZÀ-ÿ\s\-']+$/
  if (!cityPattern.test(city.trim())) {
    return { isValid: false, error: 'La ville ne peut contenir que des lettres, espaces, tirets et apostrophes' }
  }

  return { isValid: true }
}

/**
 * Valide un code postal
 */
export function validatePostalCode(postalCode: string): ValidationResult {
  if (!postalCode || postalCode.trim().length === 0) {
    return { isValid: true } // Le code postal est optionnel
  }

  const cleanPostalCode = postalCode.trim()

  // Pattern: 3-10 caractères alphanumériques
  const postalCodePattern = /^[a-zA-Z0-9]{3,10}$/
  if (!postalCodePattern.test(cleanPostalCode)) {
    return { isValid: false, error: 'Le code postal doit contenir entre 3 et 10 caractères alphanumériques' }
  }

  return { isValid: true }
}

// =====================================================
// VALIDATION COMPLÈTE
// =====================================================

export interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
}

export interface CompleteValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

/**
 * Valide tous les champs du formulaire
 */
export function validateCustomerDetails(details: CustomerDetails): CompleteValidationResult {
  const errors: ValidationErrors = {}

  // Valider chaque champ
  const nameValidation = validateName(details.name)
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error
  }

  const emailValidation = validateEmail(details.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  const phoneValidation = validatePhone(details.phone)
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error
  }

  const addressValidation = validateAddress(details.address)
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error
  }

  const cityValidation = validateCity(details.city)
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error
  }

  const postalCodeValidation = validatePostalCode(details.postalCode)
  if (!postalCodeValidation.isValid) {
    errors.postalCode = postalCodeValidation.error
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors
  }
}

// =====================================================
// UTILITAIRES DE FORMATAGE
// =====================================================

/**
 * Formate un numéro de téléphone pendant la saisie
 */
export function formatPhoneInput(value: string): string {
  // Supprimer tous les caractères non numériques sauf le +
  let cleaned = value.replace(/[^\d+]/g, '')
  
  // S'assurer qu'il commence par +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/^\+/, '')
  }
  
  // Limiter à 15 caractères (standard international)
  if (cleaned.length > 16) { // + suivi de 15 chiffres max
    cleaned = cleaned.substring(0, 16)
  }
  
  return cleaned
}

/**
 * Formate un nom (première lettre en majuscule)
 */
export function formatNameInput(value: string): string {
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Formate une ville (première lettre en majuscule)
 */
export function formatCityInput(value: string): string {
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
