// =====================================================
// VALIDATION: Schémas Zod pour Profils et Templates
// =====================================================

import { z } from 'zod'
import { TemplateField, TemplateFieldType } from '@/lib/types/template'
import { SocialLinkType, MAX_SOCIAL_LINKS } from '@/lib/types/social-links'

/**
 * Schéma pour un lien social individuel
 */
export const socialLinkSchema = z.object({
  type: z.enum([
    'whatsapp',
    'facebook',
    'instagram',
    'twitter',
    'youtube',
    'tiktok',
    'linkedin',
    'github',
    'website',
    'other'
  ] as const),
  url: z.string()
    .min(1, 'L\'URL est requise')
    .max(500, 'L\'URL ne peut pas dépasser 500 caractères')
    .trim(),
  label: z.string()
    .max(50, 'Le label ne peut pas dépasser 50 caractères')
    .optional()
})

/**
 * Schéma de validation pour les champs de base d'un profil (universels)
 */
export const baseProfileSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  
  bio: z.string()
    .max(500, 'La bio ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  
  image_url: z.string()
    .url('L\'URL de l\'image est invalide')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email('L\'adresse email est invalide')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[\d\s\+\-\(\)]+$/, 'Le numéro de téléphone est invalide')
    .optional()
    .or(z.literal('')),
  
  custom_url: z.string()
    .min(3, 'L\'URL personnalisée doit contenir au moins 3 caractères')
    .max(50, 'L\'URL personnalisée ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'L\'URL ne peut contenir que des lettres minuscules, chiffres et tirets')
    .trim()
    .toLowerCase(),
  
  is_public: z.boolean()
    .default(true),
  
  company: z.string()
    .max(100, 'L\'entreprise ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
    
  job_title: z.string()
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  
  // Nouveau système de réseaux sociaux dynamique
  social_links: z.array(socialLinkSchema)
    .max(MAX_SOCIAL_LINKS, `Maximum ${MAX_SOCIAL_LINKS} liens sociaux autorisés`)
    .default([])
})

export type BaseProfileData = z.infer<typeof baseProfileSchema>
export type SocialLinkData = z.infer<typeof socialLinkSchema>

/**
 * Crée dynamiquement un schéma Zod basé sur les champs d'un template
 */
export function createDynamicTemplateSchema(fields: TemplateField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  
  fields.forEach(field => {
    let validator: z.ZodTypeAny
    
    switch (field.type) {
      case 'number':
        validator = z.number({
          required_error: field.errorMessage || `${field.label} est requis`,
          invalid_type_error: `${field.label} doit être un nombre`
        })
        .or(z.string().transform((val) => {
          const num = Number(val)
          if (isNaN(num)) throw new Error(`${field.label} doit être un nombre`)
          return num
        }))
        
        if (field.min !== undefined) {
          validator = (validator as z.ZodNumber).min(field.min, `${field.label} doit être supérieur ou égal à ${field.min}`)
        }
        if (field.max !== undefined) {
          validator = (validator as z.ZodNumber).max(field.max, `${field.label} doit être inférieur ou égal à ${field.max}`)
        }
        break
      
      case 'url':
        validator = z.string()
          .url(field.errorMessage || `${field.label} doit être une URL valide`)
        
        if (field.max) {
          validator = (validator as z.ZodString).max(field.max)
        }
        break
      
      case 'email':
        validator = z.string()
          .email(field.errorMessage || `${field.label} doit être une adresse email valide`)
        
        if (field.max) {
          validator = (validator as z.ZodString).max(field.max)
        }
        break
      
      case 'boolean':
        validator = z.boolean()
          .or(z.string().transform(val => val === 'true' || val === '1'))
        break
      
      case 'select':
        if (field.options && field.options.length > 0) {
          validator = z.enum(field.options as [string, ...string[]], {
            errorMap: () => ({ message: `${field.label} doit être l'une des options proposées` })
          })
        } else {
          validator = z.string()
        }
        break
      
      case 'textarea':
        validator = z.string()
        
        if (field.validation) {
          try {
            const regex = new RegExp(field.validation)
            validator = (validator as z.ZodString).regex(
              regex, 
              field.errorMessage || `${field.label} ne respecte pas le format attendu`
            )
          } catch (e) {
            console.warn(`Invalid regex for field ${field.name}:`, e)
          }
        }
        
        if (field.max) {
          validator = (validator as z.ZodString).max(
            field.max, 
            `${field.label} ne peut pas dépasser ${field.max} caractères`
          )
        }
        break
      
      case 'text':
      case 'social_account':
      default:
        validator = z.string()
        
        if (field.validation) {
          try {
            const regex = new RegExp(field.validation)
            validator = (validator as z.ZodString).regex(
              regex, 
              field.errorMessage || `${field.label} ne respecte pas le format attendu`
            )
          } catch (e) {
            console.warn(`Invalid regex for field ${field.name}:`, e)
          }
        }
        
        if (field.max) {
          validator = (validator as z.ZodString).max(
            field.max, 
            `${field.label} ne peut pas dépasser ${field.max} caractères`
          )
        }
        
        validator = (validator as z.ZodString).trim()
        break
    }
    
    // Rendre optionnel si non requis
    if (!field.required) {
      validator = validator.optional().or(z.literal(''))
    }
    
    shape[field.name] = validator
  })
  
  return z.object(shape)
}

