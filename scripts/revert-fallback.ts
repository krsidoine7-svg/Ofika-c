import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Reverting fallback: setting subscription_tier = null for super_admins...')
  const { data: adminUsers, error: userErr } = await supabase.from('users').select('id').eq('role', 'super_admin')
  
  if (adminUsers && adminUsers.length > 0) {
     for (const u of adminUsers) {
        // Revert subscription_tier to null since role is already super_admin
        await supabase.from('users').update({ subscription_tier: null }).eq('id', u.id)
     }
     console.log('Fallback reverted successfully. Users with role=super_admin no longer have subscription_tier=admin.')
  }
}

main()
