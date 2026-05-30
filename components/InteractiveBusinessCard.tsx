'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Label } from "@/components/core/ui/label"
import { Card, CardContent } from "@/components/core/ui/card"
import { Upload, RotateCcw, QrCode, Building, User, Briefcase, ArrowRight } from "lucide-react"
import QRCode from 'react-qr-code'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CARD_DESIGNS, COLOR_OPTIONS } from '@/lib/types/nfc-card-onboarding'

interface BusinessCardData {
  fullName: string
  jobTitle: string
  companyName: string
  logo: string | null
  backgroundColor: 'black' | 'white'
}

export default function InteractiveBusinessCard() {
  const router = useRouter()
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardDesign, setCardDesign] = useState<'design1' | 'design2'>('design1')
  const [cardData, setCardData] = useState<BusinessCardData>({
    fullName: '',
    jobTitle: '',
    companyName: '',
    logo: null,
    backgroundColor: 'black'
  })

  // Logo SVG par défaut
  const DefaultLogo = ({ color = '#000000', size = 'w-full h-full' }: { color?: string, size?: string }) => (
    <svg className={size} viewBox="0 0 73.69 74.29" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="m36.73,45.03c3.95-.09,7.08,3.1,7.57,7.71.78,7.24,1.31,7.87,8.39,9.33,3.39.7,6.07,2.32,5.99,6.13-.07,3.27-1.78,5.89-5.35,6.08-3.85.2-5.97-1.92-6.78-5.8-1.43-6.79-3.04-7.97-9.76-7.98-6.58-.01-8.14,1.22-9.7,7.97-.86,3.73-2.93,6.05-6.84,5.79-3.27-.22-5.03-2.42-5.16-5.65-.17-4.11,2.32-6.25,6.03-6.5,5.61-.38,7.59-3.56,8.09-8.76.54-5.52,3.25-8.22,7.53-8.31Z" />
      <path fill={color} d="m67.5,14.91c3.39.45,5.8,2.07,6.1,5.55.32,3.74-2.05,5.86-5.33,6.81-7.58,2.17-10.37,7.59-7.67,15.24.92,2.61,2.77,4.12,5.5,4.28,2.05.12,3.87.63,5.41,2.06,1.86,1.73,2.69,3.81,1.85,6.28-.81,2.4-2.61,3.86-5.09,4.16-2.53.31-4.52-.83-5.74-3.06-.54-.99-.81-2.16-1.04-3.29-1.38-6.62-2.44-7.61-9.04-8.29-4.82-.5-7.67-3.24-7.7-7.42-.03-4.39,2.96-7.44,7.97-7.57,5.12-.13,8.04-2.42,8.6-7.61.42-3.87,2.12-6.59,6.19-7.14Z" />
      <path fill={color} d="m0,52.87c.43-3.64,2.86-5.39,6.49-6.01,5.53-.94,7.32-3.42,7.27-9.79-.05-6.39-1.74-8.57-7.47-9.62C2.69,26.8.04,25.06.09,21.01c.04-3.46,2.03-5.72,5.45-5.91,3.94-.22,6.21,2.24,6.56,5.99.58,6.19,3.82,8.53,9.78,8.64,4.26.08,7.2,3.67,6.93,7.56-.3,4.42-2.67,6.92-7.15,7.39-7.45.79-7.86,1.17-9.56,8.74-.83,3.71-2.81,6.15-6.74,5.82-3.42-.29-5.13-2.64-5.37-6.38Z" />
      <path fill={color} d="m37.51,29.19c-4.62.15-7.89-2.66-8.33-7.89-.48-5.78-2.85-8.76-8.77-9.21-3.51-.27-5.64-2.72-5.32-6.55C15.36,2.31,17.18.21,20.44.06c3.65-.16,5.7,1.99,6.58,5.51,1.94,7.73,7.99,10.62,15.28,7.5,3.51-1.5,3.77-4.64,4.44-7.76C47.43,2.04,49.52.03,52.97,0c3.12-.03,4.81,1.94,5.53,4.77.84,3.28-.61,6.32-3.56,6.66-7.84.89-11.03,4.9-11.31,12.69-.11,3.03-3.2,4.86-6.12,5.08Z" />
    </svg>
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBackgroundToggle = () => {
    setCardData(prev => ({
      ...prev,
      backgroundColor: prev.backgroundColor === 'black' ? 'white' : 'black'
    }))
  }

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCardData(prev => ({
          ...prev,
          logo: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const convertLogoToMonochrome = (logoData: string, backgroundColor: 'black' | 'white') => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Convert to monochrome with transparent background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const alpha = data[i + 3]

            // Calculate luminance
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b

            // Detect if pixel is close to white (background)
            const isBackground = luminance > 240 && alpha > 200

            if (isBackground) {
              // Make background transparent
              data[i + 3] = 0
            } else {
              // Convert foreground to black or white based on card background
              const threshold = 128
              const isBright = luminance > threshold

              if (backgroundColor === 'black') {
                // White logo on black card
                data[i] = 255
                data[i + 1] = 255
                data[i + 2] = 255
              } else {
                // Black logo on white card
                data[i] = 0
                data[i + 1] = 0
                data[i + 2] = 0
              }
              // Keep original alpha for smooth edges
              data[i + 3] = alpha
            }
          }

          ctx.putImageData(imageData, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
      }

      img.src = logoData
    })
  }

  const [processedLogo, setProcessedLogo] = useState<string | null>(null)
  const [logoAspectRatio, setLogoAspectRatio] = useState<'square' | 'horizontal' | 'vertical'>('square')

  // Process logo when it changes or background changes
  useEffect(() => {
    if (cardData.logo) {
      // Detect logo dimensions
      const img = new Image()
      img.onload = () => {
        const ratio = img.width / img.height
        if (ratio > 1.2) {
          setLogoAspectRatio('horizontal') // Rectangle horizontal
        } else if (ratio < 0.8) {
          setLogoAspectRatio('vertical') // Rectangle vertical
        } else {
          setLogoAspectRatio('square') // Carré
        }
      }
      img.src = cardData.logo

      convertLogoToMonochrome(cardData.logo, cardData.backgroundColor)
        .then(setProcessedLogo)
    } else {
      setProcessedLogo(null)
      setLogoAspectRatio('square')
    }
  }, [cardData.logo, cardData.backgroundColor])

  const textColor = cardData.backgroundColor === 'black' ? 'text-white' : 'text-black'

  const handleStartOnboarding = () => {
    // Transformer l'état local en structure attendue par l'onboarding
    const onboardingData = {
      formData: {
        fullName: cardData.fullName || '',
        company: cardData.companyName || '',
        jobTitle: cardData.jobTitle || '',
        logoUrl: cardData.logo || undefined,
        // Autres champs par défaut
        bio: '',
        phone: '',
        email: '',
        consentEssential: true,
        consentDataProcessing: true
      },
      selectedDesign: CARD_DESIGNS.find(d => d.id === (cardDesign === 'design1' ? 'classic' : 'modern')) || CARD_DESIGNS[0],
      selectedColor: COLOR_OPTIONS.find(c => c.id === cardData.backgroundColor) || COLOR_OPTIONS[0],
      isFromPreview: true
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('nfc_card_preview_data', JSON.stringify(onboardingData))

    // Rediriger vers l'étape FORM (étape 2) car l'intro a déjà été faite via la démo
    router.push('/onboarding/nfc-card?from_preview=true')
  }

  return (
    <div className="w-full max-w-full mx-auto px-0 sm:px-4 py-4 sm:py-6 pb-20 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
        {/* Business Card View - Left Side (Widened) */}
        <div className="lg:col-span-6">
          <div className="flex flex-col items-center space-y-4 sm:space-y-5 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] mx-auto">

            {/* Design Selection */}
            <Card className="w-full border border-gray-200/80 shadow-sm">
              <CardContent className="p-3">
                <div className="text-center mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-700">Choisissez votre style</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={cardDesign === 'design1' ? 'default' : 'outline'}
                    onClick={() => setCardDesign('design1')}
                    className="px-2 py-1.5 h-auto text-[10px] sm:text-xs font-bold"
                  >
                    ↔️ Design 1
                  </Button>
                  <Button
                    variant={cardDesign === 'design2' ? 'default' : 'outline'}
                    onClick={() => setCardDesign('design2')}
                    className="px-2 py-1.5 h-auto text-[10px] sm:text-xs font-bold"
                  >
                    🎴 Design 2
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                  {cardDesign === 'design1' && 'Logo et QR côte à côte'}
                  {cardDesign === 'design2' && 'Recto: Logo | Verso: QR + Infos'}
                </p>
              </CardContent>
            </Card>

            {/* Card Preview */}
            <div className="w-full">
              <div className="relative w-full aspect-[1.586] rounded-2xl overflow-hidden shadow-xl">
                {!isFlipped ? (
                  /* Front Side - Varie selon le design */
                  <div
                    className={`relative w-full h-full p-4 sm:p-5 md:p-6 ${cardDesign === 'design2' ? 'flex flex-col justify-center items-center' : 'flex flex-col justify-between'} ${cardData.backgroundColor === 'black' ? 'bg-black' : 'bg-white'
                      } border border-gray-200/80 transition-all duration-300`}
                  >
                    {cardDesign === 'design1' ? (
                      /* Design 1 - Logo et QR côte à côte */
                      <div className="flex items-center justify-center space-x-3 sm:space-x-5 h-full w-full">
                        <div className="flex flex-col items-center space-y-2 flex-1">
                          <div className={`flex items-center justify-center overflow-hidden ${processedLogo
                            ? logoAspectRatio === 'horizontal'
                              ? 'w-16 h-10 sm:w-20 sm:h-12'
                              : logoAspectRatio === 'vertical'
                                ? 'w-10 h-14 sm:w-12 sm:h-18'
                                : 'w-12 h-12 sm:w-16 sm:h-16'
                            : 'w-12 h-12 sm:w-14 sm:h-14'
                            }`}>
                            {processedLogo ? (
                              <img src={processedLogo} alt="Company Logo" className="w-full h-full object-contain" />
                            ) : (
                              <DefaultLogo color={cardData.backgroundColor === 'black' ? '#FFFFFF' : '#000000'} />
                            )}
                          </div>
                          <h3 className={`text-xs sm:text-sm font-bold ${textColor} font-inter text-center truncate max-w-full`}>
                            {cardData.companyName || 'Ofika'}
                          </h3>
                        </div>
                        <div className={`h-16 sm:h-24 w-px ${cardData.backgroundColor === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <div className="flex flex-col items-center space-y-2 flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-md shadow-sm">
                            <QRCode value="https://ofika.africa" size={120} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                          </div>
                          <div className="flex items-center space-x-1">
                            <QrCode className={`w-3 h-3 ${textColor}`} />
                            <span className={`text-[10px] sm:text-xs font-medium ${textColor}`}>Scannez-moi</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Design 2 - Logo + Entreprise uniquement */
                      <div className="flex flex-col items-center justify-center space-y-4 h-full w-full">
                        <div className={`flex items-center justify-center overflow-hidden ${processedLogo
                          ? logoAspectRatio === 'horizontal'
                            ? 'w-24 h-16 sm:w-32 sm:h-20'
                            : logoAspectRatio === 'vertical'
                              ? 'w-16 h-24 sm:w-20 sm:h-32'
                              : 'w-16 h-16 sm:w-20 sm:h-20'
                          : 'w-16 h-16 sm:w-20 sm:h-20'
                          }`}>
                          {processedLogo ? (
                            <img src={processedLogo} alt="Company Logo" className="w-full h-full object-contain" />
                          ) : (
                            <DefaultLogo color={cardData.backgroundColor === 'black' ? '#FFFFFF' : '#000000'} />
                          )}
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold ${textColor} font-inter text-center truncate max-w-full`}>
                          {cardData.companyName || 'Ofika'}
                        </h3>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Back Side - Varie selon le design */
                  <div
                    className={`relative w-full h-full p-4 sm:p-5 md:p-6 ${cardDesign === 'design2' ? 'flex flex-col justify-center' : 'flex flex-col justify-center items-center text-center'
                      } ${cardData.backgroundColor === 'black' ? 'bg-black' : 'bg-white'} border border-gray-200/80 transition-all duration-300`}
                  >
                    {cardDesign === 'design2' ? (
                      /* Design 2 Verso - QR Code + Nom + Poste côte à côte */
                      <div className="flex items-center justify-center space-x-3 sm:space-x-5 h-full w-full">
                        <div className="flex flex-col items-center space-y-2 flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-md shadow-sm">
                            <QRCode value="https://ofika.africa" size={120} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                          </div>
                          <div className="flex items-center space-x-1">
                            <QrCode className={`w-3 h-3 ${textColor}`} />
                            <span className={`text-[10px] sm:text-xs font-medium ${textColor}`}>Scannez-moi</span>
                          </div>
                        </div>
                        <div className={`h-16 sm:h-24 w-px ${cardData.backgroundColor === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <div className="flex flex-col justify-center space-y-1 sm:space-y-2 text-left flex-1 min-w-0">
                          <h2 className={`text-sm sm:text-base font-bold ${textColor} font-inter leading-tight truncate`}>
                            {cardData.fullName || 'Joseph Brou'}
                          </h2>
                          <p className={`text-[10px] sm:text-xs ${textColor} opacity-80 font-medium leading-tight line-clamp-3`}>
                            {cardData.jobTitle || 'Project Manager'} <br />
                            <span className="text-orange-500 font-semibold">at Ofika</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Design 1 Verso - Nom + Poste centré */
                      <div className="space-y-1 sm:space-y-2 w-full px-2">
                        <h2 className={`text-base sm:text-xl md:text-2xl font-bold ${textColor} font-inter tracking-tight truncate`}>
                          {cardData.fullName || 'Joseph Brou'}
                        </h2>
                        <p className={`text-xs sm:text-sm md:text-base ${textColor} font-medium opacity-80 truncate`}>
                          {cardData.jobTitle || 'Project Manager at Ofika'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3.5 w-full">
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 h-auto text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 shadow-md hover:shadow-red-500/10 rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {isFlipped ? 'Voir le recto' : 'Voir le verso'}
                </Button>
              </div>

              {/* Background Color Toggle */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-gray-600">Couleur de fond</Label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'black' }))}
                    className={`py-2 h-auto text-xs sm:text-sm font-bold flex-1 transition-all rounded-xl ${cardData.backgroundColor === 'black'
                      ? 'bg-black text-white ring-2 ring-ofika-orange ring-offset-1 hover:bg-black'
                      : 'bg-gray-800 text-white/70 hover:bg-black hover:text-white'
                      }`}
                  >
                    Noir
                  </Button>
                  <Button
                    onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'white' }))}
                    className={`py-2 h-auto text-xs sm:text-sm font-bold flex-1 transition-all border rounded-xl ${cardData.backgroundColor === 'white'
                      ? 'bg-white text-black border-black ring-2 ring-ofika-orange ring-offset-1 hover:bg-white'
                      : 'bg-white text-black/50 border-gray-200 hover:border-black hover:text-black'
                      }`}
                  >
                    Blanc
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Input Form - Right Side (Widened) */}
        <div className="lg:col-span-6">
          <Card className="w-full max-w-lg mx-auto lg:mx-0 border border-gray-200/80 shadow-sm">
            <CardContent className="p-5 sm:p-6 pb-8 space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 tracking-tight">Personnaliser votre carte</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  Entrez vos informations pour voir le rendu en temps réel sur l'aperçu à gauche.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-700">
                    <User className="w-4 h-4 text-orange-500" />
                    <span>Nom complet</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={cardData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Joseph Brou"
                    className="w-full text-xs sm:text-sm py-4 h-auto px-4 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-700">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                    <span>Poste</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    value={cardData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Project Manager at Ofika"
                    className="w-full text-xs sm:text-sm py-4 h-auto px-4 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-700">
                    <Building className="w-4 h-4 text-orange-500" />
                    <span>Nom de l'entreprise</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={cardData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ofika"
                    className="w-full text-xs sm:text-sm py-4 h-auto px-4 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all placeholder:text-gray-300"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-700">
                    <Upload className="w-4 h-4 text-orange-500" />
                    <span>Logo de l'entreprise</span>
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-[11px] sm:text-xs py-4 h-auto rounded-xl border hover:bg-orange-50 hover:border-orange-200 transition-all font-bold"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Télécharger
                    </Button>
                    {cardData.logo && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCardData(prev => ({ ...prev, logo: null }))
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] sm:text-xs py-4 h-auto rounded-xl border-red-200 font-bold font-inter"
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-[9px] text-gray-400 font-medium leading-relaxed italic">
                    Formats : SVG, PNG, JPG.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100">
                <Button
                  size="lg"
                  onClick={handleStartOnboarding}
                  className="w-full bg-ofika-orange hover:bg-orange-600 text-sm sm:text-base py-4 h-auto rounded-[1rem] shadow-lg shadow-orange-500/20 transition-all font-bold uppercase tracking-wider group"
                >
                  Démarrer la création
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div >
    </div >
  )
}
