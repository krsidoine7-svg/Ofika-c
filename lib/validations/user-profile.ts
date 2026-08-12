import * as z from 'zod'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/constants/user-profile'

// =====================================================
// CONFIGURATION DE VALIDATION POUR LE PROFIL UTILISATEUR
// =====================================================

// Configuration des règles de validation
export const VALIDATION_CONFIG = {
  first_name: {
    minLength: 2,
    maxLength: 50,
    messages: {
      min: 'Le prénom doit contenir au moins 2 caractères',
      max: 'Le prénom ne peut pas dépasser 50 caractères'
    }
  },
  last_name: {
    minLength: 2,
    maxLength: 50,
    messages: {
      min: 'Le nom doit contenir au moins 2 caractères',
      max: 'Le nom ne peut pas dépasser 50 caractères'
    }
  },
  email: {
    messages: {
      invalid: 'Email invalide'
    }
  },
  phone: {
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{0,5}$/,
    messages: {
      invalid: 'Numéro de téléphone invalide (format accepté: +225 01 02 03 04 05 ou 0102030405)'
    }
  },
  image: {
    messages: {
      invalid: 'URL d\'image invalide'
    }
  }
} as const

// Schéma de validation pour le profil utilisateur (sauvegarde partielle)
export const userProfileSchema = z.object({
  first_name: z.string()
    .min(VALIDATION_CONFIG.first_name.minLength, VALIDATION_CONFIG.first_name.messages.min)
    .max(VALIDATION_CONFIG.first_name.maxLength, VALIDATION_CONFIG.first_name.messages.max)
    .optional(),
  last_name: z.string()
    .min(VALIDATION_CONFIG.last_name.minLength, VALIDATION_CONFIG.last_name.messages.min)
    .max(VALIDATION_CONFIG.last_name.maxLength, VALIDATION_CONFIG.last_name.messages.max)
    .optional(),
  email: z.string().email(VALIDATION_CONFIG.email.messages.invalid).optional(),
  phone: z.string()
    .regex(VALIDATION_CONFIG.phone.pattern, VALIDATION_CONFIG.phone.messages.invalid)
    .or(z.literal(''))
    .optional(),
  image: z.string().optional(),
  city: z.string().max(100, 'La ville ne peut pas dépasser 100 caractères').optional(),
  address: z.string().max(500, 'L\'adresse ne peut pas dépasser 500 caractères').optional(),
  preferred_language: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [SupportedLanguage, ...SupportedLanguage[]])
    .optional()
}).refine((data) => {
  // Au moins un champ doit être fourni
  return Object.values(data).some(value =>
    value !== undefined && value !== null && value !== ''
  )
}, {
  message: 'Au moins un champ doit être rempli'
})

// Schéma de validation pour la mise à jour (champs optionnels)
export const updateUserSchema = z.object({
  first_name: z.string()
    .min(1, 'Le prénom est requis')
    .max(VALIDATION_CONFIG.first_name.maxLength, VALIDATION_CONFIG.first_name.messages.max)
    .optional(),
  last_name: z.string()
    .min(1, 'Le nom est requis')
    .max(VALIDATION_CONFIG.last_name.maxLength, VALIDATION_CONFIG.last_name.messages.max)
    .optional(),
  phone: z.string()
    .regex(VALIDATION_CONFIG.phone.pattern, VALIDATION_CONFIG.phone.messages.invalid)
    .or(z.literal(''))
    .optional(),
  image: z.string()
    .url(VALIDATION_CONFIG.image.messages.invalid)
    .optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  preferred_language: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [SupportedLanguage, ...SupportedLanguage[]])
    .optional(),
  email: z.string()
    .email(VALIDATION_CONFIG.email.messages.invalid)
    .optional(),
})

// Types inférés
export type UserProfileFormData = z.infer<typeof userProfileSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>