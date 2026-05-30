/**
 * Script de test complet pour l'API de création de commandes
 * Teste toutes les validations, erreurs et cas limites
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

// =====================================================
// DONNÉES DE TEST
// =====================================================

const validOrderData = {
  card_type: 'nfc_qr' as const,
  quantity: 1,
  payment_method: 'lygos' as const,
  shipping_address: {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+2250102030405',
    address: '123 Avenue des Champs',
    city: 'Abidjan',
    postalCode: '00225'
  }
}

const invalidOrderData = {
  card_type: 'invalid_type' as any,
  quantity: -1,
  payment_method: 'invalid_payment' as any,
  shipping_address: {
    name: '', // Trop court
    email: 'invalid-email', // Email invalide
    phone: '123', // Trop court
    address: 'abc', // Trop court
    city: '', // Vide
  }
}

// =====================================================
// FONCTIONS DE TEST
// =====================================================

async function testEndpoint(url: string, method: string = 'GET', body?: any, description: string = '') {
  console.log(`\n🧪 ${description}`)
  console.log(`📡 ${method} ${url}`)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json().catch(() => null)

    console.log(`📊 Status: ${response.status}`)
    console.log(`📋 Response:`, data)

    return { response, data, success: response.ok }
  } catch (error) {
    console.error(`❌ Erreur réseau:`, error)
    return { response: null, data: null, success: false, error }
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests API de commandes')
  console.log('='.repeat(60))

  // Test 1: Récupération des commandes (GET)
  await testEndpoint(
    `${API_BASE_URL}/api/orders/create`,
    'GET',
    undefined,
    'Test GET - Récupération des commandes'
  )

  // Test 2: Création de commande valide (POST)
  await testEndpoint(
    `${API_BASE_URL}/api/orders/create`,
    'POST',
    validOrderData,
    'Test POST - Création de commande valide'
  )

  // Test 3: Création de commande invalide (POST)
  await testEndpoint(
    `${API_BASE_URL}/api/orders/create`,
    'POST',
    invalidOrderData,
    'Test POST - Création de commande invalide'
  )

  // Test 4: Rate limiting
  console.log('\n🧪 Test Rate Limiting')
  const rateLimitPromises = Array(10).fill(null).map((_, i) =>
    testEndpoint(
      `${API_BASE_URL}/api/orders/create`,
      'POST',
      validOrderData,
      `Test Rate Limit - Requête ${i + 1}`
    )
  )

  // Attendre un peu entre les requêtes pour éviter le rate limiting immédiat
  for (const promise of rateLimitPromises) {
    await promise
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Test 5: Données malformées
  await testEndpoint(
    `${API_BASE_URL}/api/orders/create`,
    'POST',
    '{ invalid json',
    'Test POST - JSON malformé'
  )

  // Test 6: Méthode non autorisée
  await testEndpoint(
    `${API_BASE_URL}/api/orders/create`,
    'PUT',
    undefined,
    'Test PUT - Méthode non autorisée'
  )

  console.log('\n✅ Tests terminés')
  console.log('='.repeat(60))
}

// =====================================================
// EXÉCUTION
// =====================================================

if (require.main === module) {
  runTests().catch(console.error)
}

export { runTests }
