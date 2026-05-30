/**
 * Script de test simple pour la création de commande
 * 
 * Usage:
 *   npx tsx scripts/test-simple-order.ts
 */

const SIMPLE_ORDER_DATA = {
  card_type: 'nfc_qr',
  quantity: 1,
  payment_method: 'lygos',
  shipping_address: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+225123456789',
    address: '123 Test Street',
    city: 'Abidjan',
    postalCode: '00225'
  }
}

async function testSimpleOrder() {
  console.log('🧪 Test simple de création de commande')
  console.log('-'.repeat(50))
  console.log('Données envoyées:', JSON.stringify(SIMPLE_ORDER_DATA, null, 2))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SIMPLE_ORDER_DATA)
    })

    const result = await response.json()
    
    console.log(`\nStatus: ${response.status}`)
    console.log('Response:', JSON.stringify(result, null, 2))

    if (response.ok && result.success) {
      console.log('\n✅ Commande créée avec succès!')
      console.log('📋 Détails:')
      console.log(`   ID: ${result.order.id}`)
      console.log(`   Numéro: ${result.order.order_number}`)
      console.log(`   Montant: ${result.order.total_amount} ${result.order.currency}`)
      console.log(`   Type: ${result.order.card_type}`)
      console.log(`   Quantité: ${result.order.quantity}`)
      return true
    } else {
      console.error('\n❌ Erreur lors de la création:')
      console.error(`   Message: ${result.error}`)
      if (result.details) {
        console.error('   Détails:', JSON.stringify(result.details, null, 2))
      }
      return false
    }
  } catch (error) {
    console.error('\n❌ Erreur réseau:', error)
    return false
  }
}

// Exécuter le test
testSimpleOrder().then((success) => {
  if (success) {
    console.log('\n✨ Test réussi ! La création de commande fonctionne parfaitement.')
  } else {
    console.log('\n❌ Test échoué - Vérifiez les logs ci-dessus')
    process.exit(1)
  }
})
