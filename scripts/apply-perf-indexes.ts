import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'

async function applyIndexes() {
  const poolerUrl = process.env.DATABASE_URL_POOLER || 
    (process.env.DATABASE_URL?.includes('pooler') ? process.env.DATABASE_URL : null) ||
    // extract password from DATABASE_URL and use aws-1-us-west-1.pooler.supabase.com:6543
    (() => {
      const dbUrl = process.env.DATABASE_URL || ''
      const passMatch = dbUrl.match(/postgres:([^@]+)@/)
      if (passMatch) {
        const pass = passMatch[1]
        return `postgresql://postgres.graqvtzmefiwsafaubcw:${pass}@aws-1-us-west-1.pooler.supabase.com:6543/postgres`
      }
      return dbUrl
    })()

  console.log('Connecting to pooler:', poolerUrl.replace(/:[^:@]+@/, ':***@'))
  const sql = postgres(poolerUrl, { ssl: 'require' })

  console.log('--- 1. APPLICATION DES INDEX PERFORMANCE BDD ---')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_qr_redirects_short_code_lower 
    ON public.qr_redirects (LOWER(short_code)) 
    WHERE is_active = true AND deleted_at IS NULL;
  `
  console.log('✅ Index idx_qr_redirects_short_code_lower créé')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_qr_scans_redirect_id_time 
    ON public.qr_scans (qr_redirect_id, scanned_at DESC);
  `
  console.log('✅ Index idx_qr_scans_redirect_id_time créé')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_digital_nfc_cards_profile_id 
    ON public.digital_nfc_cards (profile_id) 
    WHERE status = 'active';
  `
  console.log('✅ Index idx_digital_nfc_cards_profile_id créé')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_digital_nfc_cards_link 
    ON public.digital_nfc_cards (nfc_link) 
    WHERE status = 'active';
  `
  console.log('✅ Index idx_digital_nfc_cards_link créé')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
    ON public.profiles (LOWER(username)) 
    WHERE is_public = true AND is_active = true;
  `
  console.log('✅ Index idx_profiles_username_lower créé')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_profiles_custom_url_lower 
    ON public.profiles (LOWER(custom_url)) 
    WHERE is_public = true AND is_active = true;
  `
  console.log('✅ Index idx_profiles_custom_url_lower créé')

  console.log('--- 2. TEST EXPLAIN ANALYZE ---')
  const qrPlan = await sql`
    EXPLAIN ANALYZE
    SELECT * FROM public.qr_redirects
    WHERE LOWER(short_code) = LOWER('LRcGFg96')
      AND is_active = true
      AND deleted_at IS NULL;
  `
  console.log('Plan qr_redirects:')
  for (const row of qrPlan) {
    console.log(' ', row['QUERY PLAN'])
  }

  const profilePlan = await sql`
    EXPLAIN ANALYZE
    SELECT id, name, username, custom_url FROM public.profiles
    WHERE (LOWER(username) = LOWER('koffi-renaud') OR LOWER(custom_url) = LOWER('koffi-renaud'))
      AND is_public = true
      AND is_active = true;
  `
  console.log('Plan profiles:')
  for (const row of profilePlan) {
    console.log(' ', row['QUERY PLAN'])
  }

  await sql.end()
}

applyIndexes().catch(console.error)
