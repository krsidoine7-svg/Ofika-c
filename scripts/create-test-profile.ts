import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Or just use anon if RLS allows, but usually we need service role to bypass RLS for seeding

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestProfile() {
  console.log("🚀 Création de l'utilisateur de test...")
  
  // 1. Create a dummy user in auth.users (if possible, otherwise just use a hardcoded UUID for public tables)
  const userId = '00000000-0000-0000-0000-000000001234'
  
  // Create user in public.users to satisfy foreign keys
  await supabase.from('users').upsert({
    id: userId,
    email: 'testvcard@ofika.local',
    created_at: new Date().toISOString()
  })

  // 2. Create the profile
  const profileId = 'test-vcard-user'
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: profileId,
    user_id: userId,
    username: profileId,
    name: 'Test VCard User',
    full_name: 'Test VCard User',
    bio: 'Profile for automated vCard testing',
    email: 'contact@testvcard.local',
    phone: '+33600000000',
    company: 'Ofika QA',
    job_title: 'Automated Tester',
    location: 'Paris;France',
    design_choice: 'design1',
    is_public: true,
    profile_type: 'user'
  })

  if (profileError) {
    console.error("❌ Erreur lors de la création du profil :", profileError)
    return
  }
  
  // 3. Create the card
  const { error: cardError } = await supabase.from('digital_nfc_cards').upsert({
    id: '11111111-1111-1111-1111-111111111111',
    user_id: userId,
    profile_name: 'Test QA Card',
    full_name: 'Test VCard User',
    company: 'Ofika QA',
    job_title: 'Automated Tester',
    phone: '+33600000000',
    email: 'contact@testvcard.local',
    status: 'active',
    profile_id: profileId,
    nfc_link: 'https://ofika.ci/test-vcard-user',
    custom_url: 'test-vcard-user',
    color_theme: 'black'
  })

  if (cardError) {
    console.error("❌ Erreur lors de la création de la carte :", cardError)
    return
  }

  console.log("✅ Profil de test et carte créés avec succès ! (username: test-vcard-user)")
}

createTestProfile()
