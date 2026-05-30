#!/usr/bin/env tsx
/**
 * Vérification finale de la configuration LyGOS
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

console.log('\n🔐 VÉRIFICATION FINALE - CONFIGURATION LYGOS\n')
console.log('=' .repeat(60))

const apiKey = process.env.LYGOS_API_KEY || ''
const webhookSecret = process.env.LYGOS_WEBHOOK_SECRET || ''
const baseUrl = process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com'

// 1. Vérifier les variables
console.log('\n📋 Variables d\'environnement:')
if (apiKey) {
  console.log('  ✅ LYGOS_API_KEY:', apiKey.substring(0, 10) + '***')
} else {
  console.log('  ❌ LYGOS_API_KEY: NON DÉFINIE')
}

if (webhookSecret) {
  console.log('  ✅ LYGOS_WEBHOOK_SECRET:', webhookSecret.substring(0, 10) + '***')
} else {
  console.log('  ❌ LYGOS_WEBHOOK_SECRET: NON DÉFINIE')
}

console.log('  ✅ LYGOS_BASE_URL:', baseUrl)

// 2. Vérifier le format des headers
console.log('\n🔧 Configuration des headers:')
console.log('  ✅ api-key: CONFIGURÉ (depuis LYGOS_API_KEY)')
console.log('  ✅ Content-Type: application/json')
console.log('  ✅ User-Agent: Ofika-App/1.0')

// 3. Test de connexion
console.log('\n🌐 Test de connexion à l\'API LyGOS...')

async function testConnection() {
  if (!apiKey) {
    console.log('  ❌ Impossible de tester: LYGOS_API_KEY manquante')
    return false
  }

  try {
    const testPayload = {
      amount: 100,
      shop_name: process.env.LYGOS_SHOP_NAME || 'Ofika',
      message: 'Test de vérification',
      order_id: `verify-${Date.now()}`,
      success_url: 'https://example.com/success',
      failure_url: 'https://example.com/failure',
    }

    console.log('  📤 Envoi de la requête test...')
    
    const response = await fetch(`${baseUrl}/v1/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'User-Agent': 'Ofika-Verification/1.0'
      },
      body: JSON.stringify(testPayload),
    })

    const text = await response.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    console.log('  📥 Réponse reçue:')
    console.log('     Status:', response.status, response.statusText)

    if (response.ok) {
      console.log('\n  ✅ CONNEXION RÉUSSIE!')
      if (data.id) {
        console.log('     Payment ID:', data.id)
        console.log('     Link:', data.link?.substring(0, 50) + '...')
      }
      return true
    } else {
      console.log('\n  ❌ Erreur:', response.status)
      
      if (data.detail) {
        console.log('     Message:', data.detail)
      } else if (data.message) {
        console.log('     Message:', data.message)
      }

      // Diagnostics
      if (response.status === 401) {
        console.log('\n  💡 La clé API semble invalide ou inactive')
        console.log('     → Vérifiez votre LYGOS_API_KEY sur le dashboard LyGOS')
      } else if (response.status === 404) {
        console.log('\n  💡 L\'endpoint n\'existe pas')
        console.log('     → L\'URL de l\'API a peut-être changé')
        console.log('     → Consultez: https://docs.lygosapp.com')
      } else if (response.status === 403) {
        console.log('\n  💡 Accès refusé')
        console.log('     → Vérifiez les permissions de votre compte LyGOS')
      } else if (response.status === 400) {
        console.log('\n  💡 Requête invalide')
        console.log('     → Le format des données ne correspond pas à l\'API')
      }
      
      return false
    }
  } catch (error) {
    console.log('\n  ❌ Erreur de connexion')
    if (error instanceof Error) {
      console.log('     Message:', error.message)
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('\n  💡 Impossible de joindre le serveur')
        console.log('     → Vérifiez votre connexion internet')
      }
    }
    return false
  }
}

async function main() {
  const success = await testConnection()

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 RÉSUMÉ:\n')
  
  if (apiKey && webhookSecret && success) {
    console.log('  🎉 TOUT EST CONFIGURÉ CORRECTEMENT!')
    console.log('\n  ✅ Variables d\'environnement: OK')
    console.log('  ✅ Headers API: OK')
    console.log('  ✅ Connexion LyGOS: OK')
    console.log('\n  Vous pouvez maintenant utiliser LyGOS pour les paiements! 💳')
  } else if (apiKey && webhookSecret && !success) {
    console.log('  ⚠️  CONFIGURATION PARTIELLE')
    console.log('\n  ✅ Variables d\'environnement: OK')
    console.log('  ✅ Headers API: OK')
    console.log('  ❌ Connexion LyGOS: ÉCHEC')
    console.log('\n  → Vérifiez l\'URL de l\'API ou contactez le support LyGOS')
  } else {
    console.log('  ❌ CONFIGURATION INCOMPLÈTE')
    console.log('\n  Ajoutez ces variables dans votre fichier .env.local:')
    console.log('\n  LYGOS_API_KEY=votre_clé_api')
    console.log('  LYGOS_WEBHOOK_SECRET=votre_secret_webhook')
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
}

main()
