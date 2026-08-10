import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function debugLinks() {
  console.log('🔍 Récupération de tous les liens de collecte dans la table review_links...')
  
  const { data: links, error } = await supabase
    .from('review_links')
    .select('*')

  if (error) {
    console.error('❌ Erreur Supabase:', error.message)
    return
  }

  console.log(`📊 Nombre de liens trouvés : ${links ? links.length : 0}`)
  if (links && links.length > 0) {
    links.forEach(l => {
      console.log(`- ID: ${l.id} | Slug: "${l.slug}" | Titre: "${l.title}" | Actif: ${l.is_active} | User ID: ${l.user_id}`)
    })
  } else {
    console.log('ℹ️ Aucun lien trouvé dans la table review_links.')
  }
}

debugLinks()
