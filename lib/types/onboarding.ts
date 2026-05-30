/**
 * Types TypeScript pour le système d'onboarding multi-parcours
 */

// =====================================================
// TYPES DE BASE
// =====================================================

export type OnboardingFlowType = 'nfc' | 'public_page'

export type NFCCardStatus = 
  | 'draft' 
  | 'pending_order' 
  | 'ordered' 
  | 'in_production' 
  | 'shipped' 
  | 'delivered' 
  | 'activated'

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled'

export type ShippingStatus = 
  | 'pending' 
  | 'preparing' 
  | 'shipped' 
  | 'in_transit' 
  | 'delivered' 
  | 'returned'

// =====================================================
// PENDING CREATIONS
// =====================================================

export interface PendingCreation {
  id: string
  session_id: string
  type: OnboardingFlowType
  payload: PublicPagePayload | NFCCardPayload
  step_completed: number
  created_at: string
  expires_at: string
}

export interface PublicPagePayload {
  // Step 1: Basic Info
  name?: string
  bio?: string
  profile_type?: 'professional' | 'personal' | 'event'
  image_url?: string
  
  // Step 2: Social Links
  social_links?: Array<{
    platform: string
    url: string
  }>
  
  // Step 3: Custom Links
  custom_links?: Array<{
    title: string
    url: string
    type: 'website' | 'shop' | 'other'
  }>
  
  // Step 4: Customization
  color_theme?: string
  template_id?: string
  custom_url?: string
}

export interface NFCCardPayload {
  // Step 1: Card Design
  design_id?: string
  color_theme?: string
  custom_logo_url?: string
  
  // Step 2: Profile Info
  name?: string
  position?: string
  company?: string
  bio?: string
  image_url?: string
  
  // Step 3: Contact Info
  email?: string
  phone?: string
  website?: string
  social_links?: Array<{
    platform: string
    url: string
  }>
  
  // Step 4: Preview
  custom_url?: string
}

// =====================================================
// NFC CARDS
// =====================================================

export interface NFCCard {
  id: string
  user_id: string
  profile_id: string | null
  design_id: string
  color_theme: string
  custom_logo_url: string | null
  status: NFCCardStatus
  chip_id: string | null
  activation_code: string | null
  activated_at: string | null
  preview_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateNFCCardInput {
  design_id: string
  color_theme?: string
  custom_logo_url?: string
  profile_id?: string
  preview_data?: Record<string, any>
}

// =====================================================
// ORDERS
// =====================================================

export interface Order {
  id: string
  order_number: string
  user_id: string
  nfc_card_id: string | null
  amount_cents: number
  currency: string
  shipping_cents: number
  tax_cents: number
  total_cents: number
  payment_status: PaymentStatus
  payment_provider: string
  payment_intent_id: string | null
  shipping_status: ShippingStatus
  tracking_number: string | null
  carrier: string | null
  shipping_address: ShippingAddress
  metadata: Record<string, any>
  notes: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
}

export interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export interface CreateOrderInput {
  nfc_card_id: string
  shipping_address: ShippingAddress
  amount_cents?: number
  currency?: string
}

export interface PricingDetails {
  base_price: number  // Prix de base en XOF
  quantity: number
  subtotal: number  // Sous-total en XOF
  shipping_cost: number  // Frais de livraison en XOF
  tax_cost: number  // Taxes en XOF
  total: number  // Total en XOF
  currency: string  // 'XOF'
}

// =====================================================
// ONBOARDING SESSIONS
// =====================================================

export interface OnboardingSession {
  id: string
  session_id: string
  user_id: string | null
  flow_type: OnboardingFlowType
  current_step: number
  total_steps: number
  steps_completed: number[]
  started_at: string
  last_activity_at: string
  completed_at: string | null
  abandoned_at: string | null
  device_type: string | null
  browser: string | null
  referrer: string | null
  utm_source: string | null
  utm_campaign: string | null
  created_at: string
  updated_at: string
}

export interface CreateOnboardingSessionInput {
  session_id: string
  flow_type: OnboardingFlowType
  device_type?: string
  browser?: string
  referrer?: string
  utm_source?: string
  utm_campaign?: string
}

export interface UpdateOnboardingSessionInput {
  current_step?: number
  steps_completed?: number[]
  user_id?: string
  completed_at?: string
  abandoned_at?: string
}

// =====================================================
// WIZARD STEPS
// =====================================================

export interface WizardStep {
  number: number
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  percentComplete: number
}

// =====================================================
// API RESPONSES
// =====================================================

export interface OnboardingApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SaveTempResponse {
  success: boolean
  pending_creation_id: string
  expires_at: string
}

export interface FinalizeOnboardingInput {
  session_id: string
  type: OnboardingFlowType
  user_id: string
}

export interface FinalizeOnboardingResponse {
  success: boolean
  profile_id?: string
  nfc_card_id?: string
  redirect_url: string
}

// =====================================================
// DESIGN TEMPLATES
// =====================================================

export interface NFCCardDesign {
  id: string
  name: string
  description: string
  preview_url: string
  price_modifier: number  // Supplément en XOF (0 = gratuit, 5000 = +5000 XOF)
  is_premium: boolean
  features: string[]
}

export const NFC_CARD_DESIGNS: NFCCardDesign[] = [
  {
    id: 'design-classic',
    name: 'Classique',
    description: 'Design sobre et professionnel',
    preview_url: '/designs/classic.png',
    price_modifier: 0,
    is_premium: false,
    features: ['QR Code', 'Puce NFC', 'Impression recto-verso']
  },
  {
    id: 'design-modern',
    name: 'Moderne',
    description: 'Design épuré avec effets de dégradé',
    preview_url: '/designs/modern.png',
    price_modifier: 0,
    is_premium: false,
    features: ['QR Code', 'Puce NFC', 'Dégradé personnalisable']
  },
  {
    id: 'design-premium-metal',
    name: 'Premium Métal',
    description: 'Carte en métal brossé avec gravure laser',
    preview_url: '/designs/premium-metal.png',
    price_modifier: 5000,  // +5000 XOF
    is_premium: true,
    features: ['Métal brossé', 'Gravure laser', 'QR Code', 'Puce NFC']
  },
  {
    id: 'design-premium-wood',
    name: 'Premium Bois',
    description: 'Carte en bois véritable',
    preview_url: '/designs/premium-wood.png',
    price_modifier: 5000,  // +5000 XOF
    is_premium: true,
    features: ['Bois véritable', 'Gravure laser', 'QR Code', 'Puce NFC']
  }
]

// =====================================================
// VALIDATION SCHEMAS (à utiliser avec Zod)
// =====================================================

export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string
}
