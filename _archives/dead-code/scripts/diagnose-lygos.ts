#!/usr/bin/env tsx
/**
 * Script de diagnostic détaillé pour LyGOS
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

console.log('\n🔍 DIAGNOSTIC LYGOS - MODE DÉTAILLÉ\n')

const LYGOS_CONFIG = {
  apiKey: process.env.LYGOS_API_KEY || '',
  webhookSecret: process.env.LYGOS_WEBHOOK_SECRET || '',
  baseUrl: process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com',
  shopName: process.env.LYGOS_SHOP_NAME || 'Ofika',
  successUrl: process.env.LYGOS_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  failureUrl: process.env.LYGOS_FAILURE_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
}

console.log('📋 Configuration chargée:')
console.log('  API Key:', LYGOS_CONFIG.apiKey ? `${LYGOS_CONFIG.apiKey.substring(0, 10)}...` : 'NON DÉFINIE')
console.log('  Webhook Secret:', LYGOS_CONFIG.webhookSecret ? `${LYGOS_CONFIG.webhookSecret.substring(0, 10)}...` : 'NON DÉFINIE')
console.log('  Base URL:', LYGOS_CONFIG.baseUrl)
console.log('  Shop Name:', LYGOS_CONFIG.shopName)
console.log('  Success URL:', LYGOS_CONFIG.successUrl)
console.log('  Failure URL:', LYGOS_CONFIG.failureUrl)

console.log('\n🧪 Test de connexion à l\'API LyGOS...\n')

async function testConnection() {
  try {
    const testPayload = {
      amount: 100,
      shop_name: LYGOS_CONFIG.shopName,
      message: 'Test de diagnostic',
      order_id: `diagnostic-${Date.now()}`,
      success_url: LYGOS_CONFIG.successUrl || 'https://example.com/success',
      failure_url: LYGOS_CONFIG.failureUrl || 'https://example.com/failure',
    }

    console.log('📤 Envoi de la requête:')
    console.log('  URL:', `${LYGOS_CONFIG.baseUrl}/v1/gateway`)
    console.log('  Payload:', JSON.stringify(testPayload, null, 2))

    const response = await fetch(`${LYGOS_CONFIG.baseUrl}/v1/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': LYGOS_CONFIG.apiKey,
        'User-Agent': 'Ofika-Diagnostic/1.0',
      },
      body: JSON.stringify(testPayload),
    })

    console.log('\n📥 Réponse reçue:')
    console.log('  Status:', response.status, response.statusText)
    console.log('  Headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('  Body (raw):', responseText)

    let responseData: any
    try {
      responseData = JSON.parse(responseText)
      console.log('  Body (parsed):', JSON.stringify(responseData, null, 2))
    } catch {
      console.log('  ⚠️  Impossible de parser la réponse JSON')
    }

    if (response.ok) {
      console.log('\n✅ SUCCÈS: La connexion avec LyGOS fonctionne!')
      if (responseData?.id) {
        console.log('\n📱 Paiement de test créé:')
        console.log('  ID:', responseData.id)
        console.log('  Lien:', responseData.link)
        console.log('  Montant:', responseData.amount, responseData.currency)
      }
    } else {
      console.log('\n❌ ERREUR: La requête a échoué')
      if (responseData?.detail?.message) {
        console.log('  Message:', responseData.detail.message)
      } else if (responseData?.message) {
        console.log('  Message:', responseData.message)
      }
      
      // Diagnostics
      if (response.status === 401) {
        console.log('\n💡 Suggestion: Vérifiez votre LYGOS_API_KEY')
      } else if (response.status === 403) {
        console.log('\n💡 Suggestion: Vérifiez les permissions de votre clé API')
      } else if (response.status === 400) {
        console.log('\n💡 Suggestion: Vérifiez le format des données envoyées')
      }
    }
  } catch (error) {
    console.log('\n❌ ERREUR FATALE:', error)
    if (error instanceof Error) {
      console.log('  Message:', error.message)
      console.log('  Stack:', error.stack)
    }
  }
}

testConnection()
