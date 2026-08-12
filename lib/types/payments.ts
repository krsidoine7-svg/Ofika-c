// =====================================================
// TYPES POUR LE MODULE 5 : INTÉGRATION PAIEMENTS
// Version corrigée et sécurisée
// =====================================================

// =====================================================
// TYPES DE BASE VALIDÉS
// =====================================================

export type Currency = 'XOF' | 'EUR' | 'USD'
export type CardType = 'nfc_qr' | 'qr_only' | 'premium_subscription' | 'custom'
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'failed' | 'cancelled' | 'shipped' | 'delivered'
export type PaymentStatus = 'pending' | 'paid' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'processing'
export type PaymentProvider = 'lygos' | 'wave' | 'orange_money' | 'mtn_money'

// =====================================================
// INTERFACES PRINCIPALES
// =====================================================

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode?: string
}

export interface Order {
  // Identifiants
  id: string
  user_id: string
  profile_id?: string // Optionnel pour compatibilité backward
  order_number: string

  // Produit et quantité
  card_type: CardType
  quantity: number

  // Prix (calculé automatiquement)
  unit_price: number
  total_amount: number // Renommé pour cohérence
  currency: Currency

  // Statuts
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | string
  payment_provider?: string
  shipping_status?: string

  // Adresse de livraison
  shipping_address: ShippingAddress

  // Métadonnées et tracking
  metadata?: Record<string, any>
  lygos_payment_id?: string
  wave_payment_url?: string
  tracking_number?: string
  estimated_delivery?: string
  actual_delivery?: string
  paid_at?: string
  shipped_at?: string
  delivered_at?: string

  // Timestamps
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'bank_transfer' | 'credit_card'
  provider: PaymentProvider // Utilise le type enum PaymentProvider
  is_active: boolean
  is_default?: boolean
  metadata?: Record<string, any>
}

export interface CreateOrderData {
  shipping_address: ShippingAddress
  profile_id?: string // Optionnel pour compatibilité
  card_type: CardType
  quantity: number
  unit_price?: number // Optionnel, calculé automatiquement sinon
  payment_method?: PaymentProvider // Défaut: 'lygos'
  metadata?: Record<string, any>
}

export interface UpdateOrderData {
  status?: Order['status']
  lygos_payment_id?: string
  wave_payment_url?: string
}

export interface OrderStats {
  total_orders: number
  paid_orders: number
  pending_orders: number
  failed_orders: number
  cancelled_orders: number
  total_spent: number
  can_order_more: boolean
}

export interface LygosPaymentData {
  amount: number
  order_id: string
  message?: string
  success_url?: string
  failure_url?: string
}

export interface LygosPaymentLink {
  id: string
  link: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  created_at: string
  order_id?: string
}

// =====================================================
// TYPES SUPPRIMÉS - MIGRATION WAVE TERMINÉE
// =====================================================

// ❌ REMOVED: Types Wave obsolètes après migration vers LyGOS
// Tous les paiements utilisent maintenant LyGOS uniquement


// =====================================================
// CONSTANTES DE PRICING ET LIMITES - VERSION SÉCURISÉE
// =====================================================

// Validation et parsing sécurisé des prix
function parsePrice(envVar: string | undefined, defaultValue: number): number {
  if (!envVar) return defaultValue

  const parsed = parseInt(envVar, 10)
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(`Prix invalide dans les variables d'environnement: ${envVar}, utilisation de la valeur par défaut: ${defaultValue}`)
    return defaultValue
  }

  return parsed
}

// Prix validés et sécurisés (Secours Niveau 2)
const NFC_QR_PRICE = 14600
const QR_ONLY_PRICE = 10000 // Obsolète mais gardé pour compatibilité

export const CARD_PRICING = {
  nfc_qr: NFC_QR_PRICE,
  qr_only: QR_ONLY_PRICE,
  premium_subscription: 25000,
  custom: 0, // Prix personnalisé
} as const

// Labels pour l'interface utilisateur
export const CARD_TYPE_LABELS = {
  nfc_qr: 'Carte NFC + QR Code',
  qr_only: 'Carte QR Code seulement',
  premium_subscription: 'Abonnement Premium',
  custom: 'Personnalisé',
} as const

// Limites de sécurité
export const ORDER_LIMITS = {
  MAX_ORDERS_PER_USER: 5, // Augmenté pour plus de flexibilité
  MAX_CARDS_PER_USER: 5,  // Synchronisé avec orders
  MAX_QUANTITY_PER_ORDER: 10,
  MIN_ORDER_AMOUNT: 100, // Prix minimum en XOF (réduit pour tests)
  MAX_ORDER_AMOUNT: 500000, // Prix maximum en XOF
  RATE_LIMIT_REQUESTS: 100, // Requests par minute
  RATE_LIMIT_API_REQUESTS: 30, // Requests API par minute
} as const

// Labels de statut pour l'interface
export const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  preparing: 'En préparation',
  failed: 'Échouée',
  cancelled: 'Annulée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
} as const

export const PAYMENT_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
} as const

// =====================================================
// VALIDATEURS DE SÉCURITÉ
// =====================================================

export function validateCardType(cardType: string): cardType is CardType {
  return Object.keys(CARD_PRICING).includes(cardType)
}

export function validateOrderAmount(amount: number): boolean {
  return amount >= ORDER_LIMITS.MIN_ORDER_AMOUNT && amount <= ORDER_LIMITS.MAX_ORDER_AMOUNT
}

export function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) &&
         quantity >= 1 &&
         quantity <= ORDER_LIMITS.MAX_QUANTITY_PER_ORDER
}

// =====================================================
// TYPES POUR LES WEBHOOKS
// =====================================================

export interface WebhookPayload {
  type: string
  data: Record<string, any>
  user_id: string
  user_email: string
  timestamp: string
}


export interface MakeWebhookData {
  tag: string
  data: Record<string, any>
}

// =====================================================
// TYPES POUR LES NOTIFICATIONS EMAIL
// =====================================================

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface OrderConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  cardType: string
  quantity: number
  totalPrice: number
  currency: string
  shippingAddress: ShippingAddress
}

// =====================================================
// TYPES POUR LES STATISTIQUES
// =====================================================

export interface PaymentStats {
  total_revenue: number
  total_orders: number
  success_rate: number
  average_order_value: number
  monthly_stats: MonthlyStats[]
}

export interface MonthlyStats {
  month: string
  orders: number
  revenue: number
  success_rate: number
}

// =====================================================
// TYPES POUR LES ERREURS
// =====================================================

export interface PaymentError {
  code: string
  message: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// =====================================================
// TYPES POUR LES RÉPONSES API
// =====================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// =====================================================
// TYPES POUR LES CONFIGURATIONS
// =====================================================

export interface PaymentConfig {
  provider: PaymentProvider
  api_key?: string
  webhook_secret?: string
  success_url: string
  failure_url: string
  // Configuration spécifique LyGOS
  lygos_api_key?: string
  lygos_webhook_secret?: string
}

export interface OrderConfig {
  default_currency: string
  max_quantity: number
  processing_fee: number
  shipping_fee: number
}