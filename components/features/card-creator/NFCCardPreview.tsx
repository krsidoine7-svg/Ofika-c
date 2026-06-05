'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, ExternalLink, Smartphone, QrCode, Edit2 } from "lucide-react"
import { CardVisual } from '@/components/features/card-creator/CardVisual'
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUploadFixed } from "@/components/ui/image-upload-fixed"

interface PublicPage {
  id: string
  name: string
  url: string
  type: 'profile' | 'nfc_card'
}

interface NFCCardPreviewProps {
  card: {
    id: string
    profile_name: string
    color_theme: string
    nfc_link: string
    design_choice?: string
    full_name?: string
    company?: string
    job_title?: string
    bio?: string
    phone?: string
    email?: string
    instagram?: string
    linkedin?: string
    location?: string
    logo_url?: string
    profile_photo_url?: string
  }
  publicPages?: PublicPage[]
  onClose?: () => void
  onCardUpdated?: (updatedCard: any) => void
  startInEditMode?: boolean
}

export function NFCCardPreview({ card, publicPages = [], onClose, onCardUpdated, startInEditMode = false }: NFCCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentSide, setCurrentSide] = useState<'recto' | 'verso'>('recto')

  const [selectedPageId, setSelectedPageId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [currentNfcLink, setCurrentNfcLink] = useState(card.nfc_link)
  const [isEditingCard, setIsEditingCard] = useState(startInEditMode)
  const [cardData, setCardData] = useState({
    full_name: card.full_name || card.profile_name || '',
    company: card.company || '',
    job_title: card.job_title || '',
    bio: card.bio || '',
    phone: card.phone || '',
    email: card.email || '',
    location: card.location || '',
    color_theme: card.color_theme || 'black',
    logo_url: card.logo_url || ''
  })

  useEffect(() => {
    if (publicPages.length > 0) {
      const currentPage = publicPages.find(page => {
        const normalizedPageUrl = page.url.replace(/\/$/, '')
        const normalizedCardLink = currentNfcLink.replace(/\/$/, '')
        return normalizedPageUrl === normalizedCardLink ||
          normalizedCardLink.endsWith(page.url) ||
          page.url.endsWith(normalizedCardLink.split('/').pop() || '')
      })
      if (currentPage) {
        setSelectedPageId(currentPage.id)
      }
    }
  }, [publicPages, currentNfcLink])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setCurrentSide(isFlipped ? 'recto' : 'verso')
  }

  const handleViewPublicPage = () => {
    if (currentNfcLink) {
      // Utiliser l'URL configurée ou celle du lien tel quel
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const publicUrl = currentNfcLink.startsWith('http')
        ? currentNfcLink
        : `${baseUrl}/${currentNfcLink.replace(/^\//, '')}`

      window.open(publicUrl, '_blank', 'noopener,noreferrer')
    }
  }





  const handleSaveCardDetails = async () => {
    setIsSaving(true)
    try {
      // 1. Préparer les données de base
      const updatePayload: any = {
        full_name: cardData.full_name,
        company: cardData.company,
        job_title: cardData.job_title,
        color_theme: cardData.color_theme,
        logo_url: cardData.logo_url,
        phone: cardData.phone,
        email: cardData.email,
        location: cardData.location
      };

      // 2. Ajouter les infos du lien si une page est sélectionnée
      const selectedPage = publicPages.find(p => p.id === selectedPageId);
      if (selectedPage) {
        updatePayload.nfc_link = selectedPage.url;
        if (selectedPage.type === 'profile') {
          updatePayload.profile_id = selectedPage.id.replace('profile-', '');
        } else {
          updatePayload.profile_id = null;
        }
      }

      const response = await fetch(`/api/nfc-cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour des détails')
      }

      setIsEditingCard(false)
      toast.success('Carte mise à jour avec succès !')

      if (onCardUpdated && result.data) {
        onCardUpdated(result.data)
        setCurrentNfcLink(result.data.nfc_link) // Update currentNfcLink if it changed
      }
    } catch (error) {
      console.error('Error updating NFC details:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  const displayLink = currentNfcLink

  const currentPageName = publicPages.find(page => {
    const normalizedPageUrl = page.url.replace(/\/$/, '')
    const normalizedCardLink = currentNfcLink.replace(/\/$/, '')
    return normalizedPageUrl === normalizedCardLink ||
      normalizedCardLink.endsWith(page.url) ||
      page.url.endsWith(normalizedCardLink.split('/').pop() || '')
  })?.name

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aperçu de la carte NFC</h2>
            <p className="text-gray-600">Recto et verso de votre carte de visite</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleFlip}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {currentSide === 'recto' ? 'Retourner au verso' : 'Retourner au recto'}
            </Button>
            <Button variant="outline" onClick={handleViewPublicPage}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir le profil
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Carte de visite */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                    {currentSide === 'recto' ? 'Face Recto' : 'Face Verso'}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium italic">
                    {currentSide === 'recto'
                      ? 'Informations de contact'
                      : 'QR Code & Identité'
                    }
                  </span>
                </div>
              </div>

              {/* Carte physique avec effet de profondeur */}
              <div className="relative w-full max-w-md perspective-1000 group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flip-card w-full aspect-[85/55] cursor-pointer shadow-2xl rounded-2xl overflow-visible" onClick={handleFlip}>
                  <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                    {/* Recto */}
                    <div className="flip-card-front h-full w-full">
                      <CardVisual
                        design={(card.design_choice === 'design2') ? 'design2' : 'design1'}
                        color={cardData.color_theme as any}
                        isFlipped={false}
                        data={{
                          company: cardData.company,
                          fullName: cardData.full_name,
                          jobTitle: cardData.job_title,
                          logoUrl: cardData.logo_url,
                          qrValue: currentNfcLink
                        }}
                      />
                    </div>

                    {/* Verso */}
                    <div className="flip-card-back h-full w-full">
                      <CardVisual
                        design={(card.design_choice === 'design2') ? 'design2' : 'design1'}
                        color={cardData.color_theme as any}
                        isFlipped={true}
                        data={{
                          company: cardData.company,
                          fullName: cardData.full_name,
                          jobTitle: cardData.job_title,
                          logoUrl: cardData.logo_url,
                          qrValue: currentNfcLink
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions & Mode État */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                  <RotateCcw className="w-3 h-3" />
                  Cliquez sur la carte pour la retourner
                </p>
                {isEditingCard && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 animate-pulse">
                    <Edit2 className="w-3 h-3 mr-1" />
                    MODE ÉDITION EN DIRECT
                  </div>
                )}
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="lg:w-80">
              <Card>
                <CardContent className="p-6">


                  {isEditingCard ? (
                    <div className="space-y-4">
                      {/* Edit Form */}
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="w-full flex justify-center mb-2">
                          <ImageUploadFixed
                            label=""
                            value={cardData.logo_url}
                            onChange={url => setCardData({...cardData, logo_url: url})}
                            onRemove={() => setCardData({...cardData, logo_url: ''})}
                            className="text-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nom sur la carte</Label>
                        <Input id="full_name" value={cardData.full_name} onChange={e => setCardData({...cardData, full_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Entreprise</Label>
                        <Input id="company" value={cardData.company} onChange={e => setCardData({...cardData, company: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Poste</Label>
                        <Input id="job_title" value={cardData.job_title} onChange={e => setCardData({...cardData, job_title: e.target.value})} />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input id="phone" value={cardData.phone} onChange={e => setCardData({...cardData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={cardData.email} onChange={e => setCardData({...cardData, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Localisation</Label>
                        <Input id="location" value={cardData.location} onChange={e => setCardData({...cardData, location: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur</Label>
                        <Select value={cardData.color_theme} onValueChange={val => setCardData({...cardData, color_theme: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="black">Noir</SelectItem>
                            <SelectItem value="white">Blanc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-blue-600 font-medium">Page Link to Bio associée</Label>
                        <Select
                          value={selectedPageId}
                          onValueChange={setSelectedPageId}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Choisir une page..." />
                          </SelectTrigger>
                          <SelectContent>
                            {publicPages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1" disabled={isSaving} onClick={handleSaveCardDetails}>
                          {isSaving ? 'Enregistrement...' : 'Enregistrer tout'}
                        </Button>
                        <Button variant="outline" className="flex-1" disabled={isSaving} onClick={() => {
                          setIsEditingCard(false);
                          // Reset cardData to current card state
                          setCardData({
                            full_name: card.full_name || card.profile_name || '',
                            company: card.company || '',
                            job_title: card.job_title || '',
                            bio: card.bio || '',
                            phone: card.phone || '',
                            email: card.email || '',
                            location: card.location || '',
                            color_theme: card.color_theme || 'black',
                            logo_url: card.logo_url || ''
                          });
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Nom :</span>
                          <span className="font-semibold">{cardData.full_name || 'Non renseigné'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Couleur :</span>
                          <div className={`w-4 h-4 rounded border ${cardData.color_theme === 'black' ? 'bg-black' : 'bg-white border-gray-300'}`} />
                          <span className="font-medium">{cardData.color_theme === 'black' ? 'Noir' : 'Blanc'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Entreprise :</span>
                          <span className="font-medium">{cardData.company || 'Non renseignée'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Poste :</span>
                          <span className="font-medium">{cardData.job_title || 'Non renseigné'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Tel :</span>
                          <span className="font-medium">{cardData.phone || 'Non renseigné'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Email :</span>
                          <span className="font-medium text-xs break-all">{cardData.email || 'Non renseigné'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-20">Lieu :</span>
                          <span className="font-medium">{cardData.location || 'Non renseigné'}</span>
                        </div>
                      </div>
                      
                      {/* Section Link to Bio - Simplified */}
                      <div className="border-t pt-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Page Link to Bio</span>
                          <p className="font-semibold text-gray-900">{currentPageName || 'Non définie'}</p>
                          <p className="text-xs text-blue-500 break-all">{displayLink}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-green-600" />
                        <span>Partage par contact NFC</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <QrCode size={14} className="text-blue-600" />
                        <span>QR Code de secours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink size={14} className="text-purple-600" />
                        <span>Page publique personnalisée</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
