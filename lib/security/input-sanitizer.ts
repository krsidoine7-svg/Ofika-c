/**
 * Service de sanitisation des entrées utilisateur
 * Protection contre XSS, injection SQL, et autres attaques
 */

export class InputSanitizer {
  /**
   * Sanitise une chaîne de caractères pour éviter les attaques XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''
    
    // Supprimer les caractères dangereux et les balises HTML
    return input
      .replace(/[<>'"&]/g, '') // Supprimer les caractères HTML dangereux
      .replace(/javascript:/gi, '') // Supprimer les URLs javascript
      .replace(/data:/gi, '') // Supprimer les URLs data
      .replace(/on\w+\s*=/gi, '') // Supprimer les event handlers (onclick, onerror, etc.)
      .trim()
  }

  /**
   * Valide et sanitise un email
   */
  static sanitizeEmail(email: string): string {
    const cleaned = this.sanitizeString(email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(cleaned)) {
      throw new Error('Format email invalide')
    }
    
    return cleaned.toLowerCase()
  }

  /**
   * Valide et sanitise un numéro de téléphone
   */
  static sanitizePhone(phone: string): string {
    const cleaned = this.sanitizeString(phone)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/
    
    if (!phoneRegex.test(cleaned)) {
      throw new Error('Format téléphone invalide')
    }
    
    return cleaned.replace(/\s/g, '')
  }

  /**
   * Valide et sanitise une URL
   */
  static sanitizeUrl(url: string): string {
    const cleaned = this.sanitizeString(url)
    
    try {
      const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`)
      
      // Vérifier que c'est HTTPS ou HTTP valide
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Protocole non autorisé')
      }
      
      return urlObj.toString()
    } catch {
      throw new Error('URL invalide')
    }
  }

  /**
   * Sanitise un objet JSON
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj)
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.sanitizeString(key)
        sanitized[cleanKey] = this.sanitizeObject(value)
      }
      return sanitized
    }
    
    return obj
  }

  /**
   * Valide la longueur d'une chaîne
   */
  static validateLength(input: string, min: number = 0, max: number = 1000): string {
    const cleaned = this.sanitizeString(input)
    
    if (cleaned.length < min) {
      throw new Error(`Minimum ${min} caractères requis`)
    }
    
    if (cleaned.length > max) {
      throw new Error(`Maximum ${max} caractères autorisés`)
    }
    
    return cleaned
  }

  /**
   * Génère un nom de fichier sécurisé
   */
  static generateSecureFileName(originalName: string): string {
    const cleaned = this.sanitizeString(originalName)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    
    // Garder seulement les caractères alphanumériques, points et tirets
    const safeName = cleaned.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    return `${safeName}_${timestamp}_${random}`
  }
}

// Export des fonctions pour compatibilité
export const generateSecureFileName = InputSanitizer.generateSecureFileName
export const sanitizeString = InputSanitizer.sanitizeString
export const sanitizeEmail = InputSanitizer.sanitizeEmail
export const sanitizePhone = InputSanitizer.sanitizePhone
export const sanitizeUrl = InputSanitizer.sanitizeUrl
export const sanitizeObject = InputSanitizer.sanitizeObject
export const validateLength = InputSanitizer.validateLength

// Fonctions spécialisées pour les usernames et URLs personnalisées
export const sanitizeUsername = (username: string): string => {
  return InputSanitizer.sanitizeString(username)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 30)
}

export const sanitizeCustomUrl = (url: string): string => {
  return InputSanitizer.sanitizeString(url)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50)
}

// Fonctions spécialisées supplémentaires
export const sanitizeName = (name: string): string => {
  return InputSanitizer.sanitizeString(name)
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .trim()
    .substring(0, 100)
}

export const sanitizeBio = (bio: string): string => {
  return InputSanitizer.sanitizeString(bio)
    .substring(0, 500)
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Fichier trop volumineux (max 5MB)' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Type de fichier non autorisé' }
  }
  
  return { isValid: true }
}