import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL missing in .env.local')
  process.exit(1)
}

const sql = postgres(connectionString, { prepare: false })

async function run() {
  console.log('🔍 Inspection des liens localhost dans la base de données Supabase...')

  // 1. Inspecter qr_redirects
  const qrRows = await sql`
    SELECT id, short_code, target_url, type 
    FROM public.qr_redirects 
    WHERE target_url LIKE '%localhost%';
  `
  console.log(`📌 Nombres de redirections dans qr_redirects contenant localhost : ${qrRows.length}`)
  for (const row of qrRows) {
    console.log(`  - [ID: ${row.id}] short_code: ${row.short_code} | target_url actuel: ${row.target_url}`)
  }

  // 2. Inspecter digital_nfc_cards
  const cardRows = await sql`
    SELECT id, profile_name, nfc_link 
    FROM public.digital_nfc_cards 
    WHERE nfc_link LIKE '%localhost%';
  `
  console.log(`\n📌 Nombres de cartes NFC dans digital_nfc_cards contenant localhost : ${cardRows.length}`)
  for (const row of cardRows) {
    console.log(`  - [ID: ${row.id}] Nom: ${row.profile_name} | nfc_link actuel: ${row.nfc_link}`)
  }

  // 3. Corriger les URLs en remplaçant http://localhost:5000 et http://localhost:3000 par https://ofika.ci
  console.log('\n🚀 Nettoyage et remplacement de tous les localhost par https://ofika.ci en BDD...')

  const updateQR = await sql`
    UPDATE public.qr_redirects
    SET target_url = REGEXP_REPLACE(target_url, '^https?://localhost:(3000|5000)', 'https://ofika.ci')
    WHERE target_url LIKE '%localhost%';
  `
  console.log(`✅ ${updateQR.count} entrées mises à jour dans public.qr_redirects`)

  const updateCards = await sql`
    UPDATE public.digital_nfc_cards
    SET nfc_link = REGEXP_REPLACE(nfc_link, '^https?://localhost:(3000|5000)', 'https://ofika.ci')
    WHERE nfc_link LIKE '%localhost%';
  `
  console.log(`✅ ${updateCards.count} cartes mises à jour dans public.digital_nfc_cards`)

  await sql.end()
  process.exit(0)
}

run().catch(err => {
  console.error('Erreur:', err)
  process.exit(1)
})
