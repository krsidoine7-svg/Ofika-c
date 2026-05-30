const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

describe('Storage Bucket Tests', () => {
  let supabase

  beforeAll(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabase = createClient(supabaseUrl, supabaseKey)
  })

  test('Bucket profile-images should exist', async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    expect(error).toBeNull()
    expect(buckets).toBeDefined()
    
    const profileImagesBucket = buckets.find(bucket => bucket.name === 'profile-images')
    expect(profileImagesBucket).toBeDefined()
    expect(profileImagesBucket.public).toBe(true)
    expect(profileImagesBucket.file_size_limit).toBe(5242880) // 5MB
  })

  test('Should be able to upload a test image', async () => {
    // Créer un fichier de test
    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(`test-${Date.now()}.jpg`, testFile)
    
    // Nettoyer le fichier de test
    if (data?.path) {
      await supabase.storage
        .from('profile-images')
        .remove([data.path])
    }
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
