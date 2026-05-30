'use client'

import { useState } from 'react'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent } from "@/components/core/ui/card"
import { Download, Share2, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { ContactData } from '@/lib/types/contact-analytics'
import { downloadVCard, shareVCard, isWebShareSupported, isWebShareFilesSupported } from '@/lib/utils/vcard-generator'
import { trackContactAction, getDeviceType } from '@/lib/services/contact-analytics'

interface AddToContactsButtonProps {
  contactData: ContactData
  profileId: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function AddToContactsButton({ 
  contactData, 
  profileId, 
  className,
  variant = 'default',
  size = 'default'
}: AddToContactsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<'none' | 'download' | 'share'>('none')

  const handleAddToContacts = async () => {
    setIsLoading(true)
    
    try {
      // Enregistrer l'action de génération
      await trackContactAction(profileId, 'vcard_generated', navigator.userAgent, getDeviceType())
      
      // Vérifier le support Web Share API
      const canShare = isWebShareSupported() && isWebShareFilesSupported()
      
      if (canShare) {
        // Essayer le partage natif (mobile)
        const shared = await shareVCard(contactData)
        
        if (shared) {
          setAction('share')
          await trackContactAction(profileId, 'vcard_shared', navigator.userAgent, getDeviceType())
          toast.success('Contact partagé avec succès !')
        } else {
          // Fallback vers téléchargement
          downloadVCard(contactData)
          setAction('download')
          await trackContactAction(profileId, 'vcard_downloaded', navigator.userAgent, getDeviceType())
          toast.success('Fichier de contact téléchargé !')
        }
      } else {
        // Téléchargement direct (desktop)
        downloadVCard(contactData)
        setAction('download')
        await trackContactAction(profileId, 'vcard_downloaded', navigator.userAgent, getDeviceType())
        toast.success('Fichier de contact téléchargé !')
      }
    } catch (error) {
      console.error('Error adding to contacts:', error)
      toast.error('Erreur lors de l\'ajout aux contacts')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }
    
    if (action === 'share') {
      return <CheckCircle className="w-4 h-4" />
    }
    
    if (action === 'download') {
      return <Download className="w-4 h-4" />
    }
    
    // Icône par défaut selon le support
    if (isWebShareSupported()) {
      return <Share2 className="w-4 h-4" />
    }
    
    return <Download className="w-4 h-4" />
  }

  const getButtonText = () => {
    if (isLoading) {
      return 'Ajout en cours...'
    }
    
    if (action === 'share') {
      return 'Ajouté !'
    }
    
    if (action === 'download') {
      return 'Téléchargé !'
    }
    
    // Texte par défaut selon le support
    if (isWebShareSupported()) {
      return 'Ajouter aux contacts'
    }
    
    return 'Télécharger le contact'
  }

  return (
    <Button
      onClick={handleAddToContacts}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {getButtonIcon()}
      <span className="ml-2">{getButtonText()}</span>
    </Button>
  )
}

// Composant avec instructions détaillées
export function AddToContactsCard({ contactData, profileId }: { contactData: ContactData, profileId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Ajouter aux contacts</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Masquer' : 'Instructions'}
          </Button>
        </div>

        <AddToContactsButton 
          contactData={contactData} 
          profileId={profileId}
          className="w-full"
        />

        {isExpanded && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Comment ajouter ce contact :</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 mt-0.5 text-green-500" />
                <div>
                  <strong>Sur mobile :</strong> Le contact s'ouvrira automatiquement dans votre app Contacts
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 mt-0.5 text-blue-500" />
                <div>
                  <strong>Sur ordinateur :</strong> Un fichier .vcf sera téléchargé que vous pourrez importer
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-orange-500" />
                <div>
                  <strong>Note :</strong> Le fichier contient toutes les informations de contact disponibles
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
