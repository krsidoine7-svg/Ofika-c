// =====================================================
// SERVICE LYGOS API - VERSION SÉCURISÉE ET ROBUSTE
// =====================================================
// Service pour interagir avec l'API LyGOS
// Documentation: https://docs.lygosapp.com/api-reference/gateway/create-payment-gateway

import crypto from 'crypto'
import { validateOrderAmount, validateQuantity } from '@/lib/types/payments'

// =====================================================
// CONFIGURATION SÉCURISÉE
// =====================================================

// Fonction helper pour obtenir les URLs avec fallback sécurisé
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 
         (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci')
}

const LYGOS_CONFIG = {
  apiKey: process.env.LYGOS_API_KEY || '',
  webhookSecret: process.env.LYGOS_WEBHOOK_SECRET || '',
  baseUrl: process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com',
  shopName: process.env.LYGOS_SHOP_NAME || 'Ofika',
  // ✅ Valeurs par défaut sûres
  successUrl: process.env.LYGOS_SUCCESS_URL || `${getAppUrl()}/payment/success`,
  failureUrl: process.env.LYGOS_FAILURE_URL || `${getAppUrl()}/payment/cancelled`,
  
  // Configuration de sécurité
  timeout: 30000, // 30 secondes
  maxRetries: 3,
  retryDelay: 1000, // 1 seconde
}

// =====================================================
// VALIDATION DE CONFIGURATION
// =====================================================

/**
 * Validation sécurisée de la configuration LyGOS
 */
export function validateLygosConfig(): { valid: boolean; error?: string; missing?: string[] } {
  const missing: string[] = []

  if (!LYGOS_CONFIG.apiKey) missing.push('LYGOS_API_KEY')
  if (!LYGOS_CONFIG.webhookSecret) missing.push('LYGOS_WEBHOOK_SECRET')
  if (!LYGOS_CONFIG.baseUrl) missing.push('LYGOS_BASE_URL')

  // Validation du format des URLs (seulement celles qui sont définies)
  try {
    new URL(LYGOS_CONFIG.baseUrl)
    
    // Valider les URLs de redirection seulement si elles sont définies
    if (LYGOS_CONFIG.successUrl) {
      new URL(LYGOS_CONFIG.successUrl)
    }
    if (LYGOS_CONFIG.failureUrl) {
      new URL(LYGOS_CONFIG.failureUrl)
    }
  } catch (error) {
    return { valid: false, error: `URLs LyGOS invalides: ${error instanceof Error ? error.message : 'Format invalide'}` }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Variables d'environnement manquantes: ${missing.join(', ')}`,
      missing
    }
  }

  return { valid: true }
}

// =====================================================
// UTILITAIRES SÉCURISÉS
// =====================================================

/**
 * Validation sécurisée des données de paiement
 */
function validatePaymentData(data: {
  amount: number
  order_id: string
  message?: string
  success_url?: string
  failure_url?: string
}): { valid: boolean; error?: string } {
  // Validation du montant
  if (!validateOrderAmount(data.amount)) {
    return { valid: false, error: `Montant invalide: ${data.amount}` }
  }

  // Validation de l'order_id
  if (!data.order_id || typeof data.order_id !== 'string' || data.order_id.length === 0) {
    return { valid: false, error: 'ID de commande requis' }
  }

  // Validation des URLs si fournies
  if (data.success_url) {
    try {
      new URL(data.success_url)
    } catch {
      return { valid: false, error: 'URL de succès invalide' }
    }
  }

  if (data.failure_url) {
    try {
      new URL(data.failure_url)
    } catch {
      return { valid: false, error: 'URL d\'échec invalide' }
    }
  }

  return { valid: true }
}

