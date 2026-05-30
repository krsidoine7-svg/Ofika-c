import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { validateLygosConfig } from '@/lib/services/lygos-api'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/methods - Récupère les méthodes de paiement disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // 1. Essayer de récupérer la config depuis la DB
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const gateways = dbConfig?.value || {}

    // 2. Fallback sur les env vars pour LyGOS
    const lygosApiConfig = validateLygosConfig()
    
    const methods: any[] = []
    const processedIds = new Set()

    const lygosDb = gateways.lygos || {}
    const waveDb = gateways.wave || {}

    // 1. Définir les méthodes standards
    const standardMethods = [
      {
        id: 'lygos',
        name: 'LyGOS',
        provider: 'lygos',
        is_active: lygosDb.hasOwnProperty('is_active') ? lygosDb.is_active : lygosApiConfig.valid,
        description: 'Paiement mobile sécurisé - Orange Money, Moov Money, Wave',
        fees: lygosDb.fees || 1.5,
        currency: lygosDb.currency || 'XOF',
        min_amount: 100,
        max_amount: 1000000,
        countries: ['CI', 'SN', 'BF', 'ML']
      },
      {
        id: 'wave',
        name: 'Wave CI Merchant',
        provider: 'wave',
        is_active: waveDb.hasOwnProperty('is_active') ? waveDb.is_active : false,
        description: 'Paiement direct via lien Wave Marchand CI',
        fees: waveDb.fees || 0,
        currency: waveDb.currency || 'XOF',
        merchant_id: waveDb.merchant_id || process.env.NEXT_PUBLIC_WAVE_MERCHANT_ID || 'M_ci_8aqIEVzY9rYq',
        country_code: waveDb.country_code || process.env.NEXT_PUBLIC_WAVE_COUNTRY_CODE || 'ci',
        base_url: waveDb.base_url || process.env.NEXT_PUBLIC_WAVE_BASE_URL || 'https://pay.wave.com/m'
      }
    ]

    // 2. Ajouter les standards
    standardMethods.forEach(m => {
      methods.push(m)
      processedIds.add(m.id)
    })

    // 3. Ajouter les autres méthodes configurées en DB
    Object.keys(gateways).forEach(id => {
      if (!processedIds.has(id)) {
        methods.push({
          id,
          ...gateways[id],
          provider: gateways[id].provider || 'custom'
        })
      }
    })

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
 * PATCH /api/payments/methods - Met à jour le statut ou la config d'une méthode
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { id, is_active, fees, currency, merchant_id, country_code } = await request.json()

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    // 1. Récupérer l'existant
    const { data: dbConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_gateways')
      .single()

    const currentConfig = dbConfig?.value || {}
    
    // 2. Mettre à jour la méthode spécifique
    const updatedConfig = {
      ...currentConfig,
      [id]: {
        ...(currentConfig[id] || {}),
        ...(is_active !== undefined && { is_active }),
        ...(fees !== undefined && { fees }),
        ...(currency !== undefined && { currency }),
        ...(merchant_id !== undefined && { merchant_id }),
        ...(country_code !== undefined && { country_code })
      }
    }

    // 3. Sauvegarder
    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'payment_gateways',
        value: updatedConfig,
        description: 'Configuration des passerelles de paiement',
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true, method: updatedConfig[id] })

  } catch (error: any) {
    console.error('Erreur PATCH methods:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
