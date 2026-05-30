// =====================================================
// MODULE SÉCURITÉ : SCHÉMAS DE VALIDATION SÉCURISÉS
// =====================================================

import { z } from 'zod'
import { 
  sanitizeString, 
  sanitizeUrl, 
  sanitizeUsername, 
  sanitizeCustomUrl, 
  sanitizePhone, 
  sanitizeEmail, 
  sanitizeName, 
  sanitizeBio,
  validateFile
} from './input-sanitizer'

// Schéma de validation sécurisé pour les données NFC
export const secureNFCCardSchema = z.object({
  fullName: z.string()
    .min(2, 'Nom requis (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)')
    .transform(sanitizeName),
  
  company: z.string()
    .min(2, 'Entreprise requise')
    .max(100, 'Nom d\'entreprise trop long (max 100 caractères)')
    .transform(sanitizeName),
  
  jobTitle: z.string()
    .min(2, 'Poste requis')
    .max(100, 'Titre trop long (max 100 caractères)')
    .transform(sanitizeName),
  
  bio: z.string()
    .max(500, 'Bio trop longue (max 500 caractères)')
    .optional()
    .transform((val) => val ? sanitizeBio(val) : ''),
  
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Format téléphone invalide')
    .min(8, 'Numéro de téléphone trop court')
    .max(20, 'Numéro de téléphone trop long')
    .transform(sanitizePhone),
  
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long')
    .transform(sanitizeEmail),
  
  instagram: z.string()
    .url('URL Instagram invalide')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeUrl(val) || '' : ''),
  
  tiktok: z.string()
    .url('URL TikTok invalide')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeUrl(val) || '' : ''),
  
  linkedin: z.string()
    .url('URL LinkedIn invalide')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeUrl(val) || '' : ''),
  
  otherLinks: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeUrl(val) || '' : ''),
  
  location: z.string()
    .max(100, 'Localisation trop longue (max 100 caractères)')
    .optional()
    .transform((val) => val ? sanitizeString(val) : ''),
  
  profileName: z.string()
    .min(2, 'Nom du profil requis')
    .max(50, 'Nom du profil trop long (max 50 caractères)')
    .transform(sanitizeName),
  
  username: z.string()
    .min(3, 'Username min 3 caractères')
    .max(30, 'Username trop long (max 30 caractères)')
    .regex(/^[a-z0-9_-]+$/, 'Username ne peut contenir que des lettres minuscules, chiffres, _ et -')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeUsername(val) : ''),
  
  customUrl: z.string()
    .min(3, 'URL min 3 caractères')
    .max(50, 'URL trop longue (max 50 caractères)')
    .regex(/^[a-z0-9-]+$/, 'URL ne peut contenir que des lettres minuscules, chiffres et -')
    .optional()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeCustomUrl(val) : ''),
  
  logoFile: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true
      const validation = validateFile(file)
      return validation.isValid
    }, 'Fichier invalide'),
  
  logoUrl: z.string()
    .url('URL du logo invalide')
    .optional()
    .or(z.literal(''))
})

// Schéma de validation pour les designs
export const secureDesignSchema = z.object({
  id: z.string().min(1, 'ID du design requis'),
  name: z.string().min(1, 'Nom du design requis'),
  description: z.string().optional(),
  preview: z.string().url().optional(),
  layout: z.object({
    logoPosition: z.enum(['top-left', 'top-center', 'top-right']),
    textAlignment: z.enum(['left', 'center', 'right']),
    qrPosition: z.enum(['bottom-right', 'bottom-center', 'bottom-left']),
    cardStyle: z.enum(['minimal', 'gradient', 'clean', 'branded'])
  })
})

// Schéma de validation pour les couleurs
export const secureColorSchema = z.object({
  id: z.string().min(1, 'ID de couleur requis'),
  name: z.string().min(1, 'Nom de couleur requis'),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur primaire invalide'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur secondaire invalide'),
  textColor: z.enum(['white', 'black']),
  gradient: z.string().optional()
})

// Schéma de validation pour les URLs de prévisualisation
export const securePreviewUrlSchema = z.string()
  .min(1, 'URL de prévisualisation requise')
  .max(100, 'URL trop longue')
  .regex(/^[a-zA-Z0-9-_/]+$/, 'URL de prévisualisation invalide')

// Schéma de validation pour les requêtes API
export const secureApiRequestSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  action: z.enum(['create', 'update', 'delete', 'view']),
  data: z.record(z.any()).optional()
})

// Fonction de validation complète avec sanitisation
export function validateAndSanitizeNFCCardData(data: any) {
  try {
    const sanitized = secureNFCCardSchema.parse(data)
    
    // Vérifications supplémentaires
    if (sanitized.customUrl && sanitized.username) {
      // S'assurer que l'URL personnalisée et l'username sont différents
      if (sanitized.customUrl === sanitized.username) {
        throw new Error('L\'URL personnalisée et l\'username doivent être différents')
      }
    }
    
    // Vérifier que l'email n'est pas dans une liste de domaines interdits
    const forbiddenDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
    const emailDomain = sanitized.email.split('@')[1]?.toLowerCase()
    if (emailDomain && forbiddenDomains.includes(emailDomain)) {
      throw new Error('Adresse email temporaire non autorisée')
    }
    
    return {
      isValid: true,
      data: sanitized,
      errors: []
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    
    return {
      isValid: false,
      data: null,
      errors: [{ 
        field: 'general', 
        message: error instanceof Error ? error.message : 'Erreur de validation inconnue' 
      }]
    }
  }
}

// Fonction de validation pour les fichiers
export function validateNFCCardFile(file: File) {
  const validation = validateFile(file)
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error
    }
  }
  
  // Vérifications supplémentaires
  if (file.name.length > 100) {
    return {
      isValid: false,
      error: 'Nom de fichier trop long'
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}