/**
 * Retry logic sécurisé pour les appels réseau
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = LYGOS_CONFIG.maxRetries,
  baseDelay: number = LYGOS_CONFIG.retryDelay
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Ne pas retry pour les erreurs 4xx (erreurs client)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// =====================================================
// TYPES LYGOS (selon documentation officielle)
// =====================================================

export interface LygosCreatePaymentRequest {
  amount: number
  shop_name: string
  message?: string
  success_url?: string
  failure_url?: string
  order_id: string
}

export interface LygosPaymentResponse {
  id: string
  amount: number
  currency: string
  shop_name: string
  message: string | null
  user_id: string
  creation_date: string
  link: string
  order_id: string | null
  success_url: string | null
  failure_url: string | null
}

export interface LygosPaymentStatus {
  id: string
  amount: number
  currency: string
  shop_name: string
  message: string
  user_country: {
    name: string
    iso_code: string
  }
  creation_date: string
  link: string
  order_id: string | null
  success_url: string
  failure_url: string
}

export interface LygosWebhookPayload {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'failed' | 'cancelled'
  order_id?: string
  timestamp: string
  signature?: string
}

// =====================================================
// VALIDATION CONFIGURATION - FONCTION UNIQUE
// =====================================================

// ✅ REMOVED: Fonction dupliquée - utilise celle définie plus haut dans le fichier

// =====================================================
// CRÉATION DE PAIEMENT LYGOS
// =====================================================

/**
 * Crée un paiement via l'API LyGOS avec retry et validation
 * Documentation: https://docs.lygosapp.com/api-reference/gateway/create-payment-gateway
 *
 * @param paymentData - Données du paiement validées
 * @returns Réponse contenant l'ID et le lien de paiement
 */
export async function createLygosPayment(
  paymentData: {
    amount: number
    order_id: string
    message?: string
    success_url?: string
    failure_url?: string
  }
): Promise<{ success: boolean; data?: LygosPaymentResponse; error?: string }> {
  const startTime = Date.now()

  try {
    // 1. Validation de la configuration
    const configValidation = validateLygosConfig()
    if (!configValidation.valid) {
      console.error('❌ Configuration LyGOS invalide:', configValidation.error)
      return { success: false, error: configValidation.error }
    }

    // 2. Validation des données de paiement
    const dataValidation = validatePaymentData(paymentData)
    if (!dataValidation.valid) {
      console.error('❌ Données de paiement invalides:', dataValidation.error)
      return { success: false, error: dataValidation.error }
    }

    // 3. Préparation de la requête avec sanitisation
    const requestBody: LygosCreatePaymentRequest = {
      amount: Math.round(paymentData.amount * 100) / 100, // Éviter les problèmes de précision
      shop_name: LYGOS_CONFIG.shopName,
      message: (paymentData.message || '').substring(0, 255), // Limiter la longueur
      success_url: paymentData.success_url || LYGOS_CONFIG.successUrl,
      failure_url: paymentData.failure_url || LYGOS_CONFIG.failureUrl,
      order_id: paymentData.order_id.trim() // Nettoyer les espaces
    }

    console.log('🚀 Création paiement LyGOS:', {
      amount: requestBody.amount,
      order_id: requestBody.order_id.substring(0, 10) + '...', // Masquer partiellement
      shop_name: requestBody.shop_name,
      processing_time_start: new Date().toISOString()
    })

    // 4. Appel API avec retry et timeout
    const result = await retryWithBackoff(async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), LYGOS_CONFIG.timeout)

      try {
        const apiUrl = `${LYGOS_CONFIG.baseUrl}/v1/gateway`
        
        // Log détaillé pour déboguer
        console.log('📡 Appel API LyGOS:', {
          url: apiUrl,
          method: 'POST',
          baseUrl: LYGOS_CONFIG.baseUrl,
          hasApiKey: !!LYGOS_CONFIG.apiKey,
          apiKeyLength: LYGOS_CONFIG.apiKey?.length,
          requestBody: {
            amount: requestBody.amount,
            shop_name: requestBody.shop_name,
            order_id: requestBody.order_id
          }
        })

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': LYGOS_CONFIG.apiKey,
            'User-Agent': 'Ofika-App/1.0'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorData: any = {}
          try {
            errorData = await response.json()
          } catch {
            const text = await response.text()
            errorData = { detail: { message: text || response.statusText } }
          }

          const errorMessage = errorData.detail?.message ||
                              errorData.message ||
                              `Erreur HTTP ${response.status}`

          // Créer une erreur avec le statut pour le retry logic
          const error = new Error(errorMessage) as any
          error.status = response.status
          error.response = response
          throw error
        }

        const data: LygosPaymentResponse = await response.json()

        // Validation de la réponse
        if (!data.id || !data.link) {
          throw new Error('Réponse LyGOS invalide: ID ou lien manquant')
        }

        return data

      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          throw error // Re-throw avec le statut
        }
        throw new Error(`Erreur réseau: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    })

    // 5. Logging sécurisé du succès
    console.log('✅ Paiement LyGOS créé:', {
      payment_id: result.id.substring(0, 8) + '...', // Masquer partiellement
      has_payment_url: !!result.link,
      amount: result.amount,
      currency: result.currency,
      processing_time_ms: Date.now() - startTime
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    // Logging détaillé des erreurs
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorDetails = {
      error: errorMessage,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      ...(error instanceof Error && 'status' in error && { status: (error as any).status })
    }

    console.error('❌ Erreur création paiement LyGOS:', errorDetails)

    return {
      success: false,
      error: `Erreur LyGOS: ${errorMessage}`
    }
  }
}

// =====================================================
// VÉRIFICATION STATUT PAIEMENT
// =====================================================

/**
 * Vérifie le statut d'un paiement LyGOS
 * Documentation: https://docs.lygosapp.com/api-reference/gateway/get-gateway
 * 
 * @param gatewayId - ID du gateway/paiement LyGOS
 * @returns Statut du paiement
 */
export async function getLygosPaymentStatus(
  gatewayId: string
): Promise<{ success: boolean; data?: LygosPaymentStatus; error?: string }> {
  try {
    // Valider la configuration
    const configValidation = validateLygosConfig()
    if (!configValidation.valid) {
      return { success: false, error: configValidation.error }
    }

    if (!gatewayId) {
      return { success: false, error: 'gateway_id est requis' }
    }

    console.log('🔍 Vérification statut paiement LyGOS:', gatewayId)

    // Appel API LyGOS GET /v1/gateway/{gateway_id}
    const response = await fetch(`${LYGOS_CONFIG.baseUrl}/v1/gateway/${gatewayId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': LYGOS_CONFIG.apiKey
      }
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        const text = await response.text()
        errorData = { detail: { message: text } }
      }
      const errorMessage = errorData.detail?.message || errorData.message || `Erreur ${response.status}`
      
      console.error('❌ Erreur vérification statut LyGOS:', {
        status: response.status,
        error: errorMessage
      })
      
      return {
        success: false,
        error: `Erreur API LyGOS: ${response.status} - ${errorMessage}`
      }
    }

    const data: LygosPaymentStatus = await response.json()

    console.log('✅ Statut paiement LyGOS:', {
      payment_id: data.id,
      amount: data.amount,
      currency: data.currency
    })

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut LyGOS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la vérification du statut'
    }
  }
}

