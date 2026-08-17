// ==========================================
// TEST SUITE: OFIKA PWA OFFLINE & VCARD
// ==========================================

import { VCardGenerator } from '../lib/utils/vcard-generator'

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASSED: ${testName}`)
    passedTests++
  } else {
    console.error(`  ❌ FAILED: ${testName}`)
    failedTests++
  }
}

console.log('==============================================')
console.log('🚀 DÉBUT DE LA BATTERIE DE TESTS AUTOMATISÉS PWA & VCARD')
console.log('==============================================\n')

// ------------------------------------------
// TEST 1: VCardGenerator Format RFC 2426
// ------------------------------------------
console.log('🧪 1. Test du générateur vCard (lib/utils/vcard-generator.ts)...')

const testContact = {
  fullName: 'Kouassi Jean-Marc',
  firstName: 'Jean-Marc',
  lastName: 'Kouassi',
  company: 'Ofika SARL',
  jobTitle: 'Fondateur & Designer',
  email: 'jean-marc@ofika.ci',
  phone: '+2250701020304',
  website: 'https://ofika.ci/jmkouassi',
  address: 'Plateau Boulevard Botreau Roussel',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  bio: 'Passionné par le design & la technologie NFC en Afrique.'
}

const generator = new VCardGenerator(testContact)
const vcardOutput = generator.generate()

assert(vcardOutput.startsWith('BEGIN:VCARD'), 'Le fichier vCard commence par BEGIN:VCARD')
assert(vcardOutput.endsWith('END:VCARD'), 'Le fichier vCard se termine par END:VCARD')
assert(vcardOutput.includes('VERSION:3.0'), 'Le format vCard est en version 3.0')
assert(vcardOutput.includes('FN:Kouassi Jean-Marc'), 'Le nom complet FN est correctement formaté')
assert(vcardOutput.includes('N:Jean-Marc;Kouassi;;;'), 'Le nom structuré N est séparé par des semicolons')
assert(vcardOutput.includes('TEL:+2250701020304'), 'Le numéro de téléphone comporte l\'indicatif international')
assert(vcardOutput.includes('ORG:Ofika SARL'), 'L\'organisation est présente')
assert(vcardOutput.includes('TITLE:Fondateur & Designer'), 'Le titre du poste est présent')
assert(vcardOutput.includes('\r\n'), 'Les fin de lignes sont strictement au format CRLF (\\r\\n)')

const filename = generator.generateFileName()
assert(filename === 'kouassi-jean-marc.vcf', `Le nom de fichier généré est correct (${filename})`)

// ------------------------------------------
// TEST 2: Validation des caractères spéciaux UTF-8
// ------------------------------------------
console.log('\n🧪 2. Test des échappements UTF-8 et caractères spéciaux...')

const specialContact = {
  fullName: 'Aïssata N\'Dri, P-DG',
  firstName: 'Aïssata',
  lastName: 'N\'Dri',
  company: 'Société & Cie, Lda; Abidjan',
  bio: 'Développeuse Web;\nExpertise React, Next.js & PWA.'
}

const specialGenerator = new VCardGenerator(specialContact)
const specialOutput = specialGenerator.generate()

assert(specialOutput.includes('Société & Cie\\, Lda\\; Abidjan'), 'Les virgules et semicolons de la compagnie sont échappés')
assert(specialOutput.includes('Développeuse Web\\;\\nExpertise React\\, Next.js & PWA.'), 'Les sauts de ligne \\n, semicolons et virgules de la bio sont échappés')

// ------------------------------------------
// TEST 3: Validation de la syntaxe Service Worker
// ------------------------------------------
console.log('\n🧪 3. Validation du fichier Service Worker (public/sw.js)...')
import * as fs from 'fs'
import * as path from 'path'

const swPath = path.join(__dirname, '../public/sw.js')
const swExists = fs.existsSync(swPath)
assert(swExists, 'Le fichier public/sw.js existe')

if (swExists) {
  const swContent = fs.readFileSync(swPath, 'utf-8')
  assert(swContent.includes("self.addEventListener('install'"), 'Contient l\'événement install SW')
  assert(swContent.includes("self.addEventListener('fetch'"), 'Contient l\'événement fetch SW')
  assert(swContent.includes("self.addEventListener('push'"), 'Contient l\'événement push SW')
  assert(swContent.includes("self.addEventListener('notificationclick'"), 'Contient l\'événement notificationclick SW')
}

// ------------------------------------------
// RÉSULTATS DES TESTS
// ------------------------------------------
console.log('\n==============================================')
console.log(`📊 RÉSULTAT DES TESTS : ${passedTests} SUCCÈS, ${failedTests} ÉCHECS`)
console.log('==============================================\n')

if (failedTests > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
