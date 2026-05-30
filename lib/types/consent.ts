export interface UserConsent {
  essential: boolean
  analytics: boolean
  marketing: boolean
  dataProcessing: boolean
  updatedAt: string
  version: string
}

export interface ConsentUpdateData {
  consent_essential?: boolean
  consent_analytics?: boolean
  consent_marketing?: boolean
  consent_data_processing?: boolean
  consent_updated_at?: string
  consent_version?: string
}

export interface ConsentPreferences {
  canReceiveAnalytics: boolean
  canReceiveMarketing: boolean
  canProcessCardData: boolean
  hasGivenEssentialConsent: boolean
}

export const CONSENT_VERSIONS = {
  '1.0': '2024-12-20'
} as const

export type ConsentVersion = keyof typeof CONSENT_VERSIONS
