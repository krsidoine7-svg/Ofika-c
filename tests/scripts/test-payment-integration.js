// =====================================================
// SCRIPT DE TEST - INTÉGRATION PAIEMENTS
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase (remplacer par vos vraies clés)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPaymentIntegration() {
  console.log('🧪 Test d\'intégration des paiements...\n')

  try {
    // 1. Vérifier les tables
    console.log('1️⃣ Vérification des tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['orders', 'payment_methods'])

    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError)
      return
    }

    console.log('✅ Tables trouvées:', tables.map(t => t.table_name))

    // 2. Vérifier les méthodes de paiement
    console.log('\n2️⃣ Vérification des méthodes de paiement...')
    
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')

    if (methodsError) {
      console.error('❌ Erreur lors de la récupération des méthodes de paiement:', methodsError)
      return
    }

    console.log('✅ Méthodes de paiement:', paymentMethods.length)
    paymentMethods.forEach(method => {
      console.log(`   - ${method.name} (${method.provider})`)
    })

    // 3. Tester la création d'une commande (simulation)
    console.log('\n3️⃣ Test de création de commande...')
    
    // Note: Ce test nécessite une authentification
    console.log('⚠️  Test de création de commande nécessite une authentification')
    console.log('   Pour tester complètement, utilisez l\'interface web')

    // 4. Vérifier les fonctions RPC
    console.log('\n4️⃣ Test des fonctions RPC...')
    
    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_user_order_stats', { user_uuid: '00000000-0000-0000-0000-000000000000' })

      if (statsError) {
        console.log('⚠️  Fonction RPC testée (erreur attendue sans utilisateur):', statsError.message)
      } else {
        console.log('✅ Fonction RPC fonctionnelle')
      }
    } catch (error) {
      console.log('⚠️  Fonction RPC non accessible:', error.message)
    }

    // 5. Vérifier les politiques RLS
    console.log('\n5️⃣ Vérification des politiques RLS...')
    
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['orders', 'payment_methods'])

    if (policiesError) {
      console.log('⚠️  Impossible de vérifier les politiques RLS:', policiesError.message)
    } else {
      console.log('✅ Politiques RLS trouvées:', policies.length)
    }

    console.log('\n🎉 Test d\'intégration terminé !')
    console.log('\n📋 Prochaines étapes:')
    console.log('   1. Exécuter le script SQL dans Supabase')
    console.log('   2. Démarrer l\'application: npm run dev')
    console.log('   3. Tester le flux complet via l\'interface web')
    console.log('   4. Vérifier les webhooks Lygos')

  } catch (error) {
    console.error('💥 Erreur lors du test:', error)
  }
}

// Exécuter le test
testPaymentIntegration()
