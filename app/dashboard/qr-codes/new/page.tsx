'use client'

// =====================================================
// PAGE DE CRÉATION D'UN NOUVEAU QR CODE DYNAMIQUE
// =====================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { Textarea } from '@/components/core/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { ArrowLeft, QrCode, Loader2, ExternalLink, Phone, MessageCircle, Mail, MapPin, User, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { createQRRedirect, getQRCodeURL, getRedirectURL } from '@/lib/services/qr-redirect-client'
import { sanitizeVCardField, validateEmail, validatePhoneNumber } from '@/lib/utils/qr-validation'
import Link from 'next/link'

type QRCodeType = 'website' | 'phone' | 'whatsapp' | 'email' | 'location' | 'vcard'

export default function NewQRCodePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrType, setQrType] = useState<QRCodeType>('website')
  const [formData, setFormData] = useState({
    nfc_link: '',
    redirect_type: 'custom' as 'nfc_card' | 'profile' | 'custom',
    title: '',
    description: '',
    // Champs spécifiques par type
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
    // vCard
    vcardName: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardCompany: '',
    vcardWebsite: ''
  })
  const [createdQR, setCreatedQR] = useState<{
    shortCode: string
    qrCodeUrl: string
    redirectUrl: string
    nfcLink: string
  } | null>(null)

  // Générer l'URL cible selon le type de QR code
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
        // Générer une vCard avec sanitization
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
        
        // Encoder en base64 pour l'URL (méthode correcte)
        const encoder = new TextEncoder()
        const data = encoder.encode(vcard)
        const base64 = btoa(String.fromCharCode(...data))
        return `data:text/vcard;base64,${base64}`
      
      case 'website':
      default:
        return formData.nfc_link
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation selon le type
    if (qrType === 'website' && !formData.nfc_link) {
      toast.error('L\'URL du site web est requise')
      return
    }
    
    if (qrType === 'phone') {
      if (!formData.phone) {
        toast.error('Le numéro de téléphone est requis')
        return
      }
      const phoneValidation = validatePhoneNumber(formData.phone, formData.countryCode)
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.error)
        return
      }
    }
    
    if (qrType === 'whatsapp' && !formData.whatsappNumber) {
      toast.error('Le numéro WhatsApp est requis')
      return
    }
    
    if (qrType === 'email') {
      if (!formData.email) {
        toast.error('L\'adresse email est requise')
        return
      }
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.valid) {
        toast.error(emailValidation.error)
        return
      }
    }
    
    if (qrType === 'location' && !formData.address && (!formData.latitude || !formData.longitude)) {
      toast.error('L\'adresse ou les coordonnées GPS sont requises')
      return
    }
    
    if (qrType === 'vcard' && !formData.vcardName) {
      toast.error('Le nom est requis pour la carte de visite')
      return
    }

    setLoading(true)

    try {
      // Générer l'URL cible selon le type
      const targetUrl = generateTargetUrl()
      
      const result = await createQRRedirect({
        nfc_link: targetUrl,
        redirect_type: formData.redirect_type,
        title: formData.title || undefined,
        description: formData.description || undefined
      })

      if (result.success && result.data) {
        const shortCode = result.data.short_code
        const qrCodeUrl = getQRCodeURL(shortCode, 500)
        const redirectUrl = getRedirectURL(shortCode)

        setCreatedQR({
          shortCode,
          qrCodeUrl,
          redirectUrl,
          nfcLink: targetUrl
        })

        toast.success('QR code créé avec succès !')
      } else {
        toast.error(result.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating QR code:', error)
      toast.error('Erreur lors de la création du QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!createdQR) return

    try {
      // Utiliser notre API proxy pour télécharger l'image
      const proxyUrl = `/api/qr-code/download?url=${encodeURIComponent(createdQR.qrCodeUrl)}`
      const response = await fetch(proxyUrl)
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      
      const blob = await response.blob()
      
      // Créer un URL local pour le blob
      const url = window.URL.createObjectURL(blob)
      
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-${formData.title || createdQR.shortCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Libérer la mémoire
      window.URL.revokeObjectURL(url)
      
      toast.success('QR code téléchargé')
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleCopyUrl = () => {
    if (!createdQR) return
    navigator.clipboard.writeText(createdQR.redirectUrl)
    toast.success('URL copiée dans le presse-papiers')
  }

  const handleCreateAnother = () => {
    setCreatedQR(null)
    setQrType('website')
    setFormData({
      nfc_link: '',
      redirect_type: 'custom',
      title: '',
      description: '',
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
  }

  if (createdQR) {
    // Affichage du QR code créé
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard/qr-codes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux QR codes
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">QR Code créé avec succès !</CardTitle>
            <CardDescription>
              Votre QR code dynamique est prêt à être utilisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Preview */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
                <img
                  src={createdQR.qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <ExternalLink className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-green-900 mb-1 block">
                      Destination actuelle (modifiable)
                    </Label>
                    <p className="text-xs text-green-700 mb-2">
                      C'est ici que vos visiteurs arrivent. Vous pouvez changer cette URL à tout moment sans réimprimer le QR code.
                    </p>
                  </div>
                </div>
                <code className="block bg-white px-3 py-2 rounded border text-sm break-all font-mono">
                  {createdQR.nfcLink}
                </code>
              </div>

              {formData.title && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Titre
                  </Label>
                  <p className="text-gray-900">{formData.title}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Télécharger le QR Code
                </Button>
                <Button
                  onClick={handleCreateAnother}
                  variant="outline"
                  className="flex-1"
                >
                  Créer un autre QR Code
                </Button>
              </div>

              <div className="pt-2">
                <Link href="/dashboard/qr-codes" className="block">
                  <Button variant="default" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voir tous mes QR codes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Schéma explicatif */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Comment ça fonctionne ?
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <p className="text-gray-700">
                    <strong>Visiteur scanne</strong> le QR code avec son téléphone
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <p className="text-gray-700">
                    <strong>Redirection automatique</strong> vers votre destination
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <p className="text-gray-700">
                    <strong>Vous pouvez changer</strong> la destination quand vous voulez, le QR code fonctionne toujours !
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-xs text-purple-800">
                  💡 <strong>Astuce :</strong> Rendez-vous dans "Voir tous mes QR codes" pour modifier la destination à tout moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulaire de création
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/qr-codes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Créer un QR Code Dynamique</CardTitle>
          <CardDescription>
            Créez un QR code dont vous pourrez modifier la destination sans avoir à le réimprimer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélecteur de type de QR Code */}
            <div className="space-y-3">
              <Label>Type de QR Code <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setQrType('website')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'website'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <Globe className={`w-6 h-6 mx-auto mb-2 ${qrType === 'website' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Site Web</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('phone')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'phone'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <Phone className={`w-6 h-6 mx-auto mb-2 ${qrType === 'phone' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Téléphone</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('whatsapp')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'whatsapp'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <MessageCircle className={`w-6 h-6 mx-auto mb-2 ${qrType === 'whatsapp' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">WhatsApp</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('email')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'email'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <Mail className={`w-6 h-6 mx-auto mb-2 ${qrType === 'email' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Email</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('location')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'location'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <MapPin className={`w-6 h-6 mx-auto mb-2 ${qrType === 'location' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Localisation</div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrType('vcard')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    qrType === 'vcard'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${qrType === 'vcard' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Carte visite</div>
                </button>
              </div>
            </div>

            {/* Champs dynamiques selon le type */}
            {qrType === 'website' && (
              <div className="space-y-2">
                <Label htmlFor="nfc_link">
                  URL du site web <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nfc_link"
                  type="url"
                  placeholder="https://exemple.com"
                  value={formData.nfc_link}
                  onChange={(e) => setFormData({ ...formData, nfc_link: e.target.value })}
                  disabled={loading}
                />
              </div>
            )}

            {qrType === 'phone' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Indicatif</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+221">🇸🇳 +221</SelectItem>
                        <SelectItem value="+225">🇨🇮 +225</SelectItem>
                        <SelectItem value="+226">🇧🇫 +226</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="phone">
                      Numéro de téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="77 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {qrType === 'whatsapp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">
                    Numéro WhatsApp (avec indicatif) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="221771234567"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Format: indicatif + numéro sans espaces (ex: 221771234567)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappMessage">Message pré-rempli (optionnel)</Label>
                  <Textarea
                    id="whatsappMessage"
                    placeholder="Bonjour, je vous contacte..."
                    value={formData.whatsappMessage}
                    onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Adresse email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Sujet (optionnel)</Label>
                  <Input
                    id="emailSubject"
                    type="text"
                    placeholder="Demande d'information"
                    value={formData.emailSubject}
                    onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailBody">Message (optionnel)</Label>
                  <Textarea
                    id="emailBody"
                    placeholder="Bonjour,..."
                    value={formData.emailBody}
                    onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {qrType === 'location' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Rue Example, Dakar, Sénégal"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Ou entrez les coordonnées GPS ci-dessous</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (optionnel)</Label>
                    <Input
                      id="latitude"
                      type="text"
                      placeholder="14.6928"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (optionnel)</Label>
                    <Input
                      id="longitude"
                      type="text"
                      placeholder="-17.4467"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vcardName">
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vcardName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.vcardName}
                    onChange={(e) => setFormData({ ...formData, vcardName: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vcardPhone">Téléphone</Label>
                  <Input
                    id="vcardPhone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={formData.vcardPhone}
                    onChange={(e) => setFormData({ ...formData, vcardPhone: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vcardEmail">Email</Label>
                  <Input
                    id="vcardEmail"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={formData.vcardEmail}
                    onChange={(e) => setFormData({ ...formData, vcardEmail: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vcardCompany">Entreprise</Label>
                  <Input
                    id="vcardCompany"
                    type="text"
                    placeholder="Mon Entreprise"
                    value={formData.vcardCompany}
                    onChange={(e) => setFormData({ ...formData, vcardCompany: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vcardWebsite">Site web</Label>
                  <Input
                    id="vcardWebsite"
                    type="url"
                    placeholder="https://exemple.com"
                    value={formData.vcardWebsite}
                    onChange={(e) => setFormData({ ...formData, vcardWebsite: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre (optionnel)</Label>
              <Input
                id="title"
                type="text"
                placeholder="Mon QR Code"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Un titre pour identifier facilement ce QR code
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Description de ce QR code..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Ajoutez des notes ou une description pour ce QR code
              </p>
            </div>

            {/* Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code Dynamique
              </h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✅ Modifiez la destination sans réimprimer</li>
                <li>✅ Suivez les statistiques de scan</li>
                <li>✅ Activez/désactivez quand vous voulez</li>
                <li>✅ Gratuit et illimité</li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Créer le QR Code
                  </>
                )}
              </Button>
              <Link href="/dashboard/qr-codes">
                <Button type="button" variant="outline" disabled={loading}>
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
