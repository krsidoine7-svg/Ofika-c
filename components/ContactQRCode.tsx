"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog"
import { Button } from "@/components/core/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { QrCode, Download, Copy, Check, Share2 } from "lucide-react"
import { ProfileWithLinks } from '@/lib/types/database'
import { toast } from "sonner"

interface ContactQRCodeProps {
  profile: ProfileWithLinks
  variant?: 'button' | 'card'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ContactQRCode({ 
  profile, 
  variant = 'button',
  size = 'default',
  className = ""
}: ContactQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)

  // Génération des données QR Code
  useEffect(() => {
    if (isOpen) {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.name}`,
        `N:${profile.name};;;`,
        profile.bio ? `NOTE:${profile.bio}` : '',
        // profile.email ? `EMAIL:${profile.email}` : '',
        profile.image_url ? `PHOTO:${profile.image_url}` : '',
        ...(profile.social_links?.map(link => `URL;TYPE=${link.platform}:${link.url}`) || []),
        `URL;TYPE=Profile:${typeof window !== 'undefined' ? window.location.href : ''}`,
        'END:VCARD'
      ].filter(line => line).join('\n')

      setQrCodeData(`data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`)
    }
  }, [isOpen, profile])

  // Copie des données QR Code
  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData)
      setIsCopied(true)
      toast.success('Données QR Code copiées !')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying QR data:', error)
      toast.error('Erreur lors de la copie')
    }
  }

  // Téléchargement du QR Code (placeholder pour implémentation future)
  const handleDownloadQR = () => {
    toast.info('Fonctionnalité de téléchargement QR Code à implémenter')
  }

  // Partage du QR Code
  const handleShareQR = async () => {
    if (!navigator.share) {
      toast.error('Partage non supporté sur cet appareil')
      return
    }

    try {
      await navigator.share({
        title: `QR Code Contact: ${profile.name}`,
        text: `Scannez ce QR Code pour ajouter ${profile.name} à vos contacts`,
        url: window.location.href
      })
      toast.success('QR Code partagé !')
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing QR:', error)
        toast.error('Erreur lors du partage')
      }
    }
  }

  // Rendu du bouton simple
  if (variant === 'button') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className={className}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code du Contact</DialogTitle>
          </DialogHeader>
          <QRCodeContent 
            profile={profile}
            qrCodeData={qrCodeData}
            isCopied={isCopied}
            onCopy={handleCopyData}
            onDownload={handleDownloadQR}
            onShare={handleShareQR}
            size={size}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Rendu en carte
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>QR Code du Contact</span>
        </CardTitle>
        <CardDescription>
          Scannez pour ajouter directement aux contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Afficher le QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code du Contact</DialogTitle>
            </DialogHeader>
            <QRCodeContent 
              profile={profile}
              qrCodeData={qrCodeData}
              isCopied={isCopied}
              onCopy={handleCopyData}
              onDownload={handleDownloadQR}
              onShare={handleShareQR}
              size={size}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

// Composant interne pour le contenu du QR Code
function QRCodeContent({ 
  profile, 
  qrCodeData, 
  isCopied, 
  onCopy, 
  onDownload, 
  onShare,
  size
}: {
  profile: ProfileWithLinks
  qrCodeData: string
  isCopied: boolean
  onCopy: () => void
  onDownload: () => void
  onShare: () => void
  size: 'sm' | 'default' | 'lg'
}) {
  return (
    <div className="space-y-4">
      {/* Zone QR Code */}
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 mb-4">
          {/* Placeholder pour le QR Code réel */}
          <div className={`${size === 'sm' ? 'w-32 h-32' : size === 'lg' ? 'w-64 h-64' : 'w-48 h-48'} mx-auto bg-gray-100 rounded-lg flex items-center justify-center`}>
            <div className="text-center">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">QR Code</p>
              <p className="text-xs text-gray-400">
                {profile.name}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          Scannez ce QR Code pour ajouter le contact :
        </p>
        <p className="text-xs text-gray-500">
          {profile.name}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onCopy}
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
        
        <Button
          onClick={onDownload}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-1" />
          Télécharger
        </Button>
      </div>

      {/* Partage */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          onClick={onShare}
          className="w-full"
          size="sm"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Partager le QR Code
        </Button>
      )}

      {/* Informations de compatibilité */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Compatible avec :</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">iPhone</Badge>
          <Badge variant="secondary" className="text-xs">Android</Badge>
          <Badge variant="secondary" className="text-xs">Caméra</Badge>
          <Badge variant="secondary" className="text-xs">Apps QR</Badge>
        </div>
      </div>

      {/* Note de développement */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-700">
          <strong>Note :</strong> Le QR Code réel sera généré avec une bibliothèque 
          comme qrcode.js ou react-qr-code. Actuellement, c'est un placeholder.
        </p>
      </div>
    </div>
  )
}
