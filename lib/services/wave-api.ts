/**
 * SERVICE WAVE MERCHANT - VERSION DIRECTE (MERCHANT LINK)
 * 
 * Ce service génère des liens de paiement Wave Direct sans nécessiter 
 * de checkout via API (utilisant le format lien marchand Wave CI).
 */

const WAVE_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_WAVE_BASE_URL || 'https://pay.wave.com/m',
  merchantId: process.env.NEXT_PUBLIC_WAVE_MERCHANT_ID || 'M_ci_8aqIEVzY9rYq',
  countryCode: process.env.NEXT_PUBLIC_WAVE_COUNTRY_CODE || 'ci',
  defaultAmount: parseInt(process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT || '14600', 10),
}

export interface WavePaymentParams {
  amount: number
  orderId?: string
  merchantId?: string
  countryCode?: string
}

/**
 * Génère un lien de paiement Wave Direct Merchant
 * Format: https://pay.wave.com/m/[MERCHANT_ID]/c/[COUNTRY_CODE]?a=[AMOUNT]
 */
export function generateWavePaymentUrl(params: WavePaymentParams): string {
  const merchantId = params.merchantId || WAVE_CONFIG.merchantId
  const countryCode = (params.countryCode || WAVE_CONFIG.countryCode).toLowerCase()
  const amount = params.amount || WAVE_CONFIG.defaultAmount

  // Nettoyer les paramètres
  const cleanMerchantId = merchantId.trim()
  const cleanCountryCode = countryCode.trim()

  return `${WAVE_CONFIG.baseUrl}/${cleanMerchantId}/c/${cleanCountryCode}?a=${amount}`
}

export const WaveApiConfig = {
  ...WAVE_CONFIG,
  isValid: () => !!WAVE_CONFIG.merchantId && !!WAVE_CONFIG.countryCode
}
