/**
 * Service pour gérer la logique métier de l'onboarding
 */

import { createClient } from '@/lib/supabase/client'
import {
  PendingCreation,
  OnboardingSession,
  NFCCard,
  Order,
  CreateNFCCardInput,
  CreateOrderInput,
  PricingDetails,
  OnboardingFlowType
} from '@/lib/types/onboarding'

const getSupabase = () => createClient()

// =====================================================
// PENDING CREATIONS
// =====================================================

export async function savePendingCreation(
  sessionId: string,
  type: OnboardingFlowType,
  payload: any,
  stepCompleted: number = 0
): Promise<{ success: boolean; data?: PendingCreation; error?: string }> {
  try {
    // Vérifier si existe déjà
    const { data: existing } = await getSupabase()
      .from('pending_creations')
      .select('id')
      .eq('session_id', sessionId)
      .eq('type', type)
      .single()

    if (existing) {
      // Mettre à jour
      const { data, error } = await getSupabase()
        .from('pending_creations')
        .update({ payload, step_completed: stepCompleted })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } else {
      // Créer
      const { data, error } = await getSupabase()
        .from('pending_creations')
        .insert({
          session_id: sessionId,
          type,
          payload,
          step_completed: stepCompleted
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    }
  } catch (error: any) {
    console.error('Error saving pending creation:', error)
    return { success: false, error: error.message }
  }
}

export async function getPendingCreation(
  sessionId: string,
  type: OnboardingFlowType
): Promise<{ success: boolean; data?: PendingCreation; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('pending_creations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('type', type)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deletePendingCreation(
  sessionId: string,
  type: OnboardingFlowType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getSupabase()
      .from('pending_creations')
      .delete()
      .eq('session_id', sessionId)
      .eq('type', type)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =====================================================
// ONBOARDING SESSIONS (ANALYTICS)
// =====================================================

export async function createOnboardingSession(
  sessionId: string,
  flowType: OnboardingFlowType,
  metadata?: {
    device_type?: string
    browser?: string
    referrer?: string
    utm_source?: string
    utm_campaign?: string
  }
): Promise<{ success: boolean; data?: OnboardingSession; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('onboarding_sessions')
      .insert({
        session_id: sessionId,
        flow_type: flowType,
        current_step: 1,
        total_steps: 4,
        ...metadata
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating onboarding session:', error)
    return { success: false, error: error.message }
  }
}

export async function updateOnboardingSession(
  sessionId: string,
  updates: {
    current_step?: number
    steps_completed?: number[]
    user_id?: string
    completed_at?: string
    abandoned_at?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getSupabase()
      .from('onboarding_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =====================================================
// NFC CARDS
// =====================================================

export async function createNFCCard(
  userId: string,
  input: CreateNFCCardInput
): Promise<{ success: boolean; data?: NFCCard; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .insert({
        user_id: userId,
        design_choice: input.design_id,
        color_theme: input.color_theme || 'black',
        logo_url: input.custom_logo_url,
        profile_id: input.profile_id,
        preview_data: input.preview_data || {},
        status: 'draft',
        card_type: 'physical'
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating NFC card:', error)
    return { success: false, error: error.message }
  }
}

export async function getNFCCards(userId: string): Promise<{ success: boolean; data?: NFCCard[]; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('digital_nfc_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateNFCCard(
  cardId: string,
  updates: Partial<NFCCard>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getSupabase()
      .from('digital_nfc_cards')
      .update(updates)
      .eq('id', cardId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =====================================================
// ORDERS
// =====================================================

export async function createOrder(
  userId: string,
  input: CreateOrderInput
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    // Calculer le prix
    const pricing = await calculatePrice(input.nfc_card_id, input.shipping_address.country)

    const { data, error } = await getSupabase()
      .from('orders')
      .insert({
        user_id: userId,
        nfc_card_id: input.nfc_card_id,
        order_number: `ORD-${Date.now()}`,  // Sera remplacé par la fonction SQL
        amount_cents: pricing.base_price,
        currency: input.currency || 'XOF',
        shipping_cents: pricing.shipping_cost,
        tax_cents: pricing.tax_cost,
        shipping_address: input.shipping_address,
        payment_status: 'pending',
        shipping_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    
    // Mettre à jour le statut de la carte NFC
    await updateNFCCard(input.nfc_card_id, { status: 'pending_order' })

    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating order:', error)
    return { success: false, error: error.message }
  }
}

export async function getOrder(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserOrders(userId: string): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  try {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =====================================================
// PRICING
// =====================================================

export async function calculatePrice(
  nfcCardId: string,
  countryCode: string = 'CI',
  quantity: number = 1
): Promise<PricingDetails> {
  try {
    // Récupérer le design de la carte
    const { data: card } = await getSupabase()
      .from('digital_nfc_cards')
      .select('design_choice')
      .eq('id', nfcCardId)
      .single()

    const designId = card?.design_choice || 'design-classic'

    // Appeler la fonction SQL
    const { data, error } = await getSupabase().rpc('calculate_nfc_card_price', {
      design_id: designId,
      quantity,
      country_code: countryCode
    })

    if (error) throw error
    return data as PricingDetails
  } catch (error) {
    console.error('Error calculating price:', error)
    
    // Prix par défaut en cas d'erreur
    return {
      base_price: 14600,
      quantity: 1,
      subtotal: 14600,
      shipping_cost: 2000,
      tax_cost: 0,
      total: 16600,
      currency: 'XOF'
    }
  }
}

// =====================================================
// HELPERS
// =====================================================

export function formatPrice(amount: number, currency: string = 'XOF'): string {
  // Pour XOF, pas besoin de diviser par 100 (pas de centimes)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}
