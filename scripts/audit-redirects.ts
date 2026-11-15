import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { createAdminClient } from '../lib/supabase/service-role'

async function main() {
  const supabase = createAdminClient()

  const { data: qrs, error: qrErr } = await supabase
    .from('qr_redirects')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .limit(5)

  if (qrErr) {
    console.error('Error:', qrErr)
  } else {
    console.log(`Active QR redirects (${qrs?.length}):`, qrs)
  }
}

main().catch(console.error)
