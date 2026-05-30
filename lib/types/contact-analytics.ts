// =====================================================
// TYPES POUR LES ANALYTICS DE CONTACTS
// =====================================================

export interface ContactAnalytics {
  id: string
  profile_id: string
  user_agent?: string
  device_type?: 'mobile' | 'desktop' | 'tablet'
  action_type: 'vcard_generated' | 'vcard_downloaded' | 'vcard_shared'
  created_at: string
}

export interface ContactData {
  // Informations personnelles
  fullName: string
  firstName?: string
  lastName?: string
  
  // Informations professionnelles
  company?: string
  jobTitle?: string
  
  // Contact
  email?: string
  phone?: string
  
  // Adresse
  address?: string
  city?: string
  country?: string
  
  // Réseaux sociaux
  website?: string
  linkedin?: string
  instagram?: string
  
  // Métadonnées
  bio?: string
  photo?: string
}

export interface VCardOptions {
  version: '3.0' | '4.0'
  encoding: 'UTF-8'
  format: 'standard' | 'minimal'
}

export interface ContactAnalyticsResponse {
  success: boolean
  data?: ContactAnalytics
  error?: string
}

export interface ContactAnalyticsStats {
  total_generated: number
  total_downloaded: number
  total_shared: number
  mobile_count: number
  desktop_count: number
  tablet_count: number
  last_30_days: number
}

// Types pour les filtres d'analytics
export interface ContactAnalyticsFilters {
  profile_id?: string
  action_type?: ContactAnalytics['action_type']
  device_type?: ContactAnalytics['device_type']
  date_from?: string
  date_to?: string
}
