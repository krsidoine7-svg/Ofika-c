#!/usr/bin/env tsx
/**
 * Script de test de connexion avec l'API LyGOS
 * 
 * Ce script vérifie:
 * 1. La configuration des variables d'environnement
 * 2. La connexion à l'API LyGOS
 * 3. La création d'un paiement de test (optionnel)
 * 
 * Usage:
 *   npm run test:lygos
 *   ou
 *   npx tsx scripts/test-lygos-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60))
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green')
}

function logError(message: string) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'cyan')
}

// Configuration LyGOS
const LYGOS_CONFIG = {
  apiKey: process.env.LYGOS_API_KEY || '',
  webhookSecret: process.env.LYGOS_WEBHOOK_SECRET || '',
  baseUrl: process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com',
  shopName: process.env.LYGOS_SHOP_NAME || 'Ofika',
  successUrl: process.env.LYGOS_SUCCESS_URL || '',
  failureUrl: process.env.LYGOS_FAILURE_URL || '',
}

/**
 * Étape 1: Vérifier les variables d'environnement
 */
function checkEnvironmentVariables(): boolean {
  logSection('ÉTAPE 1: Vérification des variables d\'environnement')
  
  let allValid = true
  const required = [
    { name: 'LYGOS_API_KEY', value: LYGOS_CONFIG.apiKey },
    { name: 'LYGOS_WEBHOOK_SECRET', value: LYGOS_CONFIG.webhookSecret },
  ]
  
  const optional = [
    { name: 'LYGOS_BASE_URL', value: LYGOS_CONFIG.baseUrl },
    { name: 'LYGOS_SHOP_NAME', value: LYGOS_CONFIG.shopName },
    { name: 'LYGOS_SUCCESS_URL', value: LYGOS_CONFIG.successUrl },
    { name: 'LYGOS_FAILURE_URL', value: LYGOS_CONFIG.failureUrl },
  ]

  // Vérifier les variables requises
  for (const { name, value } of required) {
    if (!value) {
      logError(`${name} n'est pas définie`)
      allValid = false
    } else {
      const maskedValue = value.substring(0, 8) + '...' + value.substring(value.length - 4)
      logSuccess(`${name}: ${maskedValue}`)
    }
  }

  // Vérifier les variables optionnelles
  for (const { name, value } of optional) {
    if (!value) {
      logWarning(`${name} n'est pas définie (optionnel)`)
    } else {
      logInfo(`${name}: ${value}`)
    }
  }

  // Valider le format de l'URL de base (requise)
  try {
    new URL(LYGOS_CONFIG.baseUrl)
    logSuccess(`URL de base valide: ${LYGOS_CONFIG.baseUrl}`)
  } catch {
    logError('LYGOS_BASE_URL invalide')
    allValid = false
  }

  return allValid
}

/**
 * Étape 2: Tester la connexion à l'API LyGOS
 */