// =====================================================
// VÉRIFICATION SIGNATURE WEBHOOK
// =====================================================

/**
 * Vérifie la signature HMAC d'un webhook LyGOS
 * 
 * @param payload - Corps du webhook (string ou object)
 * @param signature - Signature reçue dans le header
 * @returns true si la signature est valide
 */
export function verifyLygosWebhookSignature(
  payload: string | object,
  signature: string
): boolean {
  try {
    if (!LYGOS_CONFIG.webhookSecret) {
      console.warn('⚠️ LYGOS_WEBHOOK_SECRET non configuré, signature non vérifiée')
      return false // En production, toujours vérifier
    }

    if (!signature) {
      console.error('❌ Signature manquante dans le webhook')
      return false
    }

    // Convertir le payload en string si nécessaire
    const payloadString = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload)

    // Calculer le HMAC SHA256
    const hmac = crypto.createHmac('sha256', LYGOS_CONFIG.webhookSecret)
    hmac.update(payloadString)
    const calculatedSignature = hmac.digest('hex')

    // Comparer les signatures (comparaison sécurisée)
    const signatureBuffer = Buffer.from(signature)
    const calculatedBuffer = Buffer.from(calculatedSignature)
    
    if (signatureBuffer.length !== calculatedBuffer.length) {
      console.error('❌ Signature webhook invalide (longueur incorrecte)')
      return false
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, calculatedBuffer)

    if (!isValid) {
      console.error('❌ Signature webhook invalide:', {
        received: signature.substring(0, 10) + '...',
        calculated: calculatedSignature.substring(0, 10) + '...'
      })
    }

    return isValid
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la signature:', error)
    return false
  }
}

// =====================================================
// EXPORT CONFIGURATION
// =====================================================

export const LygosApiConfig = {
  ...LYGOS_CONFIG,
  isConfigured: () => validateLygosConfig().valid,
  getBaseUrl: () => LYGOS_CONFIG.baseUrl
}
