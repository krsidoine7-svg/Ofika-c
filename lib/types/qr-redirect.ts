// =====================================================
// TYPES POUR LE SYSTÈME DE QR CODE DYNAMIQUE
// =====================================================

export interface QRRedirect {
  id: string
  user_id: string
  short_code: string
  nfc_link: string
  redirect_type: 'nfc_card' | 'profile' | 'custom'
  title?: string
  description?: string
  campaign_id?: string
  scan_count: number
  last_scanned_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QRScan {
  id: string
  qr_redirect_id: string
  scanned_at: string
  user_agent?: string
  device_type?: 'mobile' | 'tablet' | 'desktop'
  os?: string
  browser?: string
  ip_address?: string
  country?: string
  city?: string
  referrer?: string
}

export interface CreateQRRedirectInput {
  nfc_link: string
  redirect_type?: 'nfc_card' | 'profile' | 'custom'
  title?: string
  description?: string
  campaign_id?: string
}

export interface UpdateQRRedirectInput {
  nfc_link?: string
  title?: string
  description?: string
  is_active?: boolean
  campaign_id?: string
}

export interface QRRedirectStats {
  total_scans: number
  scans_today: number
  scans_this_week: number
  scans_this_month: number
  last_scan?: string
  top_devices: Array<{ device: string; count: number }>
  top_countries: Array<{ country: string; count: number }>
  scans_by_day: Array<{ date: string; count: number }>
}
