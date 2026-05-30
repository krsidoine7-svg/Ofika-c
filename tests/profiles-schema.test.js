const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

describe('Profiles Schema Tests', () => {
  let supabase

  beforeAll(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabase = createClient(supabaseUrl, supabaseKey)
  })

  test('Table profiles should have image_url column', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, name, image_url')
      .limit(1)
    
    // Si la colonne n'existe pas, on aura une erreur
    expect(error).toBeNull()
  })

  test('Should be able to insert profile with image_url', async () => {
    // Récupérer un utilisateur de test
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No authenticated user for test')
      return
    }

    const testProfile = {
      user_id: user.id,
      profile_type: 'personal',
      name: 'Test Profile',
      bio: 'Test bio',
      image_url: 'https://example.com/test.jpg',
      is_public: false
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.image_url).toBe('https://example.com/test.jpg')

    // Nettoyer
    if (data?.id) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', data.id)
    }
  })

  test('user_id should be UUID type', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1)
    
    expect(error).toBeNull()
    if (data && data.length > 0) {
      // Vérifier que user_id est un UUID valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(data[0].user_id)).toBe(true)
    }
  })
})
