#!/usr/bin/env node

/**
 * Script pour corriger la contrainte profile_id dans la table orders
 * 
 * Ce script :
 * 1. Ajoute la colonne profile_id si elle n'existe pas
 * 2. Met à jour les commandes existantes sans profile_id
 * 3. Ajoute la contrainte NOT NULL
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

async function fixProfileIdConstraint() {
  console.log('🔧 Début de la correction de la contrainte profile_id...')
  
  try {
    // 1. Vérifier les commandes existantes
    console.log('📋 Vérification des commandes existantes...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id')
      .limit(5)
    
    if (ordersError) {
      console.error('❌ Erreur lors de la vérification des commandes:', ordersError)
      console.log('💡 Essayons d\'ajouter la colonne profile_id directement...')
      
      // Essayer d'ajouter la colonne directement
      try {
        const { error: addColumnError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
          `
        })
        
        if (addColumnError) {
          console.error('❌ Erreur lors de l\'ajout de la colonne:', addColumnError)
          console.log('💡 Essayons une approche différente...')
          
          // Essayer avec une requête SQL directe
          const { error: directError } = await supabase
            .from('orders')
            .select('profile_id')
            .limit(1)
          
          if (directError && directError.message.includes('column "profile_id" does not exist')) {
            console.log('🔍 La colonne profile_id n\'existe pas encore')
            console.log('📝 Veuillez exécuter manuellement les migrations SQL suivantes :')
            console.log('')
            console.log('1. Ajoutez la colonne :')
            console.log('   ALTER TABLE orders ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;')
            console.log('')
            console.log('2. Créez l\'index :')
            console.log('   CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders (profile_id);')
            console.log('')
            console.log('3. Mettez à jour les données existantes :')
            console.log('   UPDATE orders SET profile_id = (SELECT p.id FROM profiles p WHERE p.user_id = orders.user_id ORDER BY p.created_at ASC LIMIT 1) WHERE profile_id IS NULL;')
            console.log('')
            console.log('4. Ajoutez la contrainte NOT NULL :')
            console.log('   ALTER TABLE orders ALTER COLUMN profile_id SET NOT NULL;')
            console.log('')
            return
          }
        } else {
          console.log('✅ Colonne profile_id ajoutée avec succès')
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la colonne:', error)
        return
      }
    } else {
      console.log(`📊 ${orders.length} commandes trouvées`)
    }
    
    // 2. Vérifier les commandes sans profile_id
    console.log('🔍 Vérification des commandes sans profile_id...')
    const { data: ordersWithoutProfile, error: ordersError2 } = await supabase
      .from('orders')
      .select('id, user_id, profile_id')
      .is('profile_id', null)
    
    if (ordersError2) {
      console.error('❌ Erreur lors de la vérification des commandes:', ordersError2)
      return
    }
    
    console.log(`📊 ${ordersWithoutProfile.length} commandes sans profile_id trouvées`)
    
    if (ordersWithoutProfile.length > 0) {
      console.log('🔄 Mise à jour des commandes sans profile_id...')
      
      // Pour chaque commande sans profile_id, trouver le premier profil de l'utilisateur
      for (const order of ordersWithoutProfile) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', order.user_id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()
        
        if (profileError || !userProfile) {
          console.warn(`⚠️ Aucun profil trouvé pour l'utilisateur ${order.user_id} (commande ${order.id})`)
          continue
        }
        
        // Mettre à jour la commande avec le profile_id
        const { error: updateError } = await supabase
          .from('orders')
          .update({ profile_id: userProfile.id })
          .eq('id', order.id)
        
        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de la commande ${order.id}:`, updateError)
        } else {
          console.log(`✅ Commande ${order.id} mise à jour avec profile_id ${userProfile.id}`)
        }
      }
    }
    
    // 3. Vérifier s'il reste des commandes sans profile_id
    const { data: remainingOrders, error: remainingError } = await supabase
      .from('orders')
      .select('id')
      .is('profile_id', null)
    
    if (remainingError) {
      console.error('❌ Erreur lors de la vérification finale:', remainingError)
      return
    }
    
    if (remainingOrders.length > 0) {
      console.warn(`⚠️ ATTENTION: ${remainingOrders.length} commandes restent sans profile_id`)
      console.log('Ces commandes doivent être traitées manuellement ou supprimées')
      return
    }
    
    // 4. Ajouter la contrainte NOT NULL
    console.log('🔒 Ajout de la contrainte NOT NULL sur profile_id...')
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE orders ALTER COLUMN profile_id SET NOT NULL;'
    })
    
    if (constraintError) {
      console.error('❌ Erreur lors de l\'ajout de la contrainte:', constraintError)
      console.log('💡 Veuillez exécuter manuellement :')
      console.log('   ALTER TABLE orders ALTER COLUMN profile_id SET NOT NULL;')
      return
    }
    
    console.log('✅ Contrainte NOT NULL ajoutée avec succès')
    
    // 5. Vérification finale
    console.log('🎯 Vérification finale...')
    const { data: finalCheck, error: finalError } = await supabase
      .from('orders')
      .select('id, profile_id')
      .limit(5)
    
    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError)
      return
    }
    
    console.log('📋 Exemple de commandes après correction:', finalCheck)
    console.log('🎉 Correction terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
  }
}

// Exécuter le script
fixProfileIdConstraint()
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })