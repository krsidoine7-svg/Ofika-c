/**
 * Script pour vérifier la configuration de la photo de couverture
 * Vérifie :
 * 1. Si la colonne cover_image_url existe dans la table profiles
 * 2. Si le bucket profile-images existe
 * 3. Si les politiques RLS sont correctes
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

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

async function checkCoverImageSetup() {
  console.log('🔍 Vérification de la configuration photo de couverture...\n')

  // 1. Vérifier la colonne dans la table profiles
  console.log('1️⃣ Vérification de la colonne cover_image_url...')
  const { data: columns, error: columnsError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (columnsError) {
    console.error('❌ Erreur lors de la vérification de la table:', columnsError.message)
  } else {
    const hasColumn = columns && columns.length > 0 && 'cover_image_url' in columns[0]
    if (hasColumn) {
      console.log('✅ La colonne cover_image_url existe dans la table profiles')
    } else {
      console.log('❌ La colonne cover_image_url N\'EXISTE PAS dans la table profiles')
      console.log('\n📝 Pour créer la colonne, exécutez dans Supabase SQL Editor:')
      console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;')
    }
  }

  // 2. Vérifier le bucket Storage
  console.log('\n2️⃣ Vérification du bucket profile-images...')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ Erreur lors de la vérification des buckets:', bucketsError.message)
  } else {
    const profileImagesBucket = buckets?.find(b => b.name === 'profile-images')
    if (profileImagesBucket) {
      console.log('✅ Le bucket profile-images existe')
      console.log('   - Public:', profileImagesBucket.public)
      console.log('   - ID:', profileImagesBucket.id)
    } else {
      console.log('❌ Le bucket profile-images N\'EXISTE PAS')
      console.log('\n📝 Pour créer le bucket:')
      console.log('1. Allez sur Supabase Dashboard > Storage')
      console.log('2. Cliquez sur "New bucket"')
      console.log('3. Nom: profile-images')
      console.log('4. Public: OUI')
      console.log('5. Créer')
    }
  }

  // 3. Tester l'upload d'un fichier
  console.log('\n3️⃣ Test d\'upload...')
  const testFileName = `test-${Date.now()}.txt`
  const testContent = 'Test upload'
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(testFileName, testContent, {
      contentType: 'text/plain',
      upsert: false
    })

  if (uploadError) {
    console.error('❌ Erreur lors du test d\'upload:', uploadError.message)
    console.error('   Code:', uploadError.name)
    
    if (uploadError.message.includes('not found')) {
      console.log('\n💡 Le bucket n\'existe pas. Créez-le dans Supabase Dashboard.')
    } else if (uploadError.message.includes('permission')) {
      console.log('\n💡 Problème de permissions. Vérifiez les politiques RLS du bucket.')
    }
  } else {
    console.log('✅ Test d\'upload réussi')
    console.log('   Fichier:', uploadData.path)
    
    // Nettoyer le fichier de test
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove([testFileName])
    
    if (!deleteError) {
      console.log('✅ Fichier de test nettoyé')
    }
  }

  // 4. Vérifier les politiques RLS
  console.log('\n4️⃣ Vérification des politiques RLS...')
  console.log('⚠️  Vérifiez manuellement dans Supabase Dashboard > Storage > profile-images > Policies')
  console.log('   Politiques recommandées:')
  console.log('   - INSERT: Utilisateurs authentifiés peuvent uploader')
  console.log('   - SELECT: Public (pour afficher les images)')
  console.log('   - UPDATE: Propriétaire uniquement')
  console.log('   - DELETE: Propriétaire uniquement')

  console.log('\n✅ Vérification terminée!')
}

checkCoverImageSetup().catch(console.error)
