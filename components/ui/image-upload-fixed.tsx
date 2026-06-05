"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  label?: string
}

export function ImageUploadFixed({
  value,
  onChange,
  onRemove,
  disabled = false,
  className = "",
  label
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ✅ Validation stricte du type MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const fileType = file.type.toLowerCase()

    if (!fileType || !allowedTypes.includes(fileType)) {
      toast.error('Type de fichier non supporté. Veuillez sélectionner une image (JPG, PNG, GIF, WebP)')
      return
    }

    // ✅ Validation de l'extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      toast.error('Extension de fichier non supportée')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux (max 5MB)')
      return
    }

    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload vers Supabase Storage
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)

      // Créer le client Supabase
      const supabase = createClient()

      // Obtenir l'utilisateur actuel (optionnel pendant l'onboarding)
      const { data: { user } } = await supabase.auth.getUser()

      // Préparer le nom de fichier
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const userId = user?.id || 'onboarding'
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const bucketName = 'profile-images'

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

      // ✅ Logs de debug
      console.log('🔍 Upload info:', {
        fileName: file.name,
        fileType: file.type,
        fileExt: fileExt,
        contentType: contentType,
        fileSize: file.size,
        bucketName: bucketName
      })

      // Upload direct vers Supabase Storage avec contentType garanti
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType // ✅ Toujours valide (file.type ou fallback)
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Erreur d'upload: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData.publicUrl)

      onChange(urlData.publicUrl)
      toast.success('Image uploadée avec succès')

    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image'
      toast.error(errorMessage)
      setPreview(null)

      // Nettoyer l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <Label>{label}</Label>}

      {preview ? (
        <div className="relative inline-block group">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer"
            onClick={handleClick}
          >
            <img
              src={preview}
              alt="Prévisualisation"
              className="w-full h-full object-cover border-4 border-white shadow-lg"
            />
            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

        </div>
      ) : (
        <div
          className={`
            w-32 h-32 rounded-full border-2 border-dashed border-gray-300 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-orange-400 hover:border-solid transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleClick}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-xs text-gray-500 mt-2">Upload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="h-8 w-8 text-gray-400" />

            </div>
          )}
        </div>
      )}



      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
