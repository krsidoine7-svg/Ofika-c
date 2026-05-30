// =====================================================
// TYPES POUR LES CARTES NFC
// =====================================================

export interface NFCCard {
  id: string
  user_id: string
  profile_id?: string  // Optionnel - peut être null pour les cartes autonomes
  profile_name: string
  nfc_link: string
  qr_code_url?: string
  design_choice: string
  color_theme: string
  status: 'active' | 'inactive' | 'pending' | 'shipped' | 'delivered'
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  tracking_number?: string

  // Expanded fields available in DB
  full_name?: string
  company?: string
  job_title?: string
  bio?: string
  phone?: string
  email?: string
  logo_url?: string
  profile_photo_url?: string
  location?: string
}

export interface CreateNFCCardData {
  profile_name: string
  nfc_link: string
  design_choice: string
  color_theme: string
  profile_id?: string  // Optionnel - peut être null pour les cartes autonomes
  
  // Informations personnelles du formulaire NFC
  fullName?: string
  company?: string
  jobTitle?: string
  bio?: string
  phone?: string
  email?: string
  location?: string
  
  // Réseaux sociaux (stockés dans profiles, plus utilisés dans digital_nfc_cards)
  otherLinks?: string
  
  // Configuration du profil
  customUrl?: string
  
  // Images - Les File objects sont nécessaires pour l'upload vers Supabase Storage
  logoUrl?: string
  logoFile?: File  // ← NÉCESSAIRE pour upload Supabase Storage
  profilePhotoUrl?: string
  profilePhotoFile?: File  // ← NÉCESSAIRE pour upload Supabase Storage
  
  // Nouveaux champs pour profil unifié
  social_links?: { platform: string; url: string }[]
  custom_links?: { title: string; url: string; type?: string }[]
}

export interface UpdateNFCCardData {
  profile_name?: string
  design_choice?: string
  color_theme?: string
  status?: NFCCard['status']
  nfc_link?: string  // Lien vers la page Link to Bio
  profile_id?: string | null // Association avec un profil Link to Bio
  
  // Informations personnelles modifiables
  full_name?: string
  company?: string
  job_title?: string
  phone?: string
  email?: string
  location?: string
  logo_url?: string
  profile_photo_url?: string
}

export interface NFCCardResponse {
  success: boolean
  data?: NFCCard
  error?: string
}

export interface NFCCardsResponse {
  success: boolean
  data?: NFCCard[]
  error?: string
}

// Types pour les statistiques des cartes NFC
export interface NFCCardStats {
  total_cards: number
  active_cards: number
  pending_cards: number
  shipped_cards: number
  delivered_cards: number
}

// Types pour les filtres
export interface NFCCardFilters {
  status?: NFCCard['status']
  design_choice?: string
  color_theme?: string
  date_from?: string
  date_to?: string
}
