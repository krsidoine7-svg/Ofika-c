// =====================================================
// TEST DE CONNEXION À LA BASE DE DONNÉES
// =====================================================

const { createClient } = require('@supabase/supabase-js')

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔌 Test de connexion à la base de données...\n')

  try {
    // 1. Test de connexion basique
    console.log('1️⃣ Test de connexion basique...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️  Pas d\'utilisateur connecté (normal pour les tests)')
    } else {
      console.log('✅ Connexion authentifiée:', user?.email || 'Anonyme')
    }

    // 2. Test des tables principales
    console.log('\n2️⃣ Test des tables principales...')
    const tables = ['profiles', 'nfc_profiles', 'orders', 'payment_methods', 'contact_analytics']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: ${data?.length || 0} enregistrements`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Erreur de connexion`)
      }
    }

    // 3. Test des fonctions RPC
    console.log('\n3️⃣ Test des fonctions RPC...')
    const rpcFunctions = [
      'get_user_order_stats',
      'cleanup_expired_orders'
    ]
    
    for (const func of rpcFunctions) {
      try {
        const { data, error } = await supabase
          .rpc(func, { user_uuid: '00000000-0000-0000-0000-000000000000' })
        
        if (error) {
          console.log(`⚠️  Fonction ${func}: ${error.message}`)
        } else {
          console.log(`✅ Fonction ${func}: Exécutée avec succès`)
        }
      } catch (err) {
        console.log(`❌ Fonction ${func}: Erreur d'exécution`)
      }
    }

    // 4. Test des politiques RLS
    console.log('\n4️⃣ Test des politiques RLS...')
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', tables)

    if (policiesError) {
      console.log('⚠️  Impossible de vérifier les politiques RLS')
    } else {
      console.log(`✅ Politiques RLS: ${policies.length} politiques trouvées`)
    }

    // 5. Test de performance
    console.log('\n5️⃣ Test de performance...')
    const startTime = Date.now()
    
    const { data: profiles, error: perfError } = await supabase
      .from('profiles')
      .select('id, profile_name, created_at')
      .limit(10)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (perfError) {
      console.log('❌ Test de performance échoué:', perfError.message)
    } else {
      console.log(`✅ Test de performance: ${duration}ms pour 10 profils`)
      
      if (duration > 1000) {
        console.log('⚠️  Performance lente détectée (>1s)')
      }
    }

    console.log('\n🎉 Test de connexion terminé !')
    console.log('\n📋 Résumé:')
    console.log(`   - Connexion: ${authError ? '⚠️' : '✅'}`)
    console.log(`   - Tables: ${tables.length} testées`)
    console.log(`   - Fonctions RPC: ${rpcFunctions.length} testées`)
    console.log(`   - Performance: ${duration}ms`)

  } catch (error) {
    console.error('💥 Erreur lors du test de connexion:', error)
    process.exit(1)
  }
}

// Exécuter le test
testDatabaseConnection()
