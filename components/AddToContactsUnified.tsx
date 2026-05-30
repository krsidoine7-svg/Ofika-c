"use client"

import { Button } from "@/components/core/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import {
  UserPlus,
  Download,
  Smartphone,
  Share2,
  Copy,
  Check,
  QrCode,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink
} from "lucide-react"
import { Profile } from "@/lib/types/database"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { useProfileAnalytics } from "@/lib/hooks/useProfileAnalytics"

interface AddToContactsUnifiedProps {
  profile: Profile
  variant?: 'button' | 'card' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
  showQRCode?: boolean
  className?: string
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
  supportsQRCode: boolean
}

export function AddToContactsUnified({
  profile,
  variant = 'button',
  size = 'default',
  showQRCode = false,
  className = ""
}: AddToContactsUnifiedProps) {
  const router = useRouter()
  const { trackContact } = useProfileAnalytics(profile.id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    isSafari: false,
    isChrome: false,
    supportsWebShare: false,
    supportsClipboard: false,
    supportsQRCode: false
  })

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
    const supportsQRCode = 'BarcodeDetector' in window || 'QRCodeDetector' in window

    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isSafari,
      isChrome,
      supportsWebShare,
      supportsClipboard,
      supportsQRCode
    })
  }, [])

  // Génération vCard complète avec tous les champs
  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `N:${profile.name};;;`,
      profile.bio ? `NOTE:${profile.bio}` : '',
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.phone ? `TEL:${profile.phone}` : '',
      profile.image_url ? `PHOTO:${profile.image_url}` : '',
      // Réseaux sociaux depuis social_links
      ...(profile.social_links || []).map(link => `URL:${link.url}`),
      // URL du profil public
      `URL:${typeof window !== 'undefined' ? window.location.href : ''}`,
      'END:VCARD'
    ].filter(line => line).join('\n')

    return vcard
  }

  // Génération QR Code pour le vCard
  const generateQRCodeData = () => {
    const vcard = generateVCard()
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`
  }

  // Ajout aux contacts iOS
  const handleIOSContactAdd = async () => {
    try {
      setIsGenerating(true)
      const vcard = generateVCard()
      console.log('iOS - vCard généré:', vcard.substring(0, 100) + '...')

      // Vérifier si l'API Web Share est disponible (iOS 12.2+)
      // ET si on est sur HTTPS
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'

      if (isSecureContext && navigator.share && navigator.canShare) {
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const file = new File([blob], `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`, {
          type: 'text/vcard'
        })

        // Vérifier si on peut partager ce fichier
        if (navigator.canShare({ files: [file] })) {
          console.log('iOS - Utilisation de Web Share API')

          try {
            await navigator.share({
              title: `Contact: ${profile.name}`,
              files: [file]
            })

            toast.success('Contact partagé avec succès !')
            setIsGenerating(false)
            return
          } catch (shareError) {
            // Si l'utilisateur annule, ne rien faire
            if (shareError instanceof Error && shareError.name === 'AbortError') {
              console.log('iOS - Partage annulé par l\'utilisateur')
              setIsGenerating(false)
              return
            }
            console.error('iOS - Erreur Web Share:', shareError)
          }
        }
      }

      // Fallback : Téléchargement classique pour anciennes versions d'iOS
      console.log('iOS - Fallback sur téléchargement')
      const blob = new Blob([vcard], { type: 'text/x-vcard' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`
      link.style.display = 'none'
      document.body.appendChild(link)

      console.log('iOS - Téléchargement du fichier...')
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      toast.info('Cliquez sur "Enregistrer" dans la notification pour continuer', {
        duration: 5000
      })
      await trackContact('vcard_download')
    } catch (error) {
      console.error('Error opening iOS contacts:', error)
      toast.error('Erreur lors de l\'ajout du contact')
    } finally {
      setIsGenerating(false)
    }
  }

  // Ajout aux contacts Android
  const handleAndroidContactAdd = async () => {
    try {
      setIsGenerating(true)
      const vcard = generateVCard()
      console.log('Android - vCard généré:', vcard.substring(0, 100) + '...')

      // Vérifier si l'API Web Share est disponible et supporte les fichiers
      // ET si on est sur HTTPS (requis pour Web Share)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'

      if (isSecureContext && navigator.share && navigator.canShare) {
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const file = new File([blob], `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`, {
          type: 'text/vcard'
        })

        // Vérifier si on peut partager ce fichier
        if (navigator.canShare({ files: [file] })) {
          console.log('Android - Utilisation de Web Share API')

          try {
            await navigator.share({
              title: `Contact: ${profile.name}`,
              text: `Ajoutez ${profile.name} à vos contacts`,
              files: [file]
            })

            toast.success('Contact partagé avec succès !')
            setIsGenerating(false)
            return
          } catch (shareError) {
            // Si l'utilisateur annule ou erreur, continuer avec le téléchargement
            if (shareError instanceof Error && shareError.name === 'AbortError') {
              console.log('Android - Partage annulé par l\'utilisateur')
              setIsGenerating(false)
              return
            }
            console.error('Android - Erreur Web Share:', shareError)
          }
        }
      }

      // Fallback : Téléchargement classique si Web Share n'est pas disponible
      console.log('Android - Fallback sur téléchargement')
      const blob = new Blob([vcard], { type: 'text/x-vcard' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`
      link.style.display = 'none'
      document.body.appendChild(link)

      console.log('Android - Téléchargement du fichier...')
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      toast.info('📥 Cliquez sur "Enregistrer" dans la notification, puis ouvrez le fichier pour l\'importer dans Contacts', {
        duration: 6000
      })
      await trackContact('vcard_download')
    } catch (error) {
      console.error('Error opening Android contacts:', error)
      toast.error('Erreur lors de l\'ajout du contact')
    } finally {
      setIsGenerating(false)
    }
  }

  // Ajout aux contacts mobile (détection automatique)
  const handleMobileContactAdd = async () => {
    if (deviceInfo.isIOS) {
      await handleIOSContactAdd()
    } else if (deviceInfo.isAndroid) {
      await handleAndroidContactAdd()
    } else {
      await handleDownloadContact()
    }
  }

  // Téléchargement du fichier vCard
  const handleDownloadContact = async () => {
    console.log('handleDownloadContact - Début du téléchargement')
    try {
      setIsGenerating(true)
      const vcard = generateVCard()
      console.log('vCard généré:', vcard.substring(0, 100) + '...')

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      console.log('Blob URL créé:', url)

      const fileName = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`
      console.log('Nom du fichier:', fileName)

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)

      console.log('Déclenchement du téléchargement...')
      link.click()

      // Nettoyer après un délai
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('Nettoyage effectué')
      }, 100)

      toast.success('Fichier de contact téléchargé !')
      await trackContact('vcard_download')
    } catch (error) {
      console.error('Error downloading vCard:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setIsGenerating(false)
    }
  }

  // Partage via Web Share API
  const handleWebShare = async () => {
    // Sur desktop, télécharger directement le fichier
    if (!deviceInfo.supportsWebShare || deviceInfo.isDesktop) {
      console.log('Web Share non supporté ou desktop détecté - téléchargement direct')
      await handleDownloadContact()
      return
    }

    try {
      setIsGenerating(true)
      const vcard = generateVCard()
      const blob = new Blob([vcard], { type: 'text/vcard' })
      const file = new File([blob], `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`, {
        type: 'text/vcard'
      })

      // Vérifier si le partage de fichiers est supporté
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        console.log('Partage de fichiers non supporté - téléchargement direct')
        await handleDownloadContact()
        return
      }

      await navigator.share({
        title: `Contact: ${profile.name}`,
        text: `Ajoutez ${profile.name} à vos contacts`,
        files: [file]
      })

      toast.success('Contact partagé avec succès !')
      await trackContact('share_clicked')
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur lors du partage:', error)
        await handleDownloadContact()
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Copie du vCard dans le presse-papiers
  const handleCopyVCard = async () => {
    try {
      const vcard = generateVCard()
      await navigator.clipboard.writeText(vcard)
      setIsCopied(true)
      toast.success('vCard copié dans le presse-papiers !')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying vCard:', error)
      toast.error('Erreur lors de la copie')
    }
  }

  // Action principale selon l'appareil
  const handleMainAction = async () => {
    console.log('handleMainAction - deviceInfo:', deviceInfo)
    try {
      if (deviceInfo.isMobile) {
        console.log('Mode mobile détecté - Redirection vers la page de prévisualisation')

        // Obtenir le username ou custom_url du profil
        const profileUrl = profile.custom_url || profile.username

        if (!profileUrl) {
          toast.error('Impossible de trouver l\'URL du profil')
          return
        }

        // Rediriger vers la page de prévisualisation
        router.push(`/contact-preview/${profileUrl}`)
      } else {
        console.log('Mode desktop détecté')
        await handleDownloadContact()
      }
    } catch (error) {
      console.error('Erreur dans handleMainAction:', error)
      toast.error('Erreur lors de l\'ajout du contact')
    }
  }

  // Rendu du bouton simple
  if (variant === 'button') {
    return (
      <Button
        onClick={handleMainAction}
        disabled={isGenerating}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        size={size}
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        {isGenerating
          ? 'Génération...'
          : 'Ajouter aux contacts'
        }
      </Button>
    )
  }

  // Rendu minimal
  if (variant === 'minimal') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <Button
          onClick={handleMainAction}
          disabled={isGenerating}
          size="sm"
          variant="outline"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>

        {showQRCode && deviceInfo.supportsQRCode && (
          <Button
            onClick={() => setShowQRModal(true)}
            size="sm"
            variant="outline"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  // Rendu complet en carte
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Ajouter aux contacts</span>
        </CardTitle>
        <CardDescription>
          {deviceInfo.isMobile
            ? 'Cliquez pour ajouter directement à vos contacts'
            : 'Téléchargez ou partagez le fichier de contact'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bouton principal */}
        <Button
          onClick={handleMainAction}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          ) : (
            <Smartphone className="h-5 w-5 mr-2" />
          )}
          {isGenerating
            ? 'Génération...'
            : 'Ajouter aux contacts'
          }
        </Button>

        {/* Actions secondaires */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadContact}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Télécharger
          </Button>

          {deviceInfo.supportsClipboard && (
            <Button
              onClick={handleCopyVCard}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-1 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {isCopied ? 'Copié' : 'Copier'}
            </Button>
          )}
        </div>

        {/* QR Code si supporté */}
        {showQRCode && deviceInfo.supportsQRCode && (
          <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <QrCode className="h-4 w-4 mr-1" />
                Afficher QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code du Contact</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Scannez ce QR Code pour ajouter le contact :
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex justify-center items-center">
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                      <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={typeof window !== 'undefined' ? window.location.href : ''}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scannez pour ouvrir le profil sur votre mobile
                  </p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generateQRCodeData())
                    toast.success('Données QR Code copiées !')
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copier les données
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Informations de compatibilité */}
        <div className="text-xs text-gray-500 space-y-1">
          {deviceInfo.isMobile ? (
            <div>
              <p>Le contact sera ajouté à :</p>
              <p>• {deviceInfo.isIOS ? 'App Contacts iOS' : 'App Contacts Android'}</p>
              <p>• Toutes vos informations de contact</p>
            </div>
          ) : (
            <div>
              <p>Le fichier .vcf peut être importé dans :</p>
              <p>• Contacts iPhone/Android</p>
              <p>• Outlook, Gmail, Thunderbird</p>
              <p>• Toute application de contacts</p>
            </div>
          )}
        </div>

        {/* Badges de compatibilité */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
          </Badge>
          {deviceInfo.supportsWebShare && (
            <Badge variant="secondary" className="text-xs">
              Web Share
            </Badge>
          )}
          {deviceInfo.supportsClipboard && (
            <Badge variant="secondary" className="text-xs">
              Clipboard
            </Badge>
          )}
          {deviceInfo.supportsQRCode && (
            <Badge variant="secondary" className="text-xs">
              QR Code
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
