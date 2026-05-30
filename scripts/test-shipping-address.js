require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testShippingAddressColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  console.log('🧪 Test de la colonne shipping_address...')

  try {
    // Tester si on peut sélectionner la colonne shipping_address
    const { data, error } = await supabase
      .from('orders')
      .select('id, shipping_address')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ La colonne shipping_address n\'existe pas encore.')
        console.log('📋 Veuillez exécuter cette commande SQL dans l\'interface Supabase:')
        console.log('')
        console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;')
        console.log('')
        console.log('Puis relancez ce script pour vérifier.')
        process.exit(1)
      } else {
        console.error('❌ Erreur inattendue:', error)
        process.exit(1)
      }
    } else {
      console.log('✅ La colonne shipping_address existe déjà !')
      console.log('📊 Données de test:', data)
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    process.exit(1)
  }
}

testShippingAddressColumn()
