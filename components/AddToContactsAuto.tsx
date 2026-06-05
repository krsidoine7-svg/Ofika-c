'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  CheckCircle,
  Loader2
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePushNotifications } from "@/lib/hooks/usePushNotifications"
import { trackContactAction } from "@/lib/services/profile-analytics"

interface AddToContactsAutoProps {
  profile: ProfileWithLinks
  variant?: 'button' | 'minimal' | 'auto'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onContactAdded?: () => void
}

interface DeviceInfo {
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  isDesktop: boolean
  isSafari: boolean
  isChrome: boolean
  supportsWebShare: boolean
  supportsClipboard: boolean
  userAgent: string
}

export function AddToContactsAuto({
  profile,
  variant = 'auto',
  size = 'default',
  className = "",
  onContactAdded
}: AddToContactsAutoProps) {
  const { subscribeToPush } = usePushNotifications()
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    isSafari: false,
    isChrome: false,
    supportsWebShare: false,
    supportsClipboard: false,
    userAgent: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [contactAdded, setContactAdded] = useState(false)

  // Détection automatique de l'appareil
  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    const isAndroid = /Android/i.test(userAgent)
    const isMobile = isIOS || isAndroid || /Mobile/i.test(userAgent)
    const isDesktop = !isMobile
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)
    const isChrome = /Chrome/i.test(userAgent)
    const supportsWebShare = 'share' in navigator && 'canShare' in navigator
    const supportsClipboard = 'clipboard' in navigator && 'writeText' in navigator.clipboard

    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isSafari,
      isChrome,
      supportsWebShare,
      supportsClipboard,
      userAgent
    })
  }, [])

  /**
   * Télécharge automatiquement le fichier vCard depuis l'API
   */
  const downloadVCard = async (): Promise<boolean> => {
    try {
      const apiUrl = `${window.location.origin}/api/contacts/${profile.id}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du téléchargement')
      }

      const vcardContent = await response.text()
      const fileName = `${profile.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.vcf`

      // Créer et déclencher le téléchargement
      const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      // SPÉCIFIQUE iOS : Ouvrir directement l'URL
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = url
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
        return true
      }

      // Autres appareils (Android, Desktop)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      return true
    } catch (error) {
      console.error('Erreur téléchargement vCard:', error)
      return false
    }
  }

  /**
   * Partage via Web Share API (iOS/Android moderne)
   */
  const shareViaWebShare = async (): Promise<boolean> => {
    try {
      const apiUrl = `${window.location.origin}/api/contacts/${profile.id}`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error('Erreur API')

      const vcardContent = await response.text()
      const blob = new Blob([vcardContent], { type: 'text/vcard' })
      const file = new File([blob], `${profile.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.vcf`, {
        type: 'text/vcard'
      })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Contact: ${profile.name}`,
          text: `Carte de visite de ${profile.name}`,
          files: [file]
        })
        return true
      }

      return false
    } catch (error: any) {
      // Ignorer l'erreur si l'utilisateur a annulé ou si ce n'est pas permis
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        console.error('Erreur Web Share:', error)
      }
      return false
    }
  }

  /**
   * Gestionnaire principal d'ajout aux contacts
   */
  const handleAddToContacts = async () => {
    if (!profile?.id || !profile?.name) {
      toast.error('Informations du profil incomplètes')
      return
    }

    setIsProcessing(true)

    try {
      let success = false

      // 1. Essayer Web Share API (iOS 12.2+, Android moderne)
      if (deviceInfo.supportsWebShare && deviceInfo.isMobile) {
        console.log('Tentative Web Share API...')
        success = await shareViaWebShare()

        if (success) {
          toast.success('Contact partagé avec succès ! Ouvrez le fichier pour l\'importer.')
          setContactAdded(true)
          onContactAdded?.()

          // Tracking Web Share
          trackContactAction(profile.id, 'share_clicked').catch(e => console.error('Error tracking contact share:', e))
          try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase.rpc('log_contact_activity', {
                p_contact_id: profile.id,
                p_activity_type: 'share',
                p_metadata: { source: 'web_share' }
              })
            }
          } catch (e) { }
          return
        }
      }

      // 2. Fallback : Téléchargement automatique
      console.log('Utilisation du téléchargement automatique...')
      success = await downloadVCard()

      if (success) {
        setContactAdded(true)
        onContactAdded?.()

        // --- TRACKING & FEEDBACK UNIFIÉ ---
        trackContactAction(profile.id, 'vcard_download').catch(e => console.error('Error tracking contact download:', e))

        try {
          const supabase = createClient()
            // TOUJOURS MONTRER L'OPTION : Succès + Action Rappel (pour User et Guest)
            toast.success("Contact sauvegardé !", {
              description: "Voulez-vous activer les rappels automatiques ?",
              duration: 8000,
              action: {
                label: "🔔 Activer",
                onClick: async () => {
                  await subscribeToPush(profile.id)
                }
              }
            })

        } catch (err) {
          console.error('Erreur tracking:', err)
          toast.success('Contact enregistré.')
        }

      } else {
        throw new Error('Échec du téléchargement')
      }

    } catch (error) {
      console.error('Erreur ajout aux contacts:', error)
      toast.error('Erreur lors de l\'ajout du contact. Réessayez.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Variante automatique (recommandée)
  if (variant === 'auto') {
    if (contactAdded) {
      return (
        <div className={`flex items-center justify-center space-x-2 text-green-600 ${className}`}>
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Contact ajouté !</span>
        </div>
      )
    }

    return (
      <Button
        onClick={handleAddToContacts}
        disabled={isProcessing}
        size={size}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Ajout en cours...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter aux contacts
          </>
        )}
      </Button>
    )
  }

  // Variante bouton simple
  if (variant === 'button') {
    return (
      <Button
        onClick={handleAddToContacts}
        disabled={isProcessing || contactAdded}
        size={size}
        className={className}
      >
        {contactAdded ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Ajouté
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Ajout...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter
          </>
        )}
      </Button>
    )
  }

  // Variante minimal
  if (variant === 'minimal') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <Button
          onClick={handleAddToContacts}
          disabled={isProcessing || contactAdded}
          size="sm"
          variant="outline"
        >
          {contactAdded ? (
            <CheckCircle className="h-4 w-4" />
          ) : isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>

        {/* Badge d'état */}
        <Badge variant="secondary" className="text-xs">
          {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
        </Badge>
      </div>
    )
  }

  return null
}
