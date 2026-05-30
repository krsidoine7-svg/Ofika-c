"use client"

import { useState, useEffect } from 'react'
import { ProfileWithLinks } from '@/lib/types/database'
import { toast } from 'sonner'

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
  userAgent: string
}

interface ContactShareState {
  isGenerating: boolean
  isCopied: boolean
  deviceInfo: DeviceInfo
}

export function useContactShare(profile: ProfileWithLinks) {
  const [state, setState] = useState<ContactShareState>({
    isGenerating: false,
    isCopied: false,
    deviceInfo: {
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isDesktop: false,
      isSafari: false,
      isChrome: false,
      supportsWebShare: false,
      supportsClipboard: false,
      supportsQRCode: false,
      userAgent: ''
    }
  })

  // Détection avancée des appareils et navigateurs
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

    setState(prev => ({
      ...prev,
      deviceInfo: {
        isIOS,
        isAndroid,
        isMobile,
        isDesktop,
        isSafari,
        isChrome,
        supportsWebShare,
        supportsClipboard,
        supportsQRCode,
        userAgent
      }
    }))
  }, [])

  // Génération vCard complète et optimisée
  const generateVCard = (): string => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `N:${profile.name};;;`,
      profile.bio ? `NOTE:${profile.bio}` : '',
      profile.phone ? `TEL:${profile.phone}` : '',
      // profile.email ? `EMAIL:${profile.email}` : '',
      // profile.address ? `ADR:;;${profile.address};;;;` : '',
      profile.image_url ? `PHOTO:${profile.image_url}` : '',
      // Réseaux sociaux comme URLs avec labels
      ...(profile.social_links?.map(link => `URL;TYPE=${link.platform}:${link.url}`) || []),
      // URL du profil public
      `URL;TYPE=Profile:${typeof window !== 'undefined' ? window.location.href : ''}`,
      'END:VCARD'
    ].filter(line => line).join('\n')

    return vcard
  }

  // Génération QR Code pour le vCard
  const generateQRCodeData = (): string => {
    const vcard = generateVCard()
    return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`
  }

  // Ajout aux contacts iOS
  const handleIOSContactAdd = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }))
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
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // Ajout aux contacts Android
  const handleAndroidContactAdd = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }))
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
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // Ajout aux contacts mobile (détection automatique)
  const handleMobileContactAdd = async (): Promise<void> => {
    if (state.deviceInfo.isIOS) {
      await handleIOSContactAdd()
    } else if (state.deviceInfo.isAndroid) {
      await handleAndroidContactAdd()
    } else {
      await handleDownloadContact()
    }
  }

  // Téléchargement du fichier vCard
  const handleDownloadContact = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }))
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
      console.error('Error downloading vCard:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // Partage via Web Share API
  const handleWebShare = async (): Promise<void> => {
    if (!state.deviceInfo.supportsWebShare) {
      await handleDownloadContact()
      return
    }

    try {
      setState(prev => ({ ...prev, isGenerating: true }))
      const vcard = generateVCard()
      const blob = new Blob([vcard], { type: 'text/vcard' })
      const file = new File([blob], `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`, {
        type: 'text/vcard'
      })

      await navigator.share({
        title: `Contact: ${profile.name}`,
        text: `Ajoutez ${profile.name} à vos contacts`,
        files: [file]
      })
      
      toast.success('Contact partagé avec succès !')
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur lors du partage:', error)
        await handleDownloadContact()
      }
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // Copie du vCard dans le presse-papiers
  const handleCopyVCard = async (): Promise<void> => {
    try {
      const vcard = generateVCard()
      await navigator.clipboard.writeText(vcard)
      setState(prev => ({ ...prev, isCopied: true }))
      toast.success('vCard copié dans le presse-papiers !')
      setTimeout(() => setState(prev => ({ ...prev, isCopied: false })), 2000)
    } catch (error) {
      console.error('Error copying vCard:', error)
      toast.error('Erreur lors de la copie')
    }
  }

  // Action principale selon l'appareil
  const handleMainAction = async (): Promise<void> => {
    if (state.deviceInfo.isMobile) {
      await handleMobileContactAdd()
    } else {
      await handleWebShare()
    }
  }

  // Obtenir le texte du bouton principal
  const getMainButtonText = (): string => {
    if (state.isGenerating) return 'Génération...'
    if (state.deviceInfo.isMobile) return 'Ajouter aux contacts'
    return 'Partager le contact'
  }

  // Obtenir l'icône du bouton principal
  const getMainButtonIcon = () => {
    if (state.isGenerating) {
      return 'loading'
    }
    return state.deviceInfo.isMobile ? 'Smartphone' : 'Share2'
  }

  return {
    ...state,
    generateVCard,
    generateQRCodeData,
    handleIOSContactAdd,
    handleAndroidContactAdd,
    handleMobileContactAdd,
    handleDownloadContact,
    handleWebShare,
    handleCopyVCard,
    handleMainAction,
    getMainButtonText,
    getMainButtonIcon
  }
}
