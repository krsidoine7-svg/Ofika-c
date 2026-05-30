require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function addShippingAddressColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes.')
    console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  console.log('🚀 Ajout de la colonne shipping_address à la table orders...')

  try {
    // Vérifier d'abord si la colonne existe déjà
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'orders')
      .eq('column_name', 'shipping_address')

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      process.exit(1)
    }

    if (columns && columns.length > 0) {
      console.log('✅ La colonne shipping_address existe déjà.')
      process.exit(0)
    }

    // Ajouter la colonne via une requête SQL directe
    const { error } = await supabase
      .rpc('exec', { 
        sql: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;' 
      })

    if (error) {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', error)
      
      // Essayer une approche alternative
      console.log('🔄 Tentative alternative...')
      
      // Créer un test pour voir si la colonne peut être ajoutée
      const testResult = await supabase
        .from('orders')
        .select('shipping_address')
        .limit(1)

      if (testResult.error && testResult.error.code === 'PGRST116') {
        console.log('📝 La colonne n\'existe pas encore. Veuillez l\'ajouter manuellement via l\'interface Supabase.')
        console.log('📋 SQL à exécuter:')
        console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;')
        process.exit(0)
      } else {
        console.log('✅ La colonne shipping_address semble déjà exister.')
        process.exit(0)
      }
    } else {
      console.log('✅ Colonne shipping_address ajoutée avec succès !')
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    console.log('📝 Veuillez ajouter manuellement la colonne via l\'interface Supabase:')
    console.log('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;')
    process.exit(1)
  }
}

addShippingAddressColumn()
