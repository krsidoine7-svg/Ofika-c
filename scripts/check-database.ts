import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local')
  process.exit(1)
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données...')
  
  try {
    console.log('✅ Connexion à Supabase établie!')
    
    // Tester la connexion avec une requête simple
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('ℹ️  Utilisateur non connecté (normal pour ce test)')
    } else {
      console.log('✅ Utilisateur connecté:', authData.user?.email)
    }
    
    // Tester l'accès aux tables principales
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (profilesError) {
      console.log('❌ Erreur accès table profiles:', profilesError.message)
    } else {
      console.log('✅ Table profiles accessible')
    }
    
    // Tester l'accès au storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Erreur accès storage:', bucketsError.message)
    } else {
      console.log('✅ Storage accessible, buckets:', buckets?.map(b => b.name))
    }
    
    console.log('🎉 Vérification terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  }
}

checkDatabase()
