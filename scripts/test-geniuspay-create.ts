import { config } from 'dotenv'
import { resolve } from 'path'
import { createGeniusPayPayment } from '../lib/services/geniuspay/client'

// Charger les variables d'environnement de .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function runTest() {
  console.log('--- Test de création de paiement GeniusPay ---')
  console.log('API KEY détectée:', process.env.GENIUSPAY_API_KEY ? 'OUI' : 'NON')
  console.log('API SECRET détecté:', process.env.GENIUSPAY_API_SECRET ? 'OUI' : 'NON')
  
  if (!process.env.GENIUSPAY_API_KEY || !process.env.GENIUSPAY_API_SECRET) {
    console.error('❌ Erreur: Veuillez renseigner GENIUSPAY_API_KEY et GENIUSPAY_API_SECRET dans .env.local')
    process.exit(1)
  }

  try {
    console.log('\nAppel de createGeniusPayPayment...')
    const transaction = await createGeniusPayPayment({
      amount: 500,
      currency: 'XOF',
      description: 'Test API Client',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+22500000000'
      },
      metadata: { test: true }
    })

    console.log('\n✅ Succès !')
    console.log('Reference:', transaction.reference)
    console.log('Checkout URL:', transaction.checkout_url)
    
  } catch (error) {
    console.error('\n❌ Échec du test:')
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }
}

runTest()
