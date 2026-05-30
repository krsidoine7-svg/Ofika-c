const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

describe('Image Upload Tests', () => {
  let supabase

  beforeAll(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabase = createClient(supabaseUrl, supabaseKey)
  })

  test('Should be able to upload image to profile-images bucket', async () => {
    // Récupérer un utilisateur de test
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No authenticated user for test')
      return
    }

    // Créer un fichier de test (image PNG minimal)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND
    ])

    const fileName = `${user.id}/test-${Date.now()}.png`
    const bucketName = 'profile-images'

    // Tenter l'upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, testImageData, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.path).toBe(fileName)

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    expect(urlData.publicUrl).toBeDefined()
    expect(urlData.publicUrl).toContain(bucketName)
    expect(urlData.publicUrl).toContain(fileName)

    // Nettoyer
    await supabase.storage
      .from(bucketName)
      .remove([fileName])
  })

  test('Should be able to read uploaded images', async () => {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .list('', { limit: 10 })

    // Ne pas échouer si le bucket est vide
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  test('Should have correct RLS policies', async () => {
    // Vérifier que les politiques RLS existent
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage')
      .like('policyname', '%profile_images%')

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.length).toBeGreaterThan(0)
  })
})
