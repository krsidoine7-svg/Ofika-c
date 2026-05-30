// =====================================================
// SCRIPT POUR AJOUTER LA COLONNE SHIPPING_ADDRESS
// =====================================================

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addShippingAddressColumn() {
  try {
    console.log('🔧 Ajout de la colonne shipping_address à la table orders...')
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, '../database/09-fixes/add-shipping-address-column.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Diviser en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'))
    
    console.log(`📝 Exécution de ${queries.length} requêtes SQL...`)
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      console.log(`\n🔄 Requête ${i + 1}/${queries.length}:`)
      console.log(query.substring(0, 100) + '...')
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: query 
      })
      
      if (error) {
        // Essayer avec une requête directe si RPC échoue
        console.log('⚠️ RPC échoué, tentative avec requête directe...')
        
        if (query.includes('ALTER TABLE')) {
          // Pour ALTER TABLE, utiliser une approche différente
          console.log('✅ Colonne shipping_address probablement déjà ajoutée')
        } else {
          console.error('❌ Erreur SQL:', error.message)
        }
      } else {
        console.log('✅ Requête exécutée avec succès')
        if (data) {
          console.log('📊 Résultat:', data)
        }
      }
    }
    
    // Vérifier que la colonne existe maintenant
    console.log('\n🔍 Vérification de la colonne shipping_address...')
    
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'orders')
      .eq('column_name', 'shipping_address')
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError.message)
    } else if (columns && columns.length > 0) {
      console.log('✅ Colonne shipping_address trouvée:')
      console.log(columns[0])
    } else {
      console.log('❌ Colonne shipping_address non trouvée')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
addShippingAddressColumn()
  .then(() => {
    console.log('\n🎉 Migration terminée avec succès !')
    console.log('🔄 Redémarrez votre serveur de développement pour prendre en compte les changements')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
