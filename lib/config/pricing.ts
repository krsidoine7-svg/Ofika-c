/**
 * Configuration centralisée des prix
 * Les prix sont récupérés depuis les variables d'environnement
 */

// Prix unique de base de la carte (en XOF) - Dynamique via variable d'environnement ou valeur par défaut
export const NFC_CARD_BASE_PRICE = Number(process.env.NEXT_PUBLIC_NFC_CARD_BASE_PRICE) || 14600

// Frais de livraison par zone (en XOF)
export const SHIPPING_COSTS = {
  ABIDJAN: 0,            // Livraison 100% gratuite dans tout Abidjan
  UEMOA: 2000,           // CI intérieur & zone UEMOA (SN, BJ, BF, TG, NE, ML, GW)
  WEST_AFRICA: 5000,     // GH, NG, CM
  INTERNATIONAL: 10000   // Autres pays
} as const

// Pays par zone
export const COUNTRY_ZONES = {
  UEMOA: ['CI', 'SN', 'BJ', 'BF', 'TG', 'NE', 'ML', 'GW'],
  WEST_AFRICA: ['GH', 'NG', 'CM']
} as const

// Devise
export const CURRENCY = 'XOF'

// Calculer le prix total d'une carte
export function calculateCardPrice(
  designId: string,
  countryCode: string = 'CI',
  quantity: number = 1,
  city: string = 'Abidjan'
): {
  basePrice: number
  shippingCost: number
  subtotal: number
  total: number
  currency: string
} {
  // Prix de base
  let basePrice = NFC_CARD_BASE_PRICE
  
  // Calculer frais de livraison
  let shippingCost: number = SHIPPING_COSTS.INTERNATIONAL
  
  if (countryCode === 'CI' && (!city || city.toLowerCase().includes('abidjan'))) {
    shippingCost = SHIPPING_COSTS.ABIDJAN // Gratuit dans tout Abidjan
  } else if (COUNTRY_ZONES.UEMOA.includes(countryCode as any)) {
    shippingCost = SHIPPING_COSTS.UEMOA
  } else if (COUNTRY_ZONES.WEST_AFRICA.includes(countryCode as any)) {
    shippingCost = SHIPPING_COSTS.WEST_AFRICA
  }
  
  // Calculer totaux
  const subtotal = basePrice * quantity
  const total = subtotal + shippingCost
  
  return {
    basePrice,
    shippingCost,
    subtotal,
    total,
    currency: CURRENCY
  }
}

// Formater un montant en XOF
export function formatPrice(amount: number, currency: string = CURRENCY): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Obtenir le prix pour l'affichage
export function getDisplayPrice(): string {
  return formatPrice(NFC_CARD_BASE_PRICE)
}

// Obtenir le prix brut (nombre)
export function getRawPrice(): number {
  return NFC_CARD_BASE_PRICE
}
