import { z } from 'zod'

/**
 * Service de validation et sanitisation des entrées utilisateur
 * Protection contre les injections XSS, SQL et autres attaques
 */

// Schémas de validation stricts
export const securitySchemas = {
  // Validation des URLs
  url: z.string()
    .url('URL invalide')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    }, 'Protocole non autorisé')
    .refine((url) => {
      // Blacklist des domaines suspects
      const suspiciousDomains = [
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '169.254.169.254', // AWS/GCP Metadata
        'metadata.google.internal',
        'file://',
        'javascript:',
        'data:',
        'vbscript:',
        '.internal',
        '.local',
        'internal.'
      ]
      if (process.env.NODE_ENV !== 'development') {
        suspiciousDomains.push('localhost')
      }
      return !suspiciousDomains.some(domain => url.includes(domain))
    }, 'Domaine non autorisé'),

  // Validation des noms (protection contre l'injection)
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-'\.@_]+$/, 'Caractères non autorisés dans le nom'),

  // Validation des emails
  email: z.string()
    .email('Email invalide')
    .max(254, 'Email trop long')
    .toLowerCase()
    .refine((email) => {
      // Vérification supplémentaire contre les emails malformés
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailRegex.test(email)
    }, 'Format d\'email invalide'),

  // Validation des téléphones
  phone: z.string()
    .regex(/^\+?[0-9\s\-()]{4,20}$/, 'Format de téléphone invalide')
    .optional()
    .or(z.literal('')),

  // Validation des URLs personnalisées
  customUrl: z.string()
    .min(3, 'URL personnalisée trop courte')
    .max(50, 'URL personnalisée trop longue')
    .regex(/^[a-z0-9-]+$/, 'Seuls les lettres minuscules, chiffres et tirets sont autorisés')
    .refine((url) => {
      // Blacklist des mots réservés
      const reservedWords = [
        'admin', 'api', 'app', 'www', 'mail', 'ftp', 'blog', 'shop',
        'support', 'help', 'login', 'register', 'dashboard', 'profile'
      ]
      return !reservedWords.includes(url.toLowerCase())
    }, 'URL personnalisée réservée'),

  // Validation des usernames
  username: z.string()
    .min(3, 'Nom d\'utilisateur trop court')
    .max(30, 'Nom d\'utilisateur trop long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, tirets et underscores sont autorisés')
    .refine((username) => {
      const reservedWords = ['admin', 'root', 'api', 'www', 'mail', 'support']
      return !reservedWords.includes(username.toLowerCase())
    }, 'Nom d\'utilisateur réservé'),

  // Validation des bios (protection XSS)
  bio: z.string()
    .max(500, 'La bio ne peut pas dépasser 500 caractères')
    .optional()
    .transform((val) => val ? sanitizeHtml(val) : val),

  // Validation des mots de passe
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
}

/**
 * Sanitise le HTML pour éviter les attaques XSS
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  
  // Remove all HTML tags except allowed ones, and strip all attributes
  const allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p']
  
  // First, remove all dangerous content
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Then strip all tags except allowed ones
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const lowerTag = tag.toLowerCase()
    if (allowedTags.includes(lowerTag)) {
      return match.includes('/') ? `</${lowerTag}>` : `<${lowerTag}>`
    }
    return ''
  })
  
  return sanitized.trim()
}

/**
 * Sanitise les entrées texte simples
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Supprime < et >
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .trim()
}

/**
 * Valide et sanitise une URL
 */
export function validateAndSanitizeUrl(url: string): { isValid: boolean; sanitizedUrl?: string; error?: string } {
  try {
    const result = securitySchemas.url.safeParse(url)
    
    if (!result.success) {
      return {
        isValid: false,
        error: result.error.errors[0]?.message || 'URL invalide'
      }
    }
    
    return {
      isValid: true,
      sanitizedUrl: result.data
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Erreur de validation URL'
    }
  }
}