/**
 * Schéma pour la création d'un profil avec template
 */
export const createProfileWithTemplateSchema = z.object({
  baseFields: baseProfileSchema,
  templateId: z.string().uuid('L\'ID du template est invalide'),
  templateFields: z.record(z.any()).optional()
})

export type CreateProfileWithTemplateData = z.infer<typeof createProfileWithTemplateSchema>

/**
 * Schéma pour la mise à jour d'un profil
 */
export const updateProfileWithTemplateSchema = z.object({
  baseFields: baseProfileSchema.partial().optional(),
  templateFields: z.record(z.any()).optional()
})

export type UpdateProfileWithTemplateData = z.infer<typeof updateProfileWithTemplateSchema>

/**
 * Validation d'un champ individuel
 */
export function validateField(
  field: TemplateField, 
  value: any
): { valid: boolean; error?: string; sanitizedValue?: any } {
  try {
    // Créer un schéma pour ce champ unique
    const fieldSchema = createDynamicTemplateSchema([field])
    const result = fieldSchema.safeParse({ [field.name]: value })
    
    if (result.success) {
      return {
        valid: true,
        sanitizedValue: result.data[field.name]
      }
    } else {
      const error = result.error.issues[0]?.message || 'Valeur invalide'
      return {
        valid: false,
        error
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur de validation'
    }
  }
}

/**
 * Validation de tous les champs de template
 */
export function validateTemplateFields(
  fields: TemplateField[],
  data: Record<string, any>
): { valid: boolean; errors?: Record<string, string>; sanitizedData?: Record<string, any> } {
  try {
    const schema = createDynamicTemplateSchema(fields)
    const result = schema.safeParse(data)
    
    if (result.success) {
      return {
        valid: true,
        sanitizedData: result.data
      }
    } else {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string
        errors[fieldName] = issue.message
      })
      
      return {
        valid: false,
        errors
      }
    }
  } catch (error) {
    return {
      valid: false,
      errors: { _global: 'Erreur de validation générale' }
    }
  }
}

/**
 * Sanitize les champs de base avant sauvegarde
 */
export function sanitizeBaseFields(data: any): Partial<BaseProfileData> {
  try {
    const result = baseProfileSchema.partial().safeParse(data)
    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

/**
 * Helper pour nettoyer les valeurs vides
 */
export function removeEmptyFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key as keyof T] = value
    }
  }
  
  return cleaned
}

/**
 * Validation d'URL personnalisée (custom_url)
 * Vérifie que l'URL n'est pas réservée
 */
const RESERVED_URLS = [
  'admin', 'api', 'auth', 'dashboard', 'login', 'logout', 'signup',
  'profile', 'profiles', 'user', 'users', 'settings', 'account',
  'help', 'support', 'contact', 'about', 'terms', 'privacy',
  'blog', 'docs', 'documentation', 'test', 'demo'
]

export function isReservedUrl(url: string): boolean {
  return RESERVED_URLS.includes(url.toLowerCase())
}

export function validateCustomUrl(url: string): { valid: boolean; error?: string } {
  // Longueur
  if (url.length < 3) {
    return { valid: false, error: 'L\'URL doit contenir au moins 3 caractères' }
  }
  
  if (url.length > 50) {
    return { valid: false, error: 'L\'URL ne peut pas dépasser 50 caractères' }
  }
  
  // Format
  if (!/^[a-z0-9-]+$/.test(url)) {
    return { 
      valid: false, 
      error: 'L\'URL ne peut contenir que des lettres minuscules, chiffres et tirets' 
    }
  }
  
  // Ne pas commencer ou finir par un tiret
  if (url.startsWith('-') || url.endsWith('-')) {
    return { valid: false, error: 'L\'URL ne peut pas commencer ou finir par un tiret' }
  }
  
  // URLs réservées
  if (isReservedUrl(url)) {
    return { valid: false, error: 'Cette URL est réservée et ne peut pas être utilisée' }
  }
  
  return { valid: true }
}
