/**
 * Script pour vérifier si le bucket profile-images existe dans Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBucket() {
  console.log('🔍 Vérification du bucket profile-images...\n')

  try {
    // Lister tous les buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError.message)
      return
    }

    console.log(`📦 Buckets trouvés: ${buckets?.length || 0}\n`)

    // Chercher le bucket profile-images
    const profileImagesBucket = buckets?.find(b => b.name === 'profile-images')

    if (profileImagesBucket) {
      console.log('✅ Le bucket profile-images existe !')
      console.log('\n📋 Détails du bucket:')
      console.log(`   - Nom: ${profileImagesBucket.name}`)
      console.log(`   - ID: ${profileImagesBucket.id}`)
      console.log(`   - Public: ${profileImagesBucket.public ? 'Oui ✅' : 'Non ❌'}`)
      console.log(`   - Taille max fichier: ${profileImagesBucket.file_size_limit ? `${profileImagesBucket.file_size_limit / 1024 / 1024}MB` : 'Illimitée'}`)
      console.log(`   - Types MIME autorisés: ${profileImagesBucket.allowed_mime_types?.join(', ') || 'Tous'}`)
      console.log(`   - Créé le: ${profileImagesBucket.created_at}`)
      console.log(`   - Mis à jour le: ${profileImagesBucket.updated_at}`)

      // Tester l'accès au bucket
      console.log('\n🧪 Test d\'accès au bucket...')
      const { data: files, error: listError } = await supabase.storage
        .from('profile-images')
        .list('', { limit: 1 })

      if (listError) {
        console.error('❌ Erreur lors de l\'accès au bucket:', listError.message)
      } else {
        console.log('✅ Accès au bucket réussi')
        console.log(`   - Fichiers dans le bucket: ${files?.length || 0} (affichage limité à 1)`)
      }
    } else {
      console.log('❌ Le bucket profile-images N\'EXISTE PAS')
      console.log('\n📝 Pour créer le bucket:')
      console.log('1. Allez sur Supabase Dashboard > Storage')
      console.log('2. Cliquez sur "New bucket"')
      console.log('3. Nom: profile-images')
      console.log('4. Cochez "Public bucket"')
      console.log('5. Taille max: 5MB')
      console.log('6. Types MIME: image/jpeg, image/png, image/gif, image/webp')
      console.log('\nOU exécutez ce SQL dans Supabase SQL Editor:')
      console.log(`
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
      `)
    }

    // Afficher tous les buckets pour référence
    if (buckets && buckets.length > 0) {
      console.log('\n📦 Tous les buckets disponibles:')
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'privé'})`)
      })
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
  }
}

checkBucket()
  .then(() => {
    console.log('\n✅ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })

