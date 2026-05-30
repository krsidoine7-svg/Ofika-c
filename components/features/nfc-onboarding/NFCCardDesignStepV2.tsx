'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CardDesign, NFCCardDesignStepProps } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Upload, RotateCcw, QrCode, Building, User, Briefcase } from "lucide-react"
import QRCode from 'react-qr-code'
import { cn } from '@/lib/utils'

export function NFCCardDesignStepV2({
  formData,
  selectedDesign,
  selectedColor,
  onDesignChange,
  onColorChange,
  onNext,
  onPrev,
  isLoading
}: NFCCardDesignStepProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState<'black' | 'white'>('black')
  const [cardDesign, setCardDesign] = useState<'design1' | 'design2'>('design1')

  const designOptions: Record<'design1' | 'design2', CardDesign> = useMemo(() => ({
    design1: {
      id: 'design1',
      name: 'Design 1',
      description: 'Logo et QR côte à côte pour un rendu dynamique.',
      preview: '/designs/design1-preview.jpg',
      layout: {
        logoPosition: 'top-left',
        textAlignment: 'center',
        qrPosition: 'bottom-right',
        cardStyle: 'clean'
      }
    },
    design2: {
      id: 'design2',
      name: 'Design 2',
      description: 'Recto épuré + verso orienté QR code.',
      preview: '/designs/design2-preview.jpg',
      layout: {
        logoPosition: 'top-center',
        textAlignment: 'center',
        qrPosition: 'bottom-center',
        cardStyle: 'minimal'
      }
    }
  }), [])

  const defaultDesign = designOptions.design1

  // Couleur par défaut
  const defaultColor = {
    id: 'black',
    name: 'Noir',
    primary: '#000000',
    secondary: '#333333',
    textColor: 'white' as const,
    gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)'
  }

  // Synchronisation optimisée avec les props uniquement
  useEffect(() => {
    // Gestion du design
    if (!selectedDesign) {
      setCardDesign('design1')
      onDesignChange(designOptions.design1)
    } else {
      // Synchronisation directe avec les props
      const normalizedId = selectedDesign.id === 'design2' ? 'design2' : 'design1'
      setCardDesign(normalizedId)
    }
  }, [selectedDesign?.id, onDesignChange]) // ✅ Dépendances minimales

  // Gestion séparée de la couleur
  useEffect(() => {
    if (!selectedColor) {
      onColorChange(defaultColor)
    } else {
      setBackgroundColor(selectedColor.id as 'black' | 'white')
    }
  }, [selectedColor?.id, onColorChange, defaultColor]) // ✅ Dépendances minimales

  // Gestionnaire de sélection de design (simplifié pour éviter les boucles)
  const handleDesignSelection = (designKey: 'design1' | 'design2') => {
    setCardDesign(designKey)
    onDesignChange(designOptions[designKey])
  }

  // ✅ Supprimé - fusionné avec l'effet couleur ci-dessus

  // Logo SVG par défaut Ofika
  const DefaultLogo = ({ color = '#000000', size = 'w-full h-full' }: { color?: string, size?: string }) => (
    <svg className={size} viewBox="0 0 73.69 74.29" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="m36.73,45.03c3.95-.09,7.08,3.1,7.57,7.71.78,7.24,1.31,7.87,8.39,9.33,3.39.7,6.07,2.32,5.99,6.13-.07,3.27-1.78,5.89-5.35,6.08-3.85.2-5.97-1.92-6.78-5.8-1.43-6.79-3.04-7.97-9.76-7.98-6.58-.01-8.14,1.22-9.7,7.97-.86,3.73-2.93,6.05-6.84,5.79-3.27-.22-5.03-2.42-5.16-5.65-.17-4.11,2.32-6.25,6.03-6.5,5.61-.38,7.59-3.56,8.09-8.76.54-5.52,3.25-8.22,7.53-8.31Z"/>
      <path fill={color} d="m67.5,14.91c3.39.45,5.8,2.07,6.1,5.55.32,3.74-2.05,5.86-5.33,6.81-7.58,2.17-10.37,7.59-7.67,15.24.92,2.61,2.77,4.12,5.5,4.28,2.05.12,3.87.63,5.41,2.06,1.86,1.73,2.69,3.81,1.85,6.28-.81,2.4-2.61,3.86-5.09,4.16-2.53.31-4.52-.83-5.74-3.06-.54-.99-.81-2.16-1.04-3.29-1.38-6.62-2.44-7.61-9.04-8.29-4.82-.5-7.67-3.24-7.7-7.42-.03-4.39,2.96-7.44,7.97-7.57,5.12-.13,8.04-2.42,8.6-7.61.42-3.87,2.12-6.59,6.19-7.14Z"/>
      <path fill={color} d="m0,52.87c.43-3.64,2.86-5.39,6.49-6.01,5.53-.94,7.32-3.42,7.27-9.79-.05-6.39-1.74-8.57-7.47-9.62C2.69,26.8.04,25.06.09,21.01c.04-3.46,2.03-5.72,5.45-5.91,3.94-.22,6.21,2.24,6.56,5.99.58,6.19,3.82,8.53,9.78,8.64,4.26.08,7.2,3.67,6.93,7.56-.3,4.42-2.67,6.92-7.15,7.39-7.45.79-7.86,1.17-9.56,8.74-.83,3.71-2.81,6.15-6.74,5.82-3.42-.29-5.13-2.64-5.37-6.38Z"/>
      <path fill={color} d="m37.51,29.19c-4.62.15-7.89-2.66-8.33-7.89-.48-5.78-2.85-8.76-8.77-9.21-3.51-.27-5.64-2.72-5.32-6.55C15.36,2.31,17.18.21,20.44.06c3.65-.16,5.7,1.99,6.58,5.51,1.94,7.73,7.99,10.62,15.28,7.5,3.51-1.5,3.77-4.64,4.44-7.76C47.43,2.04,49.52.03,52.97,0c3.12-.03,4.81,1.94,5.53,4.77.84,3.28-.61,6.32-3.56,6.66-7.84.89-11.03,4.9-11.31,12.69-.11,3.03-3.2,4.86-6.12,5.08Z"/>
    </svg>
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Génération d'un QR code temporaire
  const tempQrValue = `https://ofika.com/nfc/temp-${Date.now()}`

  const handleBackgroundToggle = () => {
    const newColor = backgroundColor === 'black' ? 'white' : 'black'
    setBackgroundColor(newColor)
    
    // Créer l'objet ColorOption correspondant
    const colorOption = newColor === 'black' 
      ? { 
          id: 'black', 
          name: 'Noir', 
          primary: '#000000', 
          secondary: '#333333',
          textColor: 'white' as const,
          gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)'
        }
      : { 
          id: 'white', 
          name: 'Blanc', 
          primary: '#FFFFFF', 
          secondary: '#F5F5F5',
          textColor: 'black' as const,
          gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)'
        }
    
    // Appeler la fonction de changement de couleur
    onColorChange(colorOption)
  }

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Ici vous pourriez mettre à jour le formData si nécessaire
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const textColor = backgroundColor === 'black' ? 'text-white' : 'text-black'

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personnalisez votre carte NFC
        </h2>
        <p className="text-gray-600">
          Ajustez les couleurs et prévisualisez votre carte en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Business Card View - Left Side */}
        <div className="order-1">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {/* Design Selection - EN HAUT */}
            <div className="w-full">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-center">Choisissez votre style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant={cardDesign === 'design1' ? 'default' : 'outline'}
                      onClick={() => handleDesignSelection('design1')}
                      className="px-3 py-3 text-xs sm:text-sm font-semibold"
                    >
                      ↔️ Design 1
                    </Button>
                    <Button
                      variant={cardDesign === 'design2' ? 'default' : 'outline'}
                      onClick={() => handleDesignSelection('design2')}
                      className="px-3 py-3 text-xs sm:text-sm font-semibold"
                    >
                      🎴 Design 2
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {cardDesign === 'design1' && 'Logo et QR côte à côte'}
                    {cardDesign === 'design2' && 'Recto: Logo | Verso: QR + Infos'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
                Aperçu de votre carte
              </h3>
              {/* Card Container */}
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                {!isFlipped ? (
                  cardDesign === 'design1' ? (
                    /* Design 1 - Logo et QR code côte à côte */
                    <div 
                      className={`relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col justify-center ${
                        backgroundColor === 'black' ? 'bg-black' : 'bg-white'
                      } border-2 border-gray-200 transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8">
                        {/* Logo à gauche */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                            {formData.logoUrl ? (
                              <img 
                                src={formData.logoUrl} 
                                alt="Company Logo" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <DefaultLogo color={backgroundColor === 'black' ? '#FFFFFF' : '#000000'} />
                            )}
                          </div>
                          <h3 className={`text-xs sm:text-sm lg:text-base font-bold ${textColor} font-inter text-center`}>
                            {formData.company || 'Votre Entreprise'}
                          </h3>
                        </div>

                        {/* Ligne de séparation verticale */}
                        <div className={`h-24 sm:h-28 lg:h-32 w-px ${backgroundColor === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>

                        {/* QR Code à droite */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white p-1 sm:p-2 rounded">
                            <QRCode
                              value={tempQrValue}
                              size={112}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <QrCode className={`w-3 h-3 sm:w-4 sm:h-4 ${textColor}`} />
                            <span className={`text-xs ${textColor} font-inter`}>Scannez-moi</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Point décoratif en bas à droite */}
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${textColor} bg-current`}></div>
                      </div>
                    </div>
                  ) : (
                    /* Design 2 - Recto: Logo + Entreprise simple */
                    <div 
                      className={`relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center ${
                        backgroundColor === 'black' ? 'bg-black' : 'bg-white'
                      } border-2 border-gray-200 transition-all duration-300`}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        {/* Logo */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center">
                          {formData.logoUrl ? (
                            <img 
                              src={formData.logoUrl} 
                              alt="Company Logo" 
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <DefaultLogo color={backgroundColor === 'black' ? '#FFFFFF' : '#000000'} />
                          )}
                        </div>
                        
                        {/* Nom de l'entreprise */}
                        <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold ${textColor} font-inter text-center`}>
                          {formData.company || 'Votre Entreprise'}
                        </h3>
                      </div>
                      
                      {/* Point décoratif en bas à droite */}
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${textColor} bg-current`}></div>
                      </div>
                    </div>
                  )
                ) : (
                  /* VERSO - Différent pour Design 2 */
                  cardDesign === 'design2' ? (
                    /* Design 2 Verso - QR Code + Nom + Poste côte à côte */
                    <div 
                      className={`relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col justify-center ${
                        backgroundColor === 'black' ? 'bg-black' : 'bg-white'
                      } border-2 border-gray-200 transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8">
                        {/* QR Code à gauche */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white p-1 sm:p-2 rounded">
                            <QRCode
                              value={tempQrValue}
                              size={112}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <QrCode className={`w-3 h-3 sm:w-4 sm:h-4 ${textColor}`} />
                            <span className={`text-xs ${textColor} font-inter`}>Scannez-moi</span>
                          </div>
                        </div>

                        {/* Ligne de séparation verticale */}
                        <div className={`h-24 sm:h-28 lg:h-32 w-px ${backgroundColor === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>

                        {/* Informations à droite */}
                        <div className="flex flex-col justify-center space-y-2 text-left">
                          <h2 className={`text-base sm:text-lg lg:text-xl font-bold ${textColor} font-inter`}>
                            {formData.fullName || 'Votre Nom'}
                          </h2>
                          <p className={`text-sm sm:text-base lg:text-lg ${textColor} font-inter`}>
                            {formData.jobTitle || 'Votre Poste'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Point décoratif en bas à droite */}
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${textColor} bg-current`}></div>
                      </div>
                    </div>
                  ) : (
                    /* Verso standard pour Design 1 et 2 */
                  <div 
                    className={`relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center ${
                      backgroundColor === 'black' ? 'bg-black' : 'bg-white'
                    } border-2 border-gray-200 transition-all duration-300`}
                  >
                    <div className="text-center">
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} font-inter mb-2 sm:mb-3`}>
                        {formData.fullName || 'Votre Nom'}
                      </h2>
                      <p className={`text-base sm:text-lg lg:text-xl ${textColor} font-inter`}>
                        {formData.jobTitle || 'Votre Poste'}
                      </p>
                    </div>
                  </div>
                  )
                )}
              </div>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center w-full">
              <Button
                variant="outline"
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {isFlipped ? 'Voir le recto' : 'Voir le verso'}
              </Button>
            </div>

            {/* Background Color Toggle */}
            <div className="space-y-2 w-full">
              <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">Couleur de fond</div>
              <div className="flex gap-2 sm:gap-4 justify-center">
                <Button
                  variant={backgroundColor === 'black' ? 'default' : 'outline'}
                  onClick={handleBackgroundToggle}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base"
                >
                  Noir
                </Button>
                <Button
                  variant={backgroundColor === 'white' ? 'default' : 'outline'}
                  onClick={handleBackgroundToggle}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm sm:text-base"
                >
                  Blanc
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de la carte - Right Side */}
        <div className="order-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Informations de votre carte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Nom complet */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Nom complet</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  {formData.fullName || 'Non renseigné'}
                </div>
              </div>

              {/* Poste */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Poste</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  {formData.jobTitle || 'Non renseigné'}
                </div>
              </div>

              {/* Entreprise */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Entreprise</span>
                </div>
                <div className="text-sm sm:text-base font-medium text-gray-900">
                  {formData.company || 'Non renseigné'}
                </div>
              </div>


              {/* Logo */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Logo</span>
                </div>
                <div className="text-sm sm:text-base text-gray-900">
                  {formData.logoUrl ? 'Logo personnalisé' : 'Logo par défaut Ofika'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 py-4 border-t border-gray-200">
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600">
            Créé par{' '}
            <a 
              href="/onboarding/nfc-card" 
              className="font-semibold text-black hover:underline transition-all"
            >
              Ofika
            </a>
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Ofika. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}
