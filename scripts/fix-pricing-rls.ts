import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Inserting default config using service role...')
  
  const defaultConfig = {
    id: 'default',
    nfc_card_base_price: 14600,
    premium_supplement: 5000,
    shipping_uemoa: 2000,
    shipping_west_africa: 5000,
    shipping_international: 10000,
    currency: 'XOF',
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('pricing_config')
    .upsert([defaultConfig])
    
  if (error) {
    console.error('Error inserting default config:', error)
  } else {
    console.log('Successfully inserted default pricing config.')
  }
}

main()