async function testApiConnection(): Promise<boolean> {
  logSection('ÉTAPE 2: Test de connexion à l\'API LyGOS')
  
  try {
    logInfo(`URL de base: ${LYGOS_CONFIG.baseUrl}`)
    logInfo('Tentative de connexion...')

    // Test simple: essayer de créer un paiement de test avec un montant minimal
    const testPayload = {
      amount: 100, // 100 XOF (montant minimal pour test)
      shop_name: LYGOS_CONFIG.shopName,
      message: 'Test de connexion API',
      order_id: `test-${Date.now()}`,
      success_url: LYGOS_CONFIG.successUrl || 'https://example.com/success',
      failure_url: LYGOS_CONFIG.failureUrl || 'https://example.com/failure',
    }

    const response = await fetch(`${LYGOS_CONFIG.baseUrl}/v1/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': LYGOS_CONFIG.apiKey,
        'User-Agent': 'Ofika-Test/1.0',
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    let responseData: any

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    if (response.ok) {
      logSuccess('Connexion réussie à l\'API LyGOS!')
      logInfo(`Statut HTTP: ${response.status}`)
      
      if (responseData.id) {
        logSuccess(`Paiement de test créé: ${responseData.id}`)
        logInfo(`Lien de paiement: ${responseData.link}`)
        logInfo(`Montant: ${responseData.amount} ${responseData.currency}`)
        
        // Afficher le lien de paiement pour test manuel si nécessaire
        log('\n📱 Lien de paiement de test:', 'bright')
        log(responseData.link, 'cyan')
        log('\nℹ️  Ce paiement de test peut être ignoré ou annulé.', 'yellow')
      }
      
      return true
    } else {
      logError(`Erreur HTTP ${response.status}`)
      
      if (responseData.detail?.message) {
        logError(`Message: ${responseData.detail.message}`)
      } else if (responseData.message) {
        logError(`Message: ${responseData.message}`)
      } else {
        logError(`Réponse: ${JSON.stringify(responseData, null, 2)}`)
      }
      
      // Diagnostics supplémentaires
      if (response.status === 401) {
        logError('Erreur d\'authentification - Vérifiez votre LYGOS_API_KEY')
      } else if (response.status === 403) {
        logError('Accès refusé - Vérifiez les permissions de votre clé API')
      } else if (response.status === 404) {
        logError('Endpoint non trouvé - Vérifiez LYGOS_BASE_URL')
      } else if (response.status >= 500) {
        logError('Erreur serveur LyGOS - Réessayez plus tard')
      }
      
      return false
    }
  } catch (error) {
    logError('Erreur lors de la connexion à l\'API LyGOS')
    
    if (error instanceof Error) {
      logError(`Message: ${error.message}`)
      
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        logError('Impossible de joindre le serveur - Vérifiez votre connexion internet')
      } else if (error.message.includes('timeout')) {
        logError('Timeout - Le serveur met trop de temps à répondre')
      }
    }
    
    return false
  }
}

/**
 * Étape 3: Vérifier l'endpoint local de l'application
 */
async function testLocalEndpoint(): Promise<boolean> {
  logSection('ÉTAPE 3: Test de l\'endpoint local /api/payments/lygos/create')
  
  const localUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const endpoint = `${localUrl}/api/payments/lygos/create`
  
  try {
    logInfo(`URL: ${endpoint}`)
    logInfo('Tentative de connexion (GET)...')

    const response = await fetch(endpoint, {
      method: 'GET',
    })

    const data = await response.json()

    if (response.ok && data.success) {
      logSuccess('Endpoint local opérationnel!')
      logInfo(`Message: ${data.message}`)
      logInfo(`Provider: ${data.provider}`)
      logInfo(`Configuré: ${data.configured ? 'Oui' : 'Non'}`)
      return true
    } else {
      logWarning('Endpoint local accessible mais configuration incomplète')
      logInfo(`Message: ${data.message}`)
      return false
    }
  } catch (error) {
    logWarning('Impossible de joindre l\'endpoint local')
    logInfo('Assurez-vous que votre serveur Next.js est démarré (npm run dev)')
    
    if (error instanceof Error) {
      logInfo(`Erreur: ${error.message}`)
    }
    
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n🚀 TEST DE CONNEXION LYGOS', 'bright')
  log('Ofika - Vérification de l\'intégration LyGOS\n', 'cyan')

  const results = {
    env: false,
    api: false,
    local: false,
  }

  // Étape 1: Variables d'environnement
  results.env = checkEnvironmentVariables()

  if (!results.env) {
    logError('\n❌ Configuration incomplète - Veuillez configurer les variables d\'environnement')
    logInfo('\nConsultez le fichier .env.example pour les variables requises')
    process.exit(1)
  }

  // Étape 2: Connexion API
  results.api = await testApiConnection()

  // Étape 3: Endpoint local (optionnel)
  results.local = await testLocalEndpoint()

  // Résumé
  logSection('RÉSUMÉ DES TESTS')
  
  logInfo(`Variables d'environnement: ${results.env ? '✅' : '❌'}`)
  logInfo(`Connexion API LyGOS: ${results.api ? '✅' : '❌'}`)
  logInfo(`Endpoint local: ${results.local ? '✅' : '⚠️  (serveur non démarré)'}`)

  if (results.env && results.api) {
    log('\n🎉 SUCCÈS: La connexion avec LyGOS fonctionne correctement!', 'green')
    log('\nVous pouvez maintenant utiliser LyGOS pour les paiements.\n', 'cyan')
    process.exit(0)
  } else {
    log('\n❌ ÉCHEC: Des problèmes ont été détectés', 'red')
    log('\nVeuillez corriger les erreurs ci-dessus avant de continuer.\n', 'yellow')
    process.exit(1)
  }
}

// Exécuter le script
main().catch((error) => {
  logError('\n💥 Erreur fatale lors de l\'exécution du script')
  console.error(error)
  process.exit(1)
})
