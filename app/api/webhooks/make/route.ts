// =====================================================
// API ROUTE POUR ENVOYER DES WEBHOOKS À MAKE.COM
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getRequestClientIp } from '@/lib/utils/request-ip'

export const dynamic = 'force-dynamic'


interface WebhookEventData {
  event_type: 'profile_created' | 'nfc_card_created' | 'physical_card_ordered' | 'payment_completed' | 'user_registered'
  timestamp: string
  user_id: string
  user_email?: string
  data: any
  tag: string
}

// Utiliser la variable d'environnement définie dans .env.local
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || ''

export async function POST(request: NextRequest) {
  try {
    // SÉCURITÉ : Vérification par session Supabase OU par clé d'API
    const apiKey = request.headers.get('x-api-key')
    const secretKey = process.env.INTERNAL_WEBHOOK_SECRET
    
    let isAuthorized = false

    // 1. Vérification par clé d'API (pour les appels serveur à serveur)
    if (secretKey && apiKey === secretKey) {
      isAuthorized = true
    }

    // 2. Vérification par session (pour les appels client-side)
    if (!isAuthorized) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      logger.security('Tentative d\'accès non autorisé au webhook Make.com', { 
        ip: getRequestClientIp(request),
        userAgent: request.headers.get('user-agent'),
        hasApiKey: !!apiKey
      })
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const eventData: WebhookEventData = await request.json()
    // ... reste du code

    console.log('📡 Envoi webhook Make.com:', eventData.event_type, eventData.tag)
    console.log('👤 Utilisateur:', eventData.user_id, eventData.user_email)

    // Préparer le payload complet
    const payload = {
      ...eventData,
      app_name: 'Ofika',
      environment: process.env.NODE_ENV || 'development'
    }

    console.log('📦 Payload webhook:', JSON.stringify(payload, null, 2))

    if (!MAKE_WEBHOOK_URL) {
      console.error('❌ Erreur de configuration: MAKE_WEBHOOK_URL non défini')
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante (Webhook URL)' },
        { status: 500 }
      )
    }

    // Envoi du webhook à Make.com
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Ofika-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 Réponse Make.com status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur Make.com:', response.status, errorText)
      return NextResponse.json(
        { 
          success: false, 
          error: `HTTP ${response.status}: ${errorText}` 
        },
        { status: response.status }
      )
    }

    console.log('✅ Webhook Make.com envoyé avec succès:', payload.tag)
    
    return NextResponse.json({
      success: true,
      tag: payload.tag,
      timestamp: payload.timestamp
    })

  } catch (error) {
    console.error('❌ Erreur dans l\'API Route Make.com:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
      },
      { status: 500 }
    )
  }
}
