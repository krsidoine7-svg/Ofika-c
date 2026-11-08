#!/usr/bin/env tsx
/**
 * Script simple pour vérifier la configuration LyGOS
 * 
 * Ce script vérifie uniquement la présence des variables d'environnement
 * sans faire d'appels API
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

console.log('\n📋 VÉRIFICATION DE LA CONFIGURATION LYGOS\n')
console.log('=' .repeat(60))

const vars = {
  required: [
    { name: 'LYGOS_API_KEY', value: process.env.LYGOS_API_KEY },
    { name: 'LYGOS_WEBHOOK_SECRET', value: process.env.LYGOS_WEBHOOK_SECRET },
  ],
  optional: [
    { name: 'LYGOS_BASE_URL', value: process.env.LYGOS_BASE_URL || 'https://api.lygosapp.com' },
    { name: 'LYGOS_SHOP_NAME', value: process.env.LYGOS_SHOP_NAME || 'Ofika' },
    { name: 'LYGOS_SUCCESS_URL', value: process.env.LYGOS_SUCCESS_URL },
    { name: 'LYGOS_FAILURE_URL', value: process.env.LYGOS_FAILURE_URL },
    { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL },
  ]
}

let hasErrors = false

console.log('\n✅ Variables REQUISES:')
for (const { name, value } of vars.required) {
  if (!value) {
    console.log(`   ❌ ${name}: NON DÉFINIE`)
    hasErrors = true
  } else {
    const masked = value.substring(0, 8) + '***' + value.substring(value.length - 4)
    console.log(`   ✅ ${name}: ${masked}`)
  }
}

console.log('\n📝 Variables OPTIONNELLES:')
for (const { name, value } of vars.optional) {
  if (!value) {
    console.log(`   ⚠️  ${name}: Non définie (valeur par défaut sera utilisée)`)
  } else {
    console.log(`   ✅ ${name}: ${value}`)
  }
}

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('\n❌ ERREUR: Des variables requises sont manquantes!')
  console.log('\nPour configurer LyGOS, ajoutez ces variables dans votre fichier .env.local:')
  console.log('\nLYGOS_API_KEY=votre_clé_api_lygos')
  console.log('LYGOS_WEBHOOK_SECRET=votre_secret_webhook\n')
  process.exit(1)
} else {
  console.log('\n✅ Configuration LyGOS complète!\n')
  console.log('Pour tester la connexion avec l\'API LyGOS, exécutez:')
  console.log('  npm run test:lygos\n')
  process.exit(0)
}
