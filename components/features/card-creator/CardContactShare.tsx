"use client"

import { Button } from "@/components/core/ui/button"
import { Smartphone, Download, Share2, QrCode, Copy, Check, Mail } from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface CardContactShareProps {
  profile: ProfileWithLinks
  cardType: 'nfc_qr' | 'qr_only'
  cardUrl?: string
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
}

export function CardContactShare({ profile, cardType, cardUrl }: CardContactShareProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    isSafari: false,
    isChrome: false,
    supportsWebShare: false,
    supportsClipboard: false
  })

  useEffect(() => {
    const user_agent = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(user_agent)
    const isAndroid = /Android/i.test(user_agent)
    const isMobile = isIOS || isAndroid || /Mobile/i.test(user_agent)
    const isDesktop = !isMobile
    const isSafari = /Safari/i.test(user_agent) && !/Chrome/i.test(user_agent)
    const isChrome = /Chrome/i.test(user_agent)
    const supportsWebShare = 'share' in navigator
    const supportsClipboard = 'clipboard' in navigator

    setDeviceInfo({ 
      isIOS, 
      isAndroid, 
      isMobile, 
      isDesktop, 
      isSafari, 
      isChrome,
      supportsWebShare,
      supportsClipboard
    })
  }, [])

  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `N:${profile.name};;;`,
      profile.bio ? `NOTE:${profile.bio}` : '',
      profile.image_url ? `PHOTO:${profile.image_url}` : '',
      `URL:${cardUrl || window.location.href}`,
      'END:VCARD'
    ].filter(line => line).join('\n')

    return vcard
  }

  const handleIOSContactAdd = () => {
    try {
      const vcard = generateVCard()
      const dataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.style.display = 'none'
      link.setAttribute('download', `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Ouverture de l\'app Contacts...')
    } catch (error) {
      console.error('Error opening iOS contacts:', error)
      toast.error('Erreur lors de l\'ouverture des contacts')
    }
  }

  const handleAndroidContactAdd = () => {
    try {
      const vcard = generateVCard()
      const dataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`
      
      const newWindow = window.open(dataUrl, '_blank')
      if (!newWindow) {
        const link = document.createElement('a')
        link.href = dataUrl
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      toast.success('Ouverture de l\'app Contacts...')
    } catch (error) {
      console.error('Error opening Android contacts:', error)
      toast.error('Erreur lors de l\'ouverture des contacts')
    }
  }

  const handleMobileContactAdd = () => {
    if (deviceInfo.isIOS) {
      handleIOSContactAdd()
    } else if (deviceInfo.isAndroid) {
      handleAndroidContactAdd()
    } else {
      handleDownloadContact()
    }
  }

  const handleDownloadContact = async () => {
    try {
      setIsGenerating(true)
      const vcard = generateVCard()
      const blob = new Blob([vcard], { type: 'text/vcard' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Fichier de contact téléchargé !')
    } catch (error) {
      console.error('Error generating vCard:', error)
      toast.error('Erreur lors de la génération du contact')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWebShare = async () => {
    try {
      if (deviceInfo.supportsWebShare) {
        await navigator.share({
          title: `${profile.name} - Carte Ofika`,
          text: profile.bio || `Carte de contact ${profile.name} sur Ofika`,
          url: cardUrl || window.location.href,
        })
        toast.success('Carte partagée !')
      } else {
        handleCopyLink()
      }
    } catch (error) {
      console.error('Error sharing:', error)
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Erreur lors du partage')
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = cardUrl || window.location.href
      if (deviceInfo.supportsClipboard) {
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success('Lien copié dans le presse-papiers !')
        setTimeout(() => setIsCopied(false), 2000)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setIsCopied(true)
        toast.success('Lien copié dans le presse-papiers !')
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Erreur lors de la copie du lien')
    }
  }

  const handleEmailShare = () => {
    const subject = `Carte de contact ${profile.name} - Ofika`
    const body = `Découvrez la carte de contact de ${profile.name} sur Ofika :\n\n${cardUrl || window.location.href}`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl)
  }

  const getButtonText = () => {
    if (isGenerating) return 'Génération...'
    if (deviceInfo.isMobile) return 'Ajouter aux contacts'
    return 'Télécharger le contact'
  }

  const getButtonIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5 mr-2" />
    return <Download className="h-4 w-4 mr-2" />
  }

  const getShareButtonText = () => {
    if (deviceInfo.supportsWebShare) return 'Partager la carte'
    return isCopied ? 'Lien copié !' : 'Copier le lien'
  }

  const getShareButtonIcon = () => {
    if (deviceInfo.supportsWebShare) return <Share2 className="h-4 w-4 mr-2" />
    return isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Partager la carte
        </h3>
        <p className="text-gray-600 text-sm">
          {deviceInfo.isMobile 
            ? 'Ajoutez directement aux contacts ou partagez la carte' 
            : 'Téléchargez le contact ou partagez la carte'
          }
        </p>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={deviceInfo.isMobile ? handleMobileContactAdd : handleDownloadContact}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleWebShare}
            variant="outline"
            className="w-full"
          >
            {getShareButtonIcon()}
            {getShareButtonText()}
          </Button>
          
          <Button
            onClick={handleEmailShare}
            variant="outline"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        {deviceInfo.isMobile ? (
          <div>
            <p>Le contact sera ajouté à votre répertoire :</p>
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
    </div>
  )
}
