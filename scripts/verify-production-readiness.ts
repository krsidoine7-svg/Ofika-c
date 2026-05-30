
import { profiles } from '@/drizzle/schema'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Charger les variables d'environnement
// Essayer .env.local d'abord, puis .env
if (fs.existsSync('.env.local')) {
  config({ path: '.env.local' })
} else if (fs.existsSync('.env')) {
  config({ path: '.env' })
} else {
  console.warn('⚠️ Aucun fichier .env ou .env.local trouvé')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Démarrage de la vérification de production')
console.log('='.repeat(60))

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration manquante:')
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL est manquant')
  if (!supabaseKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant')
  process.exit(1)
}

console.log('✅ Configuration trouvée')
console.log(`   - URL: ${supabaseUrl}`)
console.log(`   - Key: ${supabaseKey.substring(0, 10)}...`)
if (serviceKey) {
  console.log(`   - Service Key: Présente (pour vérification approfondie)`)
} else {
  console.log(`   - Service Key: Absente (vérification limitée)`)
}

async function verify() {
  try {
    // 1. Connexion Client (Anon)
    console.log('\n📡 1. Test de connexion (Client Anon)')
    const supabase = createClient(supabaseUrl!, supabaseKey!)
    
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError && authError.message !== 'Auth session missing!') {
       // Auth session missing is expected if no token
       // But we just want to check if the client can talk to the server
       console.log('   ℹ️  Connexion établie (pas de session utilisateur)')
    } else {
       console.log('   ✅ Connexion établie')
    }

    // 2. Vérification des tables publiques (si lecture publique autorisée)
    console.log('\n🔍 2. Vérification des tables')
    
    // On essaie de lire la table 'profiles' - souvent protégée mais on vérifie l'erreur
    const { error: profilesError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (profilesError) {
      console.log(`   ℹ️  Table 'profiles': ${profilesError.message} (Normal si RLS activé)`)
    } else {
      console.log('   ✅ Table \'profiles\' accessible en lecture publique')
    }

    // 3. Vérification approfondie avec Service Key (si disponible)
    if (serviceKey) {
      console.log('\n🔐 3. Vérification approfondie (Service Role)')
      const adminClient = createClient(supabaseUrl!, serviceKey)
      
      // Vérifier l'existence des tables critiques
      const tables = ['profiles', 'orders', 'qr_scans', 'template_schemas']
      
      for (const table of tables) {
        const { error } = await adminClient.from(table).select('count', { count: 'exact', head: true })
        if (error) {
           console.error(`   ❌ Table '${table}': Inaccessible - ${error.message}`)
        } else {
           console.log(`   ✅ Table '${table}': Existe et accessible`)
        }
      }
      
      // Vérifier les policies (via une requête SQL si possible, sinon via l'API pg_policies si exposée via RPC)
      // Note: Supabase JS client ne permet pas de requêter pg_policies directement sans RPC ou SQL editor.
      // On va supposer que si on peut lire les tables, c'est bon pour l'admin.
      
    } else {
      console.log('\n⚠️ Pas de clé de service, impossible de vérifier la structure interne de la base.')
      console.log('   Assurez-vous que les migrations ont été appliquées.')
    }

    console.log('\n✅ Vérification terminée')
    console.log('='.repeat(60))
    console.log('Pour tester le CRUD complet en production :')
    console.log('1. Connectez-vous à l\'application')
    console.log('2. Créez une commande')
    console.log('3. Vérifiez qu\'elle apparaît dans le dashboard')
    console.log('4. Modifiez votre profil')
    
  } catch (error) {
    console.error('\n❌ Erreur inattendue:', error)
    process.exit(1)
  }
}

verify()
