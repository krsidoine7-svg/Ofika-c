import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { WaveApiConfig } from '@/lib/services/wave-api'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/methods - Récupère les méthodes de paiement disponibles (Wave uniquement)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // 1. Récupérer la config depuis la DB (pricing_config et payment_gateways)
    const { data: pricingDb } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'pricing_config')
      .maybeSingle()

    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .maybeSingle()

    const gateways = dbConfig?.value || {}
    const geniusPayDb = gateways.geniuspay || {}
    const waveDb = gateways.wave || {}
    const resolvedPrice = pricingDb?.value?.nfc_card_base_price || geniusPayDb.base_price || waveDb.base_price || 14600

    // 2. Définir Genius Pay
    const geniusPayMethod = {
      id: 'geniuspay',
      name: 'Genius Pay',
      provider: 'geniuspay',
      is_active: geniusPayDb.hasOwnProperty('is_active') ? geniusPayDb.is_active : true, // Actif par défaut
      description: 'Paiement sécurisé Mobile Money (Orange, MTN, Wave, Moov) ou Carte',
      fees: geniusPayDb.fees || 0,
      currency: geniusPayDb.currency || 'XOF',
      base_price: resolvedPrice
    }

    // 3. Définir Wave Direct
    const waveMethod = {
      id: 'wave',
      name: 'Wave Direct',
      provider: 'wave',
      is_active: waveDb.hasOwnProperty('is_active') ? waveDb.is_active : true, // Actif par défaut si présent
      description: 'Paiement instantané via Lien / QR Code Wave',
      fees: waveDb.fees || 0,
      currency: waveDb.currency || 'XOF',
      base_price: resolvedPrice,
      wave_merchant_id: waveDb.wave_merchant_id || 'M_ci_8aqIEVzY9rYq',
      wave_payment_link: waveDb.wave_payment_link || `https://pay.wave.com/m/M_ci_8aqIEVzY9rYq/c/ci?a=${resolvedPrice}`,
      whatsapp_number: waveDb.whatsapp_number || '+2250503681588'
    }

    const methods = [geniusPayMethod, waveMethod]

    return NextResponse.json({
      success: true,
      methods,
      count: methods.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur récupération méthodes de paiement:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/payments/methods - Met à jour la configuration d'une passerelle (GeniusPay ou Wave)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id = 'wave', is_active, fees, currency, base_price, wave_merchant_id, wave_payment_link, whatsapp_number } = body

    // 1. Récupérer la config existante
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .maybeSingle()

    const currentConfig = dbConfig?.value || {}
    const gatewayKey = id === 'geniuspay' ? 'geniuspay' : 'wave'
    const targetGateway = currentConfig[gatewayKey] || {}

    // 2. Mettre à jour la passerelle ciblée
    const updatedConfig = {
      ...currentConfig,
      [gatewayKey]: {
        ...targetGateway,
        ...(is_active !== undefined && { is_active }),
        ...(fees !== undefined && { fees }),
        ...(currency !== undefined && { currency }),
        ...(base_price !== undefined && { base_price }),
        ...(wave_merchant_id !== undefined && { wave_merchant_id }),
        ...(wave_payment_link !== undefined && { wave_payment_link }),
        ...(whatsapp_number !== undefined && { whatsapp_number })
      }
    }

    // 3. Sauvegarder dans system_config
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'payment_gateways',
        value: updatedConfig,
        description: 'Configurations des passerelles de paiement (GeniusPay et Wave Direct)',
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true, method: updatedConfig[gatewayKey] })

  } catch (error: any) {
    console.error('Erreur PATCH methods:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
