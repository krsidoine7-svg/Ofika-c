"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Alert, AlertDescription } from "@/components/core/ui/alert"
import { Badge } from "@/components/core/ui/badge"
import { Loader2, User, Camera, Upload, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

interface UserImageManagerProps {
  userId: string
  currentImage?: string
  userName?: string
  userEmail?: string
  onImageUpdate?: (newImageUrl: string) => void
}

export function UserImageManager({ 
  userId, 
  currentImage, 
  userName, 
  userEmail, 
  onImageUpdate 
}: UserImageManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userImage, setUserImage] = useState(currentImage)
  const [isUpdating, setIsUpdating] = useState(false)

  const supabase = createClient()

  // Générer une image par défaut basée sur le nom ou email
  const generateDefaultImage = (name?: string, email?: string) => {
    if (name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`
    }
    if (email) {
      const emailName = email.split('@')[0]
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(emailName)}&background=random&color=fff&size=200`
    }
    return 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200'
  }

  // Synchroniser l'image depuis Auth
  const syncImageFromAuth = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Utilisateur non connecté')
      }

      // Récupérer l'image depuis les métadonnées Auth
      const authImage = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture || 
                       user.user_metadata?.image

      if (authImage) {
        // Mettre à jour la table users
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            image: authImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          throw updateError
        }

        setUserImage(authImage)
        onImageUpdate?.(authImage)
        toast.success('Image synchronisée depuis Auth')
      } else {
        toast.info('Aucune image trouvée dans Auth')
      }
    } catch (error) {
      console.error('Error syncing image from Auth:', error)
      toast.error('Erreur lors de la synchronisation')
    } finally {
      setIsLoading(false)
    }
  }

  // Générer une image par défaut
  const generateDefaultImageAction = async () => {
    try {
      setIsLoading(true)
      
      const defaultImage = generateDefaultImage(userName, userEmail)
      
      const { error } = await supabase
        .from('users')
        .update({ 
          image: defaultImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setUserImage(defaultImage)
      onImageUpdate?.(defaultImage)
      toast.success('Image par défaut générée')
    } catch (error) {
      console.error('Error generating default image:', error)
      toast.error('Erreur lors de la génération de l\'image')
    } finally {
      setIsLoading(false)
    }
  }

  // Upload d'image personnalisée
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUpdating(true)
      
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner un fichier image')
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image doit faire moins de 5MB')
      }

      // Validation de l'extension
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        throw new Error('Format de fichier non supporté')
      }

      // Supprimer l'ancienne image si elle existe
      if (userImage && userImage.includes('profile-images')) {
        try {
          const oldFileName = userImage.split('/').pop()
          if (oldFileName) {
            await supabase.storage
              .from('profile-images')
              .remove([oldFileName])
          }
        } catch (deleteError) {
          console.warn('Impossible de supprimer l\'ancienne image:', deleteError)
        }
      }

      // Créer un nom de fichier sécurisé
      const fileName = `user-${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
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

      console.log('🔍 Upload info (UserImageManager):', {
        fileName: file.name,
        fileType: file.type,
        fileExt: fileExt,
        contentType: contentType,
        fileSize: file.size
      })
      
      // Upload vers Supabase Storage avec retry
      let uploadError = null
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        const { error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file, {
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
          await new Promise(resolve => setTimeout(resolve, 1000)) // Attendre 1s avant retry
        }
      }

      if (uploadError) {
        throw uploadError
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      // Mettre à jour la table users
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          image: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        // Si la mise à jour échoue, supprimer le fichier uploadé
        try {
          await supabase.storage
            .from('profile-images')
            .remove([fileName])
        } catch (cleanupError) {
          console.warn('Impossible de nettoyer le fichier uploadé:', cleanupError)
        }
        throw updateError
      }

      setUserImage(urlData.publicUrl)
      onImageUpdate?.(urlData.publicUrl)
      toast.success('Image mise à jour avec succès')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setIsUpdating(false)
      // Nettoyer l'input file
      event.target.value = ''
    }
  }

  // Supprimer l'image
  const removeImage = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('users')
        .update({ 
          image: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setUserImage(undefined)
      onImageUpdate?.('')
      toast.success('Image supprimée')
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Image de profil utilisateur</span>
        </CardTitle>
        <CardDescription>
          Gérez l'image de profil de l'utilisateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image actuelle */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {userImage ? (
              <Image
                src={userImage}
                alt="Image de profil"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {userName || 'Utilisateur'}
            </p>
            <p className="text-sm text-gray-600">
              {userEmail || 'Aucun email'}
            </p>
            <Badge variant={userImage ? "default" : "secondary"}>
              {userImage ? "Image définie" : "Aucune image"}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={syncImageFromAuth}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync Auth
            </Button>

            <Button
              onClick={generateDefaultImageAction}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-1" />
              )}
              Générer
            </Button>
          </div>

          <div className="flex gap-2">
            <label htmlFor="image-upload">
              <Button
                asChild
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                <span>
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  Upload
                </span>
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {userImage && (
              <Button
                onClick={removeImage}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </div>

        {/* Informations */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sync Auth :</strong> Récupère l'image depuis les métadonnées Auth<br/>
            <strong>Générer :</strong> Crée une image par défaut basée sur le nom/email<br/>
            <strong>Upload :</strong> Télécharge une image personnalisée
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
