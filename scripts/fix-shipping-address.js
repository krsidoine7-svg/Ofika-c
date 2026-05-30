require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes.')
    console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Lire le fichier SQL
  const migrationPath = path.join(__dirname, '..', 'database', '09-fixes', 'add-shipping-address-column.sql')
  const migrationSql = fs.readFileSync(migrationPath, 'utf8')

  console.log('🚀 Application de la migration: Ajout de la colonne shipping_address à la table orders.')

  try {
    // Exécuter chaque instruction SQL séparément
    const statements = migrationSql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 Exécution:', statement.trim().substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement.trim() })
        
        if (error) {
          console.error('❌ Erreur lors de l\'exécution:', error)
          console.error('Statement:', statement.trim())
          process.exit(1)
        }
      }
    }

    console.log('✅ Migration appliquée avec succès !')
    console.log('📋 La colonne shipping_address a été ajoutée à la table orders.')
    process.exit(0)

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'application de la migration:', error)
    process.exit(1)
  }
}

applyMigration()