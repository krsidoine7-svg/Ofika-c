/**
 * Script de synchronisation des prix
 * Synchronise NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT (.env) avec pricing_config (Supabase)
 * 
 * Usage: tsx scripts/sync-pricing.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncPricing() {
  console.log('🔄 Synchronisation des prix...\n')

  // Récupérer le prix depuis .env
  const envPrice = process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT
  
  if (!envPrice) {
    console.error('❌ NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT non défini dans .env')
    process.exit(1)
  }

  const priceNumber = parseInt(envPrice)
  
  if (isNaN(priceNumber)) {
    console.error('❌ NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT doit être un nombre')
    process.exit(1)
  }

  console.log(`📊 Prix détecté dans .env: ${priceNumber.toLocaleString('fr-FR')} XOF`)

  // Récupérer le prix actuel dans la BDD
  const { data: currentConfig, error: fetchError } = await supabase
    .from('pricing_config')
    .select('nfc_card_base_price')
    .eq('id', 'default')
    .single()

  if (fetchError) {
    console.error('❌ Erreur lors de la lecture de pricing_config:', fetchError.message)
    process.exit(1)
  }

  console.log(`📊 Prix actuel en BDD: ${currentConfig.nfc_card_base_price.toLocaleString('fr-FR')} XOF`)

  // Vérifier si une mise à jour est nécessaire
  if (currentConfig.nfc_card_base_price === priceNumber) {
    console.log('✅ Les prix sont déjà synchronisés !')
    return
  }

  // Mettre à jour
  const { error: updateError } = await supabase
    .from('pricing_config')
    .update({ 
      nfc_card_base_price: priceNumber,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'default')

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour:', updateError.message)
    process.exit(1)
  }

  console.log(`\n✅ Prix synchronisé avec succès !`)
  console.log(`   Ancien prix: ${currentConfig.nfc_card_base_price.toLocaleString('fr-FR')} XOF`)
  console.log(`   Nouveau prix: ${priceNumber.toLocaleString('fr-FR')} XOF`)

  // Vérifier que la fonction SQL fonctionne
  console.log('\n🧪 Test de la fonction calculate_nfc_card_price()...')
  
  const { data: testResult, error: rpcError } = await supabase
    .rpc('calculate_nfc_card_price', {
      design_id: 'design-classic',
      quantity: 1,
      country_code: 'CI'
    })

  if (rpcError) {
    console.error('❌ Erreur fonction SQL:', rpcError.message)
  } else {
    console.log('✅ Fonction SQL opérationnelle:')
    console.log(`   Prix de base: ${testResult.base_price.toLocaleString('fr-FR')} XOF`)
    console.log(`   Total (avec livraison): ${testResult.total.toLocaleString('fr-FR')} XOF`)
  }

  console.log('\n🎉 Synchronisation terminée !')
}

// Exécuter
syncPricing().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
