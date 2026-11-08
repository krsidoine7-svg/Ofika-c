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
import { useState, useEffect, type CSSProperties } from "react"
import { trackContactAction } from "@/lib/services/profile-analytics"
import { generateCompleteVCard } from "@/lib/utils/vcard"

interface AddToContactsAutoProps {
  profile: ProfileWithLinks
  variant?: 'button' | 'minimal' | 'auto'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  /** Style en ligne optionnel (ex : couleur d'accent du thème) */
  style?: CSSProperties
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
  style,
  onContactAdded
}: AddToContactsAutoProps) {
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

  const downloadVCard = async (): Promise<boolean> => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const identifier = (profile as any).custom_url || (profile as any).username || profile.id
      const serverUrl = `${baseUrl}/api/contacts/${encodeURIComponent(identifier)}`
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

      // 1. Sur iOS (Safari/Chrome iOS) : Redirection directe sur l'URL serveur
      // Safari détecte le MIME text/vcard inline et ouvre instantanément la fiche Contact native Apple
      if (isIOS) {
        window.location.href = serverUrl
        return true
      }

      // 2. Sur Android et Ordinateur : Téléchargement automatique et propre
      const fileName = `${(profile.name || 'contact').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.vcf`
      const link = document.createElement('a')
      link.href = serverUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 300)

      return true
    } catch (error) {
      console.warn('Erreur téléchargement serveur, tentative locale:', error)
      // Fallback local hors-ligne en cas de coupure réseau
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const vcardContent = generateCompleteVCard(profile, baseUrl)
        const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${(profile.name || 'contact').replace(/\s+/g, '_')}.vcf`
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 300)
        return true
      } catch (fallbackErr) {
        console.error('Erreur fallback vCard:', fallbackErr)
        return false
      }
    }
  }

  /**
   * Gestionnaire principal d'ajout aux contacts
   */
  const handleAddToContacts = async () => {
    if (!profile?.id && !profile?.name) {
      toast.error('Informations du profil incomplètes')
      return
    }

    setIsProcessing(true)

    try {
      const success = await downloadVCard()

      if (success) {
        setContactAdded(true)
        onContactAdded?.()

        // Tracking d'analyse unifié
        trackContactAction(profile.id, 'vcard_download').catch(e => console.error('Error tracking contact download:', e))

        toast.success("Fiche contact prête !", {
          description: "Ajoutée directement à votre carnet d'adresses.",
          duration: 4000,
        })
      } else {
        throw new Error('Échec du téléchargement')
      }
    } catch (error) {
      console.error('Erreur ajout aux contacts:', error)
      toast.error("Erreur lors de l'ajout du contact. Réessayez.")
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
        style={style}
        className={`bg-blue-600 hover:bg-blue-700 text-white min-w-0 max-w-full overflow-hidden text-xs px-1 gap-1 whitespace-normal ${className}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            <span className="truncate">Ajout...</span>
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Ajouter</span>
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
