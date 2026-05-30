// =====================================================
// SERVICE POUR L'UPLOAD DE FICHIERS VERS SUPABASE STORAGE
// =====================================================

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload un fichier vers Supabase Storage
 */
export async function uploadNFCAsset(
  file: File,
  userId: string,
  type: 'logo' | 'photo'
): Promise<UploadResult> {
  try {
    // Validation du fichier
    const allowedTypes = type === 'logo' 
      ? ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
      : ['image/png', 'image/jpeg', 'image/jpg']
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Type de fichier non supporté' 
      }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'Fichier trop volumineux (max 5MB)' 
      }
    }

    // Générer un nom de fichier unique avec userId en PREMIER pour la sécurité RLS
    // Structure : userId/logos/timestamp.ext
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${type}s/${timestamp}.${fileExt}`

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('nfc-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading to Supabase Storage:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('nfc-assets')
      .getPublicUrl(fileName)

    console.log('✅ Fichier uploadé avec succès:', publicUrl)

    return {
      success: true,
      url: publicUrl,
      path: fileName
    }
  } catch (error: any) {
    console.error('Error in uploadNFCAsset:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'upload'
    }
  }
}

/**
 * Supprimer un fichier de Supabase Storage
 */
export async function deleteNFCAsset(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('nfc-assets')
      .remove([filePath])

    if (error) {
      console.error('Error deleting from Supabase Storage:', error)
      return {
        success: false,
        error: error.message
      }
    }

    console.log('✅ Fichier supprimé avec succès:', filePath)
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteNFCAsset:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression'
    }
  }
}

/**
 * Upload multiple fichiers
 */
export async function uploadMultipleNFCAssets(
  files: Array<{ file: File; type: 'logo' | 'photo' }>,
  userId: string
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
  const results = await Promise.all(
    files.map(({ file, type }) => uploadNFCAsset(file, userId, type))
  )

  const successResults = results.filter(r => r.success)
  const errorResults = results.filter(r => !r.success)

  if (errorResults.length > 0) {
    return {
      success: false,
      urls: successResults.map(r => r.url!),
      errors: errorResults.map(r => r.error!)
    }
  }

  return {
    success: true,
    urls: successResults.map(r => r.url!)
  }
}
