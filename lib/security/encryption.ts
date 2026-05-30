import crypto from 'crypto'

/**
 * Service de chiffrement des données sensibles
 * Protection des données au repos et en transit
 */

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits

/**
 * Génère une clé de chiffrement sécurisée
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * Dérive une clé à partir d'un mot de passe
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512')
}

/**
 * Chiffre des données sensibles
 */
export function encryptSensitiveData(data: string, key?: string): {
  encrypted: string
  iv: string
  tag: string
  salt?: string
} {
  try {
    const encryptionKey = key ? Buffer.from(key, 'hex') : Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex')
    
    if (encryptionKey.length !== KEY_LENGTH) {
      throw new Error('Clé de chiffrement invalide')
    }
    
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = (cipher as any).getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  } catch (error) {
    throw new Error(`Erreur de chiffrement: ${error}`)
  }
}

/**
 * Déchiffre des données sensibles
 */
export function decryptSensitiveData(
  encryptedData: string,
  iv: string,
  tag: string,
  key?: string
): string {
  try {
    const encryptionKey = key ? Buffer.from(key, 'hex') : Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex')
    
    if (encryptionKey.length !== KEY_LENGTH) {
      throw new Error('Clé de chiffrement invalide')
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv)
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error(`Erreur de déchiffrement: ${error}`)
  }
}

/**
 * Chiffre un objet JSON
 */
export function encryptObject(obj: any, key?: string): string {
  const jsonString = JSON.stringify(obj)
  const encrypted = encryptSensitiveData(jsonString, key)
  return JSON.stringify(encrypted)
}

/**
 * Déchiffre un objet JSON
 */
export function decryptObject(encryptedString: string, key?: string): any {
  const encryptedData = JSON.parse(encryptedString)
  const decrypted = decryptSensitiveData(
    encryptedData.encrypted,
    encryptedData.iv,
    encryptedData.tag,
    key
  )
  return JSON.parse(decrypted)
}

/**
 * Hache un mot de passe avec salt
 */
export function hashPassword(password: string): {
  hash: string
  salt: string
} {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  
  return { hash, salt }
}

/**
 * Vérifie un mot de passe
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === hashToVerify
}

/**
 * Génère un token sécurisé
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Génère un nonce pour CSRF
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

/**
 * Vérifie un nonce CSRF
 */
export function verifyNonce(nonce: string, storedNonce: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(nonce), Buffer.from(storedNonce))
}

/**
 * Chiffre les données de profil sensibles
 */
export function encryptProfileData(profileData: {
  phone?: string
  email?: string
  [key: string]: any
}): {
  encrypted: any
  sensitiveFields: string[]
} {
  const sensitiveFields = ['phone', 'email']
  const encrypted = { ...profileData }
  
  sensitiveFields.forEach(field => {
    if (profileData[field]) {
      const encryptedField = encryptSensitiveData(profileData[field])
      encrypted[field] = JSON.stringify(encryptedField)
    }
  })
  
  return { encrypted, sensitiveFields }
}

/**
 * Déchiffre les données de profil sensibles
 */
export function decryptProfileData(encryptedProfile: any): any {
  const decrypted = { ...encryptedProfile }
  const sensitiveFields = ['phone', 'email']
  
  sensitiveFields.forEach(field => {
    if (encryptedProfile[field] && typeof encryptedProfile[field] === 'string') {
      try {
        const encryptedData = JSON.parse(encryptedProfile[field])
        decrypted[field] = decryptSensitiveData(
          encryptedData.encrypted,
          encryptedData.iv,
          encryptedData.tag
        )
      } catch (error) {
        console.error(`Erreur de déchiffrement du champ ${field}:`, error)
        decrypted[field] = encryptedProfile[field] // Garde la valeur chiffrée en cas d'erreur
      }
    }
  })
  
  return decrypted
}

/**
 * Valide la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Longueur minimale
  if (password.length >= 6) score += 1
  else feedback.push('Au moins 6 caractères')
  
  return {
    isStrong: score >= 1,
    score: Math.min(score, 1),
    feedback
  }
}

/**
 * Génère une clé API sécurisée
 */
export function generateApiKey(): string {
  const prefix = 'ofika_'
  const randomPart = crypto.randomBytes(32).toString('base64url')
  return `${prefix}${randomPart}`
}

/**
 * Valide une clé API
 */
export function validateApiKey(apiKey: string): boolean {
  const pattern = /^ofika_[A-Za-z0-9_-]{43}$/
  return pattern.test(apiKey)
}
