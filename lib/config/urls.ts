/**
 * Configuration centralisée des URLs
 * 
 * Ce fichier centralise toutes les URLs de l'application
 * pour faciliter les changements d'environnement.
 */

// URL de base de l'application (pour les redirections et emails)
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci')

// API Endpoints - Utiliser des chemins relatifs pour éviter les problèmes CORS
export const API_ENDPOINTS = {
  // Orders
  CREATE_ORDER: '/api/orders/create',
  GET_ORDERS: '/api/orders',
  
  // Payments LyGOS
  LYGOS_CREATE: '/api/payments/lygos/create',
  LYGOS_STATUS: '/api/payments/lygos/status',
  LYGOS_WEBHOOK: '/api/payments/lygos/webhook',
  
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  
  // NFC Cards
  NFC_CARDS: '/api/nfc-cards',
  
  // Profiles
  PROFILES: '/api/profiles',
} as const

// Pages URLs
export const PAGE_URLS = {
  HOME: APP_URL,
  DASHBOARD: `${APP_URL}/dashboard`,
  ORDERS: `${APP_URL}/dashboard/orders`,
  NEW_ORDER: `${APP_URL}/dashboard/orders/new`,
  PROFILES: `${APP_URL}/dashboard/profiles`,
  
  // Payment
  PAYMENT_SUCCESS: `${APP_URL}/payment/success`,
  PAYMENT_CANCELLED: `${APP_URL}/payment/cancelled`,
  
  // Auth
  AUTH_LOGIN: `${APP_URL}/auth/login`,
  AUTH_SIGNUP: `${APP_URL}/auth/signup`,
} as const

// Helper pour obtenir l'URL complète d'un endpoint
export function getApiUrl(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint]
}

// Helper pour obtenir l'URL complète d'une page
export function getPageUrl(page: keyof typeof PAGE_URLS): string {
  return PAGE_URLS[page]
}
