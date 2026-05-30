/**
 * Script de test pour la création de commandes
 * 
 * Usage:
 *   npx tsx scripts/test-order-creation.ts
 */

const ORDER_CREATION_DATA = {
  card_type: 'nfc_qr',
  quantity: 1,
  payment_method: 'lygos',
  shipping_address: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+225123456789',
    address: '123 Test Street',
    city: 'Test City',
    postalCode: '12345'
  }
}

async function testOrderCreation() {
  console.log('🧪 Test de création de commande')
  console.log('-'.repeat(50))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const response = await fetch(`${baseUrl}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ORDER_CREATION_DATA)
    })

    const result = await response.json()
    
    console.log(`Status: ${response.status}`)
    console.log('Response:', result)

    if (response.ok && result.success) {
      console.log('✅ Commande créée avec succès!')
      console.log('ID commande:', result.order.id)
      console.log('Numéro commande:', result.order.order_number)
      console.log('Montant:', result.order.total_amount, result.order.currency)
      return true
    } else {
      console.error('❌ Erreur lors de la création:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    return false
  }
}

// Exécuter le test
testOrderCreation().then((success) => {
  if (success) {
    console.log('\n✨ Test réussi !')
  } else {
    console.log('\n❌ Test échoué')
    process.exit(1)
  }
})
