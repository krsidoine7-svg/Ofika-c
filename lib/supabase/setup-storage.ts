"use client"

import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS } from './storage'

export async function setupStorageBuckets() {
  const supabase = createClient()
  
  try {
    // Vérifier et créer le bucket profile-images
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return { success: false, error: listError.message }
    }

    const bucketNames = buckets?.map(bucket => bucket.name) || []
    
    // Créer les buckets manquants
    const bucketsToCreate = [
      {
        id: STORAGE_BUCKETS.PROFILE_IMAGES,
        name: STORAGE_BUCKETS.PROFILE_IMAGES,
        public: true
      },
      {
        id: STORAGE_BUCKETS.CARD_DESIGNS,
        name: STORAGE_BUCKETS.CARD_DESIGNS,
        public: true
      },
      {
        id: STORAGE_BUCKETS.TEMP_UPLOADS,
        name: STORAGE_BUCKETS.TEMP_UPLOADS,
        public: false
      }
    ]

    for (const bucket of bucketsToCreate) {
      if (!bucketNames.includes(bucket.name)) {
        console.log(`Creating bucket: ${bucket.name}`)
        
        const { error: createError } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })

        if (createError) {
          console.error(`Error creating bucket ${bucket.name}:`, createError)
          return { success: false, error: createError.message }
        }
      }
    }

    return { success: true, message: 'Storage buckets configured successfully' }
  } catch (error) {
    console.error('Error setting up storage:', error)
    return { success: false, error: 'Failed to setup storage buckets' }
  }
}

// Fonction pour vérifier si un bucket existe
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('Error checking buckets:', error)
      return false
    }

    return data?.some(bucket => bucket.name === bucketName) || false
  } catch (error) {
    console.error('Error checking bucket existence:', error)
    return false
  }
}

// Fonction pour créer un bucket spécifique
export async function createBucket(bucketName: string, isPublic: boolean = true): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })

    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating bucket:', error)
    return { success: false, error: 'Failed to create bucket' }
  }
}
