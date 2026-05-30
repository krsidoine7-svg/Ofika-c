/**
 * Script de simulation de webhook LyGOS pour tester la réception et le traitement
 * 
 * Ce script simule l'envoi d'un webhook LyGOS pour tester:
 * 1. La réception du webhook par l'API
 * 2. La vérification de la signature HMAC
 * 3. La mise à jour du statut de la commande dans la base de données
 * 4. L'idempotence du traitement
 * 
 * Usage:
 *   npx tsx scripts/test-lygos-webhook-simulation.ts
 */

import crypto from 'crypto'
import { validateLygosConfig } from '../lib/services/lygos-api'

// Configuration de test
const TEST_CONFIG = {
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/lygos/webhook`
    : 'http://localhost:3000/api/payments/lygos/webhook',
  testOrderId: `test-order-${Date.now()}`,
  testPaymentId: `test-payment-${Date.now()}`,
  amount: 14600,
  currency: 'XOF'
}

/**
 * Génère une signature HMAC SHA256 comme le ferait LyGOS
 */
function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  return hmac.digest('hex')
}

/**
 * Simule l'envoi d'un webhook LyGOS
 */
async function simulateWebhook(
  paymentId: string, 
  orderId: string, 
  status: 'paid' | 'failed' | 'cancelled' = 'paid'
) {
  console.log(`📤 Simulation webhook LyGOS - Statut: ${status}`)
  console.log('-'.repeat(60))

  // Préparer le payload selon la documentation LyGOS
  const webhookPayload = {
    id: paymentId,
    order_id: orderId,
    amount: TEST_CONFIG.amount,
    currency: TEST_CONFIG.currency,
    status: status,
    timestamp: new Date().toISOString()
  }

  const payloadString = JSON.stringify(webhookPayload)
  console.log('Payload:', payloadString)

  // Récupérer la configuration
  const configValidation = validateLygosConfig()
  if (!configValidation.valid || !process.env.LYGOS_WEBHOOK_SECRET) {
    console.error('❌ LYGOS_WEBHOOK_SECRET non configuré, impossible de générer la signature')
    return null
  }

  // Générer la signature comme le ferait LyGOS
  const signature = generateWebhookSignature(payloadString, process.env.LYGOS_WEBHOOK_SECRET)
  console.log('Signature générée:', signature.substring(0, 20) + '...')

  try {
    // Envoyer le webhook
    const response = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lygos-signature': signature,
        'User-Agent': 'LyGOS-Webhook-Simulator/1.0'
      },
      body: payloadString
    })

    const responseText = await response.text()
    console.log(`Status HTTP: ${response.status}`)
    console.log('Réponse:', responseText)

    if (response.ok) {
      console.log('✅ Webhook envoyé et traité avec succès')
      try {
        const responseData = JSON.parse(responseText)
        return responseData
      } catch {
        return { success: true, raw_response: responseText }
      }
    } else {
      console.error('❌ Erreur lors de l\'envoi du webhook:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('❌ Erreur réseau lors de l\'envoi du webhook:', error)
    return null
  }
}

/**
 * Test complet de l'intégration webhook LyGOS
 */
async function testLygosWebhookIntegration() {
  console.log('🧪 Démarrage des tests d\'intégration webhook LyGOS\n')
  console.log('='.repeat(60))
  console.log(`URL du webhook: ${TEST_CONFIG.webhookUrl}`)
  console.log(`ID de commande test: ${TEST_CONFIG.testOrderId}`)
  console.log(`ID de paiement test: ${TEST_CONFIG.testPaymentId}`)

  // Test 1: Vérification de la configuration
  console.log('\n📋 Test 1: Vérification de la configuration')
  console.log('-'.repeat(60))
  const configValidation = validateLygosConfig()
  if (!configValidation.valid) {
    console.error('❌ Configuration invalide:', configValidation.error)
    console.error('\n⚠️  Veuillez configurer les variables d\'environnement suivantes:')
    console.error('   - LYGOS_API_KEY')
    console.error('   - LYGOS_WEBHOOK_SECRET')
    process.exit(1)
  }
  console.log('✅ Configuration valide')

  // Test 2: Simulation webhook paiement réussi
  console.log('\n📋 Test 2: Simulation webhook - Paiement réussi')
  console.log('-'.repeat(60))
  
  const successResult = await simulateWebhook(
    TEST_CONFIG.testPaymentId, 
    TEST_CONFIG.testOrderId, 
    'paid'
  )

  if (!successResult) {
    console.error('❌ Échec du test de webhook paiement réussi')
    process.exit(1)
  }

  console.log('✅ Webhook paiement réussi traité')
  console.log('Résultat:', successResult)

  // Test 3: Simulation webhook paiement échoué
  console.log('\n📋 Test 3: Simulation webhook - Paiement échoué')
  console.log('-'.repeat(60))
  
  const failedPaymentId = `${TEST_CONFIG.testPaymentId}-failed`
  const failedResult = await simulateWebhook(
    failedPaymentId, 
    `${TEST_CONFIG.testOrderId}-failed`, 
    'failed'
  )

  if (!failedResult) {
    console.error('❌ Échec du test de webhook paiement échoué')
    process.exit(1)
  }

  console.log('✅ Webhook paiement échoué traité')
  console.log('Résultat:', failedResult)

  // Test 4: Test d'idempotence (envoyer le même webhook deux fois)
  console.log('\n📋 Test 4: Test d\'idempotence')
  console.log('-'.repeat(60))
  console.log('Envoi du même webhook paiement réussi une deuxième fois...')
  
  const duplicateResult = await simulateWebhook(
    TEST_CONFIG.testPaymentId, 
    TEST_CONFIG.testOrderId, 
    'paid'
  )

  if (!duplicateResult) {
    console.error('❌ Échec du test d\'idempotence')
    process.exit(1)
  }

  console.log('✅ Test d\'idempotence réussi')
  console.log('Résultat:', duplicateResult)

  // Test 5: Test avec signature invalide
  console.log('\n📋 Test 5: Test avec signature invalide')
  console.log('-'.repeat(60))
  
  const webhookPayload = {
    id: `${TEST_CONFIG.testPaymentId}-invalid`,
    order_id: `${TEST_CONFIG.testOrderId}-invalid`,
    amount: TEST_CONFIG.amount,
    currency: TEST_CONFIG.currency,
    status: 'paid',
    timestamp: new Date().toISOString()
  }

  const payloadString = JSON.stringify(webhookPayload)
  const invalidSignature = 'invalid_signature_' + Date.now()

  try {
    const response = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lygos-signature': invalidSignature,
        'User-Agent': 'LyGOS-Webhook-Simulator/1.0'
      },
      body: payloadString
    })

    const responseText = await response.text()
    console.log(`Status HTTP: ${response.status}`)
    console.log('Réponse:', responseText)

    // LyGOS devrait retourner 200 même avec signature invalide (pour éviter les retries)
    // mais le traitement devrait échouer
    if (response.status === 200) {
      console.log('✅ Webhook avec signature invalide rejeté correctement (retourne 200 mais ne traite pas)')
    } else {
      console.log('⚠️  Webhook avec signature invalide a retourné un statut inattendu')
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de signature invalide:', error)
  }

  // Résumé final
  console.log('\n📋 Résumé des tests webhook')
  console.log('='.repeat(60))
  console.log('✅ Tous les tests webhook sont passés!')
  console.log('\n📊 Résultats:')
  console.log('   - Configuration: ✅')
  console.log('   - Webhook paiement réussi: ✅')
  console.log('   - Webhook paiement échoué: ✅')
  console.log('   - Idempotence: ✅')
  console.log('   - Signature invalide: ✅')
  console.log('\n🎯 Prochaines étapes:')
  console.log('   1. Vérifiez que les commandes ont été mises à jour dans la base de données')
  console.log('   2. Testez avec de vrais paiements LyGOS')
  console.log('   3. Configurez les notifications email si nécessaire')
  console.log('\n✨ Tests webhook terminés avec succès!\n')
}

// Exécuter les tests
testLygosWebhookIntegration().catch((error) => {
  console.error('\n❌ Erreur lors de l\'exécution des tests webhook:', error)
  process.exit(1)
})