/**
 * Valide les données de profil avec sanitisation
 */
export function validateProfileData(data: any) {
  const schema = z.object({
    name: securitySchemas.name,
    bio: securitySchemas.bio,
    custom_url: securitySchemas.customUrl.optional(),
    username: securitySchemas.username.optional(),
    phone: securitySchemas.phone,
    email: securitySchemas.email.optional(),
    // Réseaux sociaux
    whatsapp: securitySchemas.url.optional().or(z.literal('')),
    facebook: securitySchemas.url.optional().or(z.literal('')),
    instagram: securitySchemas.url.optional().or(z.literal('')),
    twitter: securitySchemas.url.optional().or(z.literal('')),
    website: securitySchemas.url.optional().or(z.literal(''))
  })
  
  return schema.safeParse(data)
}

/**
 * Valide les données de lien
 */
export function validateLinkData(data: any) {
  const schema = z.object({
    title: z.string()
      .min(1, 'Le titre est requis')
      .max(100, 'Le titre ne peut pas dépasser 100 caractères')
      .transform(sanitizeText),
    url: securitySchemas.url,
    position: z.number().int().min(1).max(10)
  })
  
  return schema.safeParse(data)
}

/**
 * Détecte les tentatives d'injection SQL
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(UNION\s+SELECT)/i,
    /(DROP\s+TABLE)/i,
    /(INSERT\s+INTO)/i,
    /(UPDATE\s+SET)/i,
    /(DELETE\s+FROM)/i,
    /(ALTER\s+TABLE)/i,
    /(CREATE\s+TABLE)/i,
    /(EXEC\s*\()/i,
    /(SCRIPT\s*\()/i,
    /(WAITFOR\s+DELAY)/i,
    /(BENCHMARK\s*\()/i,
    /(SLEEP\s*\()/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Détecte les tentatives d'injection XSS
 */
export function detectXssInjection(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    /onselect\s*=/gi,
    /onkeydown\s*=/gi,
    /onkeyup\s*=/gi,
    /onkeypress\s*=/gi,
    /onmousedown\s*=/gi,
    /onmouseup\s*=/gi,
    /onmousemove\s*=/gi,
    /onmouseout\s*=/gi,
    /onmouseover\s*=/gi,
    /onmouseenter\s*=/gi,
    /onmouseleave\s*=/gi,
    /oncontextmenu\s*=/gi,
    /ondblclick\s*=/gi,
    /onabort\s*=/gi,
    /onbeforeunload\s*=/gi,
    /onerror\s*=/gi,
    /onhashchange\s*=/gi,
    /onload\s*=/gi,
    /onmessage\s*=/gi,
    /onoffline\s*=/gi,
    /ononline\s*=/gi,
    /onpagehide\s*=/gi,
    /onpageshow\s*=/gi,
    /onpopstate\s*=/gi,
    /onresize\s*=/gi,
    /onstorage\s*=/gi,
    /onunload\s*=/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Valide les données avec détection d'injection
 */
export function validateInputWithSecurityCheck(input: string, type: 'text' | 'url' | 'html' = 'text') {
  // Détection d'injection
  if (detectSqlInjection(input)) {
    return { isValid: false, error: 'Tentative d\'injection SQL détectée' }
  }
  
  if (detectXssInjection(input)) {
    return { isValid: false, error: 'Tentative d\'injection XSS détectée' }
  }
  
  // Sanitisation selon le type
  let sanitized = input
  switch (type) {
    case 'html':
      sanitized = sanitizeHtml(input)
      break
    case 'url':
      const urlValidation = validateAndSanitizeUrl(input)
      if (!urlValidation.isValid) {
        return { isValid: false, error: urlValidation.error }
      }
      sanitized = urlValidation.sanitizedUrl!
      break
    default:
      sanitized = sanitizeText(input)
  }
  
  return { isValid: true, sanitized }
}
