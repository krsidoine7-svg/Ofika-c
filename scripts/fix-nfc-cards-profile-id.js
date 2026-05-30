#!/usr/bin/env node

/**
 * Script pour corriger les cartes NFC sans profile_id
 * 
 * Ce script :
 * 1. Met à jour les cartes NFC sans profile_id
 * 2. Ajoute la contrainte NOT NULL
 * 3. Crée l'index pour les performances
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixNFCCardsProfileId() {
  console.log('🔧 Début de la correction des cartes NFC sans profile_id...')
  
  try {
    // 1. Vérifier les cartes NFC sans profile_id
    console.log('📋 Vérification des cartes NFC sans profile_id...')
    const { data: nfcCardsWithoutProfile, error: nfcError } = await supabase
      .from('nfc_profiles')
      .select('id, user_id, profile_id')
      .or('profile_id.is.null,profile_id.eq.')
    
    if (nfcError) {
      console.error('❌ Erreur lors de la vérification des cartes NFC:', nfcError)
      return
    }
    
    console.log(`📊 ${nfcCardsWithoutProfile.length} cartes NFC sans profile_id trouvées`)
    
    if (nfcCardsWithoutProfile.length > 0) {
      console.log('🔄 Mise à jour des cartes NFC sans profile_id...')
      
      // Pour chaque carte NFC sans profile_id, trouver le premier profil de l'utilisateur
      for (const card of nfcCardsWithoutProfile) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', card.user_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()
        
        if (profileError || !userProfile) {
          console.warn(`⚠️ Aucun profil trouvé pour l'utilisateur ${card.user_id} (carte ${card.id})`)
          continue
        }
        
        // Mettre à jour la carte NFC avec le profile_id
        const { error: updateError } = await supabase
          .from('nfc_profiles')
          .update({ profile_id: userProfile.id })
          .eq('id', card.id)
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de la carte ${card.id}:`, updateError)
        } else {
          console.log(`✅ Carte ${card.id} mise à jour avec profile_id ${userProfile.id}`)
        }
      }
    }
    
    // 2. Vérifier s'il reste des cartes sans profile_id
    const { data: remainingCards, error: remainingError } = await supabase
      .from('nfc_profiles')
      .select('id')
      .or('profile_id.is.null,profile_id.eq.')
    
    if (remainingError) {
      console.error('❌ Erreur lors de la vérification finale:', remainingError)
      return
    }
    
    if (remainingCards.length > 0) {
      console.warn(`⚠️ ATTENTION: ${remainingCards.length} cartes NFC restent sans profile_id`)
      console.log('Ces cartes doivent être traitées manuellement ou supprimées')
      return
    }
    
    // 3. Ajouter la contrainte NOT NULL
    console.log('🔒 Ajout de la contrainte NOT NULL sur profile_id...')
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE nfc_profiles ALTER COLUMN profile_id SET NOT NULL;'
    })
    
    if (constraintError) {
      console.error('❌ Erreur lors de l\'ajout de la contrainte:', constraintError)
      console.log('💡 Veuillez exécuter manuellement :')
      console.log('   ALTER TABLE nfc_profiles ALTER COLUMN profile_id SET NOT NULL;')
      return
    }
    
    console.log('✅ Contrainte NOT NULL ajoutée avec succès')
    
    // 4. Créer l'index
    console.log('📊 Création de l\'index sur profile_id...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id ON nfc_profiles (profile_id);'
    })
    
    if (indexError) {
      console.error('❌ Erreur lors de la création de l\'index:', indexError)
      console.log('💡 Veuillez exécuter manuellement :')
      console.log('   CREATE INDEX IF NOT EXISTS idx_nfc_profiles_profile_id ON nfc_profiles (profile_id);')
    } else {
      console.log('✅ Index créé avec succès')
    }
    
    // 5. Vérification finale
    console.log('🎯 Vérification finale...')
    const { data: finalCheck, error: finalError } = await supabase
      .from('nfc_profiles')
      .select('id, profile_id')
      .limit(5)
    
    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError)
      return
    }
    
    console.log('📋 Exemple de cartes NFC après correction:', finalCheck)
    console.log('🎉 Correction terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

// Exécuter le script
fixNFCCardsProfileId()
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
