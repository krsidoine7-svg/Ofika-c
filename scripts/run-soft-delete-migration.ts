import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
  const sqlFile = path.resolve('database/reviews/05-add-soft-delete-reviews.sql')
  const sql = fs.readFileSync(sqlFile, 'utf8')
  
  console.log('⚡ Tentative d\'exécution de la migration SQL via RPC...')
  const { error } = await supabase.rpc('exec_sql', { sql })
  
  if (error) {
    console.error('❌ Impossible d\'exécuter la migration via RPC:', error.message)
    console.log('\n💡 VEUILLEZ COPIER ET COLLER LE CONTENU DU FICHIER SUIVANT DANS VOTRE SQL EDITOR SUPABASE :')
    console.log(`📍 Fichier : ${sqlFile}\n`)
    console.log(sql)
  } else {
    console.log('✅ Migration SQL appliquée avec succès via RPC !')
  }
}

run()
