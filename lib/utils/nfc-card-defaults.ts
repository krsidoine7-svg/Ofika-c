// =====================================================
// MODULE 9 : ONBOARDING CARTE NFC - VALEURS PAR DÉFAUT
// =====================================================

import { NFCCardFormData } from '@/lib/types/nfc-card-onboarding'

/**
 * Retourne un objet NFCCardFormData avec des valeurs par défaut
 */
export function getDefaultNFCCardFormData(): NFCCardFormData {
  return {
    fullName: '',
    company: '',
    jobTitle: '',
    bio: '',
    phone: '',
    email: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    otherLinks: '',
    location: '',
    profileName: '',
    username: '',
    customUrl: '',
    logoFile: undefined,
    logoUrl: undefined
  }
}

/**
 * Retourne un objet NFCCardFormData partiel avec des valeurs par défaut
 */
export function getPartialNFCCardFormData(overrides: Partial<NFCCardFormData> = {}): NFCCardFormData {
  return {
    ...getDefaultNFCCardFormData(),
    ...overrides
  }
}
