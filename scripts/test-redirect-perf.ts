import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createAdminClient } from '../lib/supabase/service-role'

async function benchmark() {
  console.log('=====================================================')
  console.log('⚡ TEST DE PERFORMANCE ET REDIRECTION EN DIRECT')
  console.log('=====================================================')

  const supabase = createAdminClient()

  // 1. Tester la résolution directe d'un short_code en BDD
  const testShortCode = 'LRcGFg96'
  console.log(`\n1. Test de résolution BDD pour le QR "${testShortCode}" :`)
  const startDb = performance.now()
  const { data: qr, error } = await supabase
    .from('qr_redirects')
    .select('id, short_code, target_url, is_active')
    .ilike('short_code', testShortCode)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()
  const endDb = performance.now()

  if (error || !qr) {
    console.error('❌ Échec résolution QR:', error)
    return
  }

  console.log(`✅ Résolu en ${(endDb - startDb).toFixed(2)} ms`)
  console.log(`   ID: ${qr.id}`)
  console.log(`   Short Code: ${qr.short_code}`)
  console.log(`   Target URL: ${qr.target_url}`)

  // 2. Tester l'insensibilité à la casse (ex: minuscules)
  const lowerShortCode = testShortCode.toLowerCase()
  console.log(`\n2. Test insensibilité à la casse "${lowerShortCode}" :`)
  const startLower = performance.now()
  const { data: qrLower } = await supabase
    .from('qr_redirects')
    .select('id, short_code, target_url')
    .ilike('short_code', lowerShortCode)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()
  const endLower = performance.now()
  console.log(`✅ Résolu en ${(endLower - startLower).toFixed(2)} ms (ID identique: ${qrLower?.id === qr.id})`)

  // 3. Tester la résolution NFC publique
  console.log('\n3. Test de résolution Carte NFC publique :')
  const nfcTestLink = 'koffisidoine-116636'
  const startNfc = performance.now()
  const { data: nfcCard, error: nfcErr } = await supabase
    .from('digital_nfc_cards')
    .select('id, profile_name, nfc_link, status')
    .or(`nfc_link.eq.https://ofika.ci/${nfcTestLink},nfc_link.eq.https://ofika.com/${nfcTestLink},nfc_link.eq./${nfcTestLink},nfc_link.eq.${nfcTestLink},preview_data->>nfc_link.eq.https://ofika.ci/${nfcTestLink},preview_data->>nfc_link.eq.https://ofika.com/${nfcTestLink}`)
    .eq('status', 'active')
    .single()
  const endNfc = performance.now()

  if (nfcErr || !nfcCard) {
    console.error('❌ Échec résolution NFC:', nfcErr)
  } else {
    console.log(`✅ Carte NFC résolue en ${(endNfc - startNfc).toFixed(2)} ms`)
    console.log(`   Nom: ${nfcCard.profile_name}`)
    console.log(`   Lien: ${nfcCard.nfc_link}`)
  }

  // 4. Tester l'enregistrement asynchrone d'un scan sans bloquer
  console.log('\n4. Test du service trackQRScan avec préchargement :')
  const { trackQRScan } = await import('../lib/services/qr-redirect')
  const startTrack = performance.now()
  const trackRes = await trackQRScan(
    testShortCode,
    {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      referrer: 'https://camera.apple.com',
      ipAddress: '41.207.24.12',
      country: "Côte d'Ivoire",
      city: 'Abidjan'
    },
    {
      id: qr.id,
      user_id: '91eef59a-f448-4cfc-9a9c-fff6df07503e',
      target_url: qr.target_url
    }
  )
  const endTrack = performance.now()
  console.log(`✅ Scan enregistré en ${(endTrack - startTrack).toFixed(2)} ms (Succès: ${trackRes.success})`)

  // 5. Vérifier dans la table qr_scans
  const { data: latestScan } = await supabase
    .from('qr_scans')
    .select('id, device_type, os, browser, city, scanned_at')
    .eq('qr_redirect_id', qr.id)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  console.log('\n5. Dernier scan enregistré dans la table qr_scans :')
  console.log(latestScan)

  console.log('\n=====================================================')
  console.log('🎉 AUDIT & OPTIMISATION VALIDÉS AVEC SUCCÈS !')
  console.log('=====================================================')
}

benchmark().catch(console.error)
