import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seedWaveConfig() {
  console.log('🚀 Seeding Wave configuration into system_config...')
  
  const waveConfig = {
    wave: {
      is_active: true,
      wave_merchant_id: 'M_ci_8aqIEVzY9rYq',
      wave_payment_link: 'https://pay.wave.com/m/M_ci_8aqIEVzY9rYq',
      whatsapp_number: '+2250503681588',
      base_price: 14600,
      currency: 'XOF',
      fees: 0
    }
  }

  const { error } = await supabase
    .from('system_config')
    .upsert({
      key: 'payment_gateways',
      value: waveConfig,
      description: 'Configurations des passerelles de paiement (Wave Marchand Direct)'
    })

  if (error) {
    console.error('❌ Error seeding Wave config:', error.message)
    process.exit(1)
  }

  console.log('✅ Wave config seeded successfully in system_config table!')
  process.exit(0)
}

seedWaveConfig()
