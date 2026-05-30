#!/usr/bin/env tsx
/**
 * Script pour tester différentes variations d'URL de l'API LyGOS
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const API_KEY = process.env.LYGOS_API_KEY || ''
const SHOP_NAME = process.env.LYGOS_SHOP_NAME || 'Ofika'

// Différentes variations d'URL à tester
const URL_VARIATIONS = [
  'https://api.lygosapp.com/v1/gateway',
  'https://api.lygosapp.com/gateway',
  'https://api.lygosapp.com/v2/gateway',
  'https://lygosapp.com/api/v1/gateway',
  'https://lygosapp.com/api/gateway',
]

const testPayload = {
  amount: 100,
  shop_name: SHOP_NAME,
  message: 'Test endpoint',
  order_id: `test-${Date.now()}`,
  success_url: 'https://example.com/success',
  failure_url: 'https://example.com/failure',
}

console.log('\n🔍 TEST DES VARIATIONS D\'URL LYGOS\n')
console.log('=' .repeat(60))

async function testUrl(url: string, index: number) {
  console.log(`\n[${index + 1}/${URL_VARIATIONS.length}] Test de: ${url}`)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
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

    if (response.ok) {
      console.log('  ✅ SUCCÈS!')
      console.log('  Status:', response.status)
      if (data.id) {
        console.log('  Payment ID:', data.id)
        console.log('  Link:', data.link)
        console.log('\n  🎉 Cette URL fonctionne! Mettez à jour LYGOS_BASE_URL')
        return true
      }
    } else {
      console.log('  ❌ Échec')
      console.log('  Status:', response.status, response.statusText)
      if (data.detail) {
        console.log('  Erreur:', data.detail)
      } else if (data.message) {
        console.log('  Erreur:', data.message)
      }
    }
  } catch (error) {
    console.log('  ❌ Erreur réseau')
    if (error instanceof Error) {
      console.log('  Message:', error.message)
    }
  }
  
  return false
}

async function main() {
  if (!API_KEY) {
    console.log('❌ LYGOS_API_KEY non définie!')
    process.exit(1)
  }

  console.log('API Key:', API_KEY.substring(0, 10) + '...')
  console.log('Shop Name:', SHOP_NAME)
  
  let foundWorking = false
  
  for (let i = 0; i < URL_VARIATIONS.length; i++) {
    const works = await testUrl(URL_VARIATIONS[i], i)
    if (works) {
      foundWorking = true
      break
    }
    // Petit délai entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(60))
  
  if (foundWorking) {
    console.log('\n✅ Une URL fonctionnelle a été trouvée!')
  } else {
    console.log('\n❌ Aucune URL fonctionnelle trouvée')
    console.log('\n💡 Suggestions:')
    console.log('  1. Vérifiez la documentation officielle LyGOS')
    console.log('  2. Contactez le support LyGOS')
    console.log('  3. Vérifiez que votre clé API est active')
  }
  
  console.log('')
}

main()
