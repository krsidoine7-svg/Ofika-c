// =====================================================
// TEST DES ENDPOINTS API
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testApiEndpoints() {
  console.log('🌐 Test des endpoints API...\n')

  const endpoints = [
    {
      name: 'Webhook Lygos',
      url: `${appUrl}/api/webhooks/lygos`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Webhook Lygos POST',
      url: `${appUrl}/api/webhooks/lygos`,
      method: 'POST',
      expectedStatus: 400, // Attendu car pas de payload
      headers: {
        'Content-Type': 'application/json'
      },
      body: {}
    }
  ]

  for (const endpoint of endpoints) {
    console.log(`🔍 Test: ${endpoint.name}`)
    console.log(`   URL: ${endpoint.url}`)
    console.log(`   Méthode: ${endpoint.method}`)

    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers
        }
      }

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body)
      }

      const response = await fetch(endpoint.url, options)
      const status = response.status
      const isSuccess = status === endpoint.expectedStatus

      console.log(`   Statut: ${status} ${isSuccess ? '✅' : '❌'}`)
      
      if (!isSuccess) {
        console.log(`   Attendu: ${endpoint.expectedStatus}`)
      }

      // Tenter de lire la réponse
      try {
        const data = await response.text()
        if (data) {
          console.log(`   Réponse: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`)
        }
      } catch (err) {
        console.log('   Réponse: (non lisible)')
      }

    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }

    console.log('')
  }

  // Test des services Supabase
  console.log('🔍 Test des services Supabase...\n')

  try {
    // Test de récupération des profils
    console.log('1️⃣ Test: Récupération des profils')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, profile_name, created_at')
      .limit(5)

    if (profilesError) {
      console.log(`   ❌ Erreur: ${profilesError.message}`)
    } else {
      console.log(`   ✅ ${profiles.length} profils récupérés`)
    }

    // Test de récupération des méthodes de paiement
    console.log('\n2️⃣ Test: Récupération des méthodes de paiement')
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)

    if (methodsError) {
      console.log(`   ❌ Erreur: ${methodsError.message}`)
    } else {
      console.log(`   ✅ ${paymentMethods.length} méthodes de paiement récupérées`)
      paymentMethods.forEach(method => {
        console.log(`      - ${method.name} (${method.provider})`)
      })
    }

    // Test de récupération des commandes
    console.log('\n3️⃣ Test: Récupération des commandes')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, card_type, status, total_price, created_at')
      .limit(5)

    if (ordersError) {
      console.log(`   ❌ Erreur: ${ordersError.message}`)
    } else {
      console.log(`   ✅ ${orders.length} commandes récupérées`)
    }

    // Test des analytics de contacts
    console.log('\n4️⃣ Test: Récupération des analytics de contacts')
    const { data: analytics, error: analyticsError } = await supabase
      .from('contact_analytics')
      .select('*')
      .limit(5)

    if (analyticsError) {
      console.log(`   ❌ Erreur: ${analyticsError.message}`)
    } else {
      console.log(`   ✅ ${analytics.length} analytics récupérés`)
    }

  } catch (error) {
    console.error('💥 Erreur lors des tests Supabase:', error)
  }

  console.log('\n🎉 Test des endpoints terminé !')
  console.log('\n📋 Pour tester complètement:')
  console.log('   1. Démarrer l\'application: npm run dev')
  console.log('   2. Tester manuellement les pages web')
  console.log('   3. Vérifier les logs dans la console')
}

// Exécuter le test
testApiEndpoints()
