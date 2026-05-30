"use client"

import { useState } from 'react'
import { Button } from "@/components/core/ui/button"
import { UserPlus, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import { ProfileWithLinks } from '@/lib/types/database'

interface ContactShareButtonProps {
  profile: ProfileWithLinks
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function ContactShareButton({ profile, className, size = "lg" }: ContactShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `N:${profile.name};;;`,
      profile.bio ? `NOTE:${profile.bio}` : '',
      profile.image_url ? `PHOTO:${profile.image_url}` : '',
      `URL:${typeof window !== 'undefined' ? window.location.href : ''}`,
      // Ajouter les réseaux sociaux comme URLs
      ...(profile.social_links?.map(link => `URL:${link.url}`) || []),
      'END:VCARD'
    ].filter(line => line).join('\n')
    
    return vcard
  }

  const downloadVCard = () => {
    const vcard = generateVCard()
    const dataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`
    const link = document.createElement('a')
    link.href = dataUrl
    link.style.display = 'none'
    link.setAttribute('download', `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Contact téléchargé avec succès !')
  }

  const shareContact = async () => {
    if (!navigator.share) {
      // Fallback: télécharger le vCard
      downloadVCard()
      return
    }

    try {
      setIsSharing(true)
      
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
        // Fallback: télécharger le vCard
        downloadVCard()
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleClick = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator) {
      shareContact()
    } else {
      downloadVCard()
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isSharing}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      size={size}
    >
      {isSharing ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
      ) : (
        <>
          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <Share2 className="h-5 w-5 mr-2" />
          ) : (
            <Download className="h-5 w-5 mr-2" />
          )}
        </>
      )}
      {isSharing 
        ? 'Partage en cours...' 
        : typeof navigator !== 'undefined' && 'share' in navigator
          ? 'Ajouter aux contacts'
          : 'Télécharger le contact'
      }
    </Button>
  )
}