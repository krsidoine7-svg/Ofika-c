import crypto from 'crypto'
import { verifyGeniusPayWebhookSignature, isWebhookTimestampValid } from '../lib/services/geniuspay/webhook-signature'

function runSignatureTest() {
  console.log('--- Test Unitaire: Vérification de signature Webhook GeniusPay ---')

  const testSecret = 'whsec_test_secret_12345'
  const rawBody = JSON.stringify({ id: 'evt_123', event: 'payment.success' })
  const timestampHeader = Math.floor(Date.now() / 1000).toString()

  // 1. Générer une signature valide manuellement
  const payloadToSign = `${timestampHeader}.${rawBody}`
  const validSignature = crypto.createHmac('sha256', testSecret).update(payloadToSign).digest('hex')

  // 2. Tester avec la signature valide
  const isValid = verifyGeniusPayWebhookSignature(rawBody, validSignature, timestampHeader, testSecret)
  
  if (isValid) {
    console.log('✅ TEST 1: La signature valide est correctement acceptée.')
  } else {
    console.error('❌ TEST 1 ÉCHOUÉ: La signature valide a été rejetée.')
    process.exit(1)
  }

  // 3. Tester avec une signature invalide (altérée)
  const invalidSignature = validSignature.substring(0, validSignature.length - 2) + 'ff'
  const isInvalidRejected = verifyGeniusPayWebhookSignature(rawBody, invalidSignature, timestampHeader, testSecret)

  if (!isInvalidRejected) {
    console.log('✅ TEST 2: La signature altérée est correctement rejetée.')
  } else {
    console.error('❌ TEST 2 ÉCHOUÉ: La signature altérée a été acceptée (faille de sécurité).')
    process.exit(1)
  }

  // 4. Test du timestamp (anti-replay)
  const isTimestampValid = isWebhookTimestampValid(timestampHeader)
  const oldTimestamp = (Math.floor(Date.now() / 1000) - 400).toString() // -400 secondes (tolérance est 300)
  const isOldTimestampRejected = isWebhookTimestampValid(oldTimestamp)

  if (isTimestampValid && !isOldTimestampRejected) {
    console.log('✅ TEST 3: La validation du timestamp anti-replay fonctionne (récent accepté, ancien rejeté).')
  } else {
    console.error('❌ TEST 3 ÉCHOUÉ: Problème avec la validation du timestamp.')
    process.exit(1)
  }

  console.log('\nTous les tests de sécurité (HMAC et Timestamp) sont passés avec succès ! 🔒')
}

runSignatureTest()
