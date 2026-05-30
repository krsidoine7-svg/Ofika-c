'use client'

// =====================================================
// PAGE CRÉATION QR CODE V2 - AVEC PERSONNALISATION
// Intègre CustomizationPanel + CampaignManager + Preview temps réel
// =====================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { Textarea } from '@/components/core/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs'
import { 
  ArrowLeft, QrCode, Loader2, ExternalLink, Phone, MessageCircle, 
  Mail, MapPin, User, Globe, Download, Eye, Sparkles 
} from 'lucide-react'
import { toast } from 'sonner'
import { createQRRedirect, getRedirectURL } from '@/lib/services/qr-redirect-client'
import { sanitizeVCardField, validateEmail, validatePhoneNumber } from '@/lib/utils/qr-validation'
import { QRCodeGenerator, createQRWithPreset } from '@/lib/services/qr-generator'
import type { QRCustomizationOptions } from '@/lib/services/qr-generator'
import CustomizationPanel from '@/components/qr/CustomizationPanel'
import CampaignManager from '@/components/qr/CampaignManager'

type QRCodeType = 'website' | 'phone' | 'whatsapp' | 'email' | 'location' | 'vcard'

export default function NewQRCodePageV2() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrType, setQrType] = useState<QRCodeType>('website')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>()
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nfc_link: '',
    phone: '',
    countryCode: '+221',
    whatsappNumber: '',
    whatsappMessage: '',
    email: '',
    emailSubject: '',
    emailBody: '',
    address: '',
    latitude: '',
    longitude: '',
    vcardName: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardCompany: '',
    vcardWebsite: ''
  })

  // Customization
  const [customization, setCustomization] = useState<Partial<QRCustomizationOptions>>({
    width: 500,
    height: 500,
    dotsColor: '#f97316',
    dotsType: 'rounded',
    cornersSquareType: 'extra-rounded',
    cornersSquareColor: '#f97316',
    backgroundColor: '#FFFFFF',
    errorCorrectionLevel: 'M'
  })

  // Preview
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(true)
  const [createdQR, setCreatedQR] = useState<any>(null)

  // Générer target URL
  const generateTargetUrl = (): string => {
    switch (qrType) {
      case 'phone':
        return `tel:${formData.countryCode}${formData.phone.replace(/\s/g, '')}`
      
      case 'whatsapp':
        const whatsappNum = formData.whatsappNumber.replace(/\s/g, '')
        const message = formData.whatsappMessage ? `?text=${encodeURIComponent(formData.whatsappMessage)}` : ''
        return `https://wa.me/${whatsappNum}${message}`
      
      case 'email':
        let emailUrl = `mailto:${formData.email}`
        const params = []
        if (formData.emailSubject) params.push(`subject=${encodeURIComponent(formData.emailSubject)}`)
        if (formData.emailBody) params.push(`body=${encodeURIComponent(formData.emailBody)}`)
        if (params.length > 0) emailUrl += `?${params.join('&')}`
        return emailUrl
      
      case 'location':
        if (formData.latitude && formData.longitude) {
          return `https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}`
      
      case 'vcard':
        const vcard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${sanitizeVCardField(formData.vcardName)}`,
          formData.vcardPhone ? `TEL:${sanitizeVCardField(formData.vcardPhone)}` : '',
          formData.vcardEmail ? `EMAIL:${sanitizeVCardField(formData.vcardEmail)}` : '',
          formData.vcardCompany ? `ORG:${sanitizeVCardField(formData.vcardCompany)}` : '',
          formData.vcardWebsite ? `URL:${sanitizeVCardField(formData.vcardWebsite)}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n')
        const encoder = new TextEncoder()
        const data = encoder.encode(vcard)
        const base64 = btoa(String.fromCharCode(...data))
        return `data:text/vcard;base64,${base64}`
      
      case 'website':
      default:
        return formData.nfc_link
    }
  }

  // Mettre à jour la preview
  useEffect(() => {
    const updatePreview = async () => {
      const targetUrl = generateTargetUrl()
      if (!targetUrl || targetUrl === 'data:text/vcard;base64,') return

      try {
        // Utiliser le générateur local
        const generator = new QRCodeGenerator({
          data: targetUrl,
          ...customization
        })

        const dataUrl = await generator.toDataURL('png')
        setPreviewUrl(dataUrl)
      } catch (error) {
        console.error('Preview error:', error)
      }
    }

    if (showPreview) {
      updatePreview()
    }
  }, [qrType, formData, customization, showPreview])

  // Validation
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return false
    }

    const targetUrl = generateTargetUrl()
    if (!targetUrl) {
      toast.error('Veuillez remplir les champs requis')
      return false
    }

    // Validations spécifiques
    if (qrType === 'email' && !validateEmail(formData.email)) {
      toast.error('Email invalide')
      return false
    }

    if (qrType === 'phone') {
      const phoneValidation = validatePhoneNumber(formData.phone, formData.countryCode)
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.error || 'Numéro de téléphone invalide')
        return false
      }
    }

    return true
  }

  // Créer le QR Code
  const handleCreate = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const targetUrl = generateTargetUrl()
      
      const result = await createQRRedirect({
        nfc_link: targetUrl,
        redirect_type: 'custom',
        title: formData.title,
        description: formData.description || undefined,
        campaign_id: selectedCampaignId
      })

      if (result.success && result.data) {
        const shortCode = result.data.short_code
        
        // Générer le QR personnalisé
        const generator = new QRCodeGenerator({
          data: getRedirectURL(shortCode),
          ...customization
        })

        const qrDataUrl = await generator.toDataURL('png')

        setCreatedQR({
          shortCode,
          qrCodeUrl: qrDataUrl,
          redirectUrl: getRedirectURL(shortCode),
          nfcLink: targetUrl,
          data: result.data
        })

        toast.success('QR Code créé avec succès !')
      } else {
        toast.error(result.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de la création du QR code')
    } finally {
      setLoading(false)
    }
  }

  // Télécharger le QR
  const handleDownload = async (format: 'png' | 'svg' = 'png') => {
    if (!createdQR) return

    try {
      const generator = new QRCodeGenerator({
        data: createdQR.redirectUrl,
        ...customization
      })

      await generator.download(
        `qr-${formData.title.replace(/\s+/g, '-').toLowerCase()}`,
        format
      )

      toast.success(`QR Code téléchargé en ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  // Si QR créé, afficher la confirmation
  if (createdQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <QrCode className="w-8 h-8 text-green-600" />
                QR Code créé avec succès !
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* QR Display */}
              <div className="flex flex-col items-center">
                <img
                  src={createdQR.qrCodeUrl}
                  alt="QR Code"
                  className="w-80 h-80 border-4 border-gray-200 rounded-xl shadow-lg"
                />
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Lien court:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block truncate">
                    {createdQR.redirectUrl}
                  </code>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Destination:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block truncate">
                    {createdQR.nfcLink}
                  </code>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleDownload('png')}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PNG
                </Button>
                <Button
                  onClick={() => handleDownload('svg')}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger SVG
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/dashboard/qr-codes')}
                  variant="outline"
                  className="flex-1"
                >
                  Voir mes QR Codes
                </Button>
                <Button
                  onClick={() => {
                    setCreatedQR(null)
                    setFormData({
                      ...formData,
                      title: '',
                      description: '',
                      nfc_link: ''
                    })
                  }}
                  className="flex-1"
                >
                  Créer un autre
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/qr-codes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <QrCode className="w-8 h-8 text-orange-600" />
              Nouveau QR Code Personnalisé
            </h1>
            <p className="text-gray-600 mt-1">Créez un QR code dynamique avec style</p>
          </div>
        </div>

        {/* Layout 3 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: Contenu */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenu du QR Code</CardTitle>
                <CardDescription>Choisissez le type et entrez les informations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Type de QR */}
                <div className="space-y-2">
                  <Label>Type de QR Code</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'website', label: 'Site Web', icon: Globe },
                      { value: 'phone', label: 'Téléphone', icon: Phone },
                      { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { value: 'email', label: 'Email', icon: Mail },
                      { value: 'location', label: 'Localisation', icon: MapPin },
                      { value: 'vcard', label: 'Contact', icon: User }
                    ].map(type => {
                      const Icon = type.icon
                      return (
                        <Button
                          key={type.value}
                          variant={qrType === type.value ? 'default' : 'outline'}
                          onClick={() => setQrType(type.value as QRCodeType)}
                          className="h-auto flex-col gap-2 py-4"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Infos générales */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: QR Code Promo Été"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optionnel: décrivez ce QR code..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Champs spécifiques par type */}
                {qrType === 'website' && (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL du site web *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.nfc_link}
                      onChange={(e) => setFormData({ ...formData, nfc_link: e.target.value })}
                      placeholder="https://exemple.com"
                    />
                  </div>
                )}

                {qrType === 'phone' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Indicatif</Label>
                      <Select
                        value={formData.countryCode}
                        onValueChange={(v) => setFormData({ ...formData, countryCode: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+221">+221 (SN)</SelectItem>
                          <SelectItem value="+33">+33 (FR)</SelectItem>
                          <SelectItem value="+1">+1 (US)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="phone">Numéro *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="77 123 45 67"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'whatsapp' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-num">Numéro WhatsApp *</Label>
                      <Input
                        id="whatsapp-num"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="221771234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-msg">Message pré-rempli</Label>
                      <Textarea
                        id="whatsapp-msg"
                        value={formData.whatsappMessage}
                        onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                        placeholder="Bonjour..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {qrType === 'email' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@exemple.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Sujet</Label>
                      <Input
                        id="email-subject"
                        value={formData.emailSubject}
                        onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                        placeholder="Demande d'information"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'location' && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Rue Example, Dakar"
                    />
                  </div>
                )}

                {qrType === 'vcard' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vcard-name">Nom complet *</Label>
                      <Input
                        id="vcard-name"
                        value={formData.vcardName}
                        onChange={(e) => setFormData({ ...formData, vcardName: e.target.value })}
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vcard-phone">Téléphone</Label>
                        <Input
                          id="vcard-phone"
                          value={formData.vcardPhone}
                          onChange={(e) => setFormData({ ...formData, vcardPhone: e.target.value })}
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vcard-email">Email</Label>
                        <Input
                          id="vcard-email"
                          type="email"
                          value={formData.vcardEmail}
                          onChange={(e) => setFormData({ ...formData, vcardEmail: e.target.value })}
                          placeholder="jean@exemple.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personnalisation */}
            <CustomizationPanel
              customization={customization}
              onChange={setCustomization}
            />
          </div>

          {/* Colonne 2: Preview + Campagne */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-[300px] border-2 border-gray-200 rounded-lg shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">Prévisualisation en temps réel</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <QrCode className="w-16 h-16 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Remplissez les champs</p>
                  </div>
                )}

                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full h-12 gap-2 text-lg bg-gradient-to-r from-orange-500 to-pink-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Créer le QR Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Campagnes */}
            <Card>
              <CardContent className="p-6">
                <CampaignManager
                  selectedCampaignId={selectedCampaignId}
                  onSelectCampaign={setSelectedCampaignId}
                  compact
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
