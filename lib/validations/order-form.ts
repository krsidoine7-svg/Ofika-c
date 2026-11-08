// =====================================================
// VALIDATIONS UNIFIÉES POUR LE TUNNEL DE COMMANDE (ZOD)
// Source unique de vérité partagée entre Client et API
// =====================================================

import { z } from 'zod'
import { ORDER_LIMITS } from '@/lib/types/payments'

// =====================================================
// TYPES ET INTERFACES CLIENT
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

// =====================================================
// SCHÉMAS ZOD PARTAGÉS
// =====================================================

export const shippingAddressSchema = z.object({
  name: z
    .string({ error: 'Le nom est requis' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z
    .union([
      z.string().trim().email('Format d\'email invalide').max(100, 'L\'email ne peut pas dépasser 100 caractères'),
      z.literal('')
    ])
    .optional(),
  phone: z
    .string({ error: 'Le numéro de téléphone est requis' })
    .trim()
    .min(8, 'Numéro de téléphone requis (minimum 8 chiffres)')
    .max(20, 'Numéro de téléphone trop long'),
  address: z
    .string({ error: 'L\'adresse de livraison est requise' })
    .trim()
    .min(2, 'L\'adresse doit contenir au moins 2 caractères')
    .max(255, 'L\'adresse ne peut pas dépasser 255 caractères'),
  city: z
    .string({ error: 'La ville est requise' })
    .trim()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(100, 'Le nom de ville ne peut pas dépasser 100 caractères'),
  postalCode: z
    .union([z.string().trim().max(10, 'Code postal trop long'), z.literal('')])
    .optional(),
})

export const orderCreateSchema = z.object({
  profile_id: z.string().uuid('ID de profil invalide').optional(),
  card_type: z.enum(['nfc_qr', 'qr_only', 'premium_subscription', 'custom']).default('nfc_qr'),
  quantity: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine(
      (val) => Number.isInteger(val) && val >= 1 && val <= ORDER_LIMITS.MAX_CARDS_PER_USER,
      `Quantité doit être un entier entre 1 et ${ORDER_LIMITS.MAX_CARDS_PER_USER}`
    ),
  payment_method: z.enum(['wave', 'orange_money', 'mtn_money', 'geniuspay']).default('geniuspay'),
  shipping_address: shippingAddressSchema,
  metadata: z.record(z.string(), z.any()).optional(),
})

export type OrderCreateData = z.infer<typeof orderCreateSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>

// =====================================================
// FONCTIONS DE VALIDATION CLIENT (COMPATIBILITÉ)
// =====================================================

export function validateCustomerDetails(details: CustomerDetails): CompleteValidationResult {
  const result = shippingAddressSchema.safeParse(details)
  if (result.success) {
    return { isValid: true, errors: {} }
  }

  const errors: ValidationErrors = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof ValidationErrors
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  })

  return {
    isValid: false,
    errors,
  }
}

export function validateName(name: string): ValidationResult {
  const result = shippingAddressSchema.shape.name.safeParse(name)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

export function validateEmail(email: string): ValidationResult {
  const result = shippingAddressSchema.shape.email.safeParse(email)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

export function validatePhone(phone: string): ValidationResult {
  const result = shippingAddressSchema.shape.phone.safeParse(phone)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

export function validateAddress(address: string): ValidationResult {
  const result = shippingAddressSchema.shape.address.safeParse(address)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

export function validateCity(city: string): ValidationResult {
  const result = shippingAddressSchema.shape.city.safeParse(city)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

export function validatePostalCode(postalCode?: string): ValidationResult {
  const result = shippingAddressSchema.shape.postalCode.safeParse(postalCode)
  return result.success ? { isValid: true } : { isValid: false, error: result.error.issues[0]?.message }
}

// =====================================================
// UTILITAIRES DE FORMATAGE
// =====================================================

export function formatPhoneInput(value: string): string {
  let cleaned = value.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/^\+/, '')
  }
  if (cleaned.length > 16) {
    cleaned = cleaned.substring(0, 16)
  }
  return cleaned
}

export function formatNameInput(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatCityInput(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
