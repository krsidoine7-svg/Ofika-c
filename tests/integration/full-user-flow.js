// =====================================================
// TEST DU FLUX UTILISATEUR COMPLET
// =====================================================

const { 
  createTestProfile, 
  createTestOrder, 
  createTestContactAnalytics,
  cleanupTestData,
  runTest,
  runTests,
  supabase
} = require('../helpers/test-utils')

async function testFullUserFlow() {
  console.log('🚀 Test du flux utilisateur complet...\n')

  const tests = [
    {
      name: '1. Création de profil',
      fn: async () => {
        const profile = await createTestProfile({
          profile_name: 'Test User Flow',
          email: 'testflow@example.com'
        })
        
        if (!profile.id) {
          throw new Error('Profil non créé')
        }
        
        return { profile }
      }
    },
    {
      name: '2. Création de carte NFC',
      fn: async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'testflow@example.com')
          .single()

        if (!profile) {
          throw new Error('Profil non trouvé')
        }

        const nfcCard = {
          id: `nfc_${Date.now()}`,
          user_id: '00000000-0000-0000-0000-000000000000',
          profile_id: profile.id,
          profile_name: 'Test User Flow',
          nfc_link: 'https://ofika.com/test-user-flow',
          design_choice: 'classic',
          color_theme: 'black',
          status: 'active'
        }

        const { data, error } = await supabase
          .from('nfc_profiles')
          .insert(nfcCard)
          .select()
          .single()

        if (error) {
          throw new Error(`Erreur création carte NFC: ${error.message}`)
        }

        return { nfcCard: data }
      }
    },
    {
      name: '3. Passation de commande',
      fn: async () => {
        const order = await createTestOrder({
          card_type: 'nfc_qr',
          status: 'pending'
        })

        if (!order.id) {
          throw new Error('Commande non créée')
        }

        return { order }
      }
    },
    {
      name: '4. Simulation de paiement',
      fn: async () => {
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('status', 'pending')
          .single()

        if (!order) {
          throw new Error('Commande en attente non trouvée')
        }

        // Simuler la mise à jour du statut de paiement
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            lygos_payment_id: `lygos_${Date.now()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (error) {
          throw new Error(`Erreur mise à jour paiement: ${error.message}`)
        }

        return { orderId: order.id }
      }
    },
    {
      name: '5. Analytics de contact',
      fn: async () => {
        const analytics = await createTestContactAnalytics({
          action_type: 'vcard_generated',
          device_type: 'desktop'
        })

        if (!analytics.id) {
          throw new Error('Analytics non créés')
        }

        return { analytics }
      }
    },
    {
      name: '6. Vérification des statistiques',
      fn: async () => {
        const { data: stats, error } = await supabase
          .rpc('get_user_order_stats', { 
            user_uuid: '00000000-0000-0000-0000-000000000000' 
          })

        if (error) {
          throw new Error(`Erreur récupération stats: ${error.message}`)
        }

        if (!stats || stats.length === 0) {
          throw new Error('Aucune statistique trouvée')
        }

        return { stats: stats[0] }
      }
    }
  ]

  // Exécuter tous les tests
  const results = await runTests(tests)

  // Nettoyer les données de test
  console.log('\n🧹 Nettoyage des données de test...')
  await cleanupTestData('profiles', 'test')
  await cleanupTestData('nfc_profiles', 'nfc_')
  await cleanupTestData('orders', 'order_')
  await cleanupTestData('contact_analytics', 'analytics_')

  // Résumé final
  const successCount = results.filter(r => r.success).length
  const totalTests = results.length

  console.log('\n🎉 Test du flux utilisateur terminé !')
  console.log(`📊 Résultat: ${successCount}/${totalTests} tests réussis`)

  if (successCount === totalTests) {
    console.log('✅ Tous les tests sont passés ! Le flux utilisateur fonctionne correctement.')
  } else {
    console.log('❌ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.')
  }

  return results
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testFullUserFlow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Erreur fatale:', error)
      process.exit(1)
    })
}

module.exports = { testFullUserFlow }
