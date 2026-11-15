import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { requireStaff } from '@/lib/auth/require-staff'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/methods - Récupère les méthodes de paiement disponibles (GeniusPay)
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
    const resolvedPrice = pricingDb?.value?.nfc_card_base_price || geniusPayDb.base_price || 14600

    // 2. Définir Genius Pay (Passerelle officielle unifiée)
    const geniusPayMethod = {
      id: 'geniuspay',
      name: 'Genius Pay',
      provider: 'geniuspay',
      is_active: geniusPayDb.hasOwnProperty('is_active') ? geniusPayDb.is_active : true, // Actif par défaut
      description: 'Paiement sécurisé Mobile Money (Wave, Orange, MTN, Moov) ou Carte',
      fees: geniusPayDb.fees || 0,
      currency: geniusPayDb.currency || 'XOF',
      base_price: resolvedPrice
    }

    const methods = [geniusPayMethod]

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
 * PATCH /api/payments/methods - Met à jour la configuration de la passerelle GeniusPay
 */
export async function PATCH(request: NextRequest) {
  try {
    const staff = await requireStaff()
    if (!staff.ok) return staff.response

    const supabase = createAdminClient()
    const body = await request.json()
    const { is_active, fees, currency, base_price } = body

    // 1. Récupérer la config existante
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .maybeSingle()

    const currentConfig = dbConfig?.value || {}
    const targetGateway = currentConfig.geniuspay || {}

    // 2. Mettre à jour GeniusPay
    const updatedConfig = {
      ...currentConfig,
      geniuspay: {
        ...targetGateway,
        ...(is_active !== undefined && { is_active }),
        ...(fees !== undefined && { fees }),
        ...(currency !== undefined && { currency }),
        ...(base_price !== undefined && { base_price })
      }
    }

    // 3. Sauvegarder dans system_config
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'payment_gateways',
        value: updatedConfig,
        description: 'Configurations de la passerelle de paiement GeniusPay (Mobile Money & Carte)',
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true, method: updatedConfig.geniuspay })

  } catch (error: any) {
    console.error('Erreur PATCH methods:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
