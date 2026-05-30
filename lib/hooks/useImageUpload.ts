"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UseImageUploadOptions {
  bucket: string
  folder?: string
  maxSize?: number // en MB
  allowedTypes?: string[]
}

export function useImageUpload({
  bucket,
  folder = '',
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Validation du fichier
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté')
        return null
      }

      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Le fichier ne doit pas dépasser ${maxSize}MB`)
        return null
      }

      // Validation de l'extension
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        toast.error('Format de fichier non supporté')
        return null
      }

      setUploading(true)
      setProgress(0)

      // Créer un nom de fichier unique et sécurisé
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // ✅ Déterminer le contentType avec fallback
      const mimeTypeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      }

      // Utiliser file.type si valide, sinon fallback sur l'extension
      const contentType = (file.type && file.type.startsWith('image/')) 
        ? file.type 
        : (mimeTypeMap[fileExt] || 'image/jpeg')

      console.log('🔍 Upload info (useImageUpload):', {
        fileName: file.name,
        fileType: file.type,
        fileExt: fileExt,
        contentType: contentType,
        fileSize: file.size,
        bucket: bucket
      })

      const supabase = createClient()

      // Upload vers Supabase Storage avec retry
      let uploadError = null
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType // ✅ Toujours valide (file.type ou fallback)
          })

        if (!error) {
          break // Succès
        }

        uploadError = error
        retryCount++
        
        if (retryCount <= maxRetries) {
          setProgress((retryCount / maxRetries) * 50) // Progress pour retry
          await new Promise(resolve => setTimeout(resolve, 1000)) // Attendre 1s avant retry
        }
      }

      if (uploadError) {
        throw uploadError
      }

      setProgress(100)

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      toast.success('Image uploadée avec succès')
      return data.publicUrl

    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image'
      toast.error(errorMessage)
      return null
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      const supabase = createClient()
      
      // Extraire le chemin du fichier depuis l'URL de manière plus robuste
      let fileName = ''
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        fileName = pathParts[pathParts.length - 1]
      } catch {
        // Fallback si l'URL n'est pas valide
        const urlParts = url.split('/')
        fileName = urlParts[urlParts.length - 1]
      }

      if (!fileName) {
        throw new Error('Impossible d\'extraire le nom du fichier depuis l\'URL')
      }

      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        throw error
      }

      toast.success('Image supprimée avec succès')
      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'image'
      toast.error(errorMessage)
      return false
    }
  }

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress
  }
}
