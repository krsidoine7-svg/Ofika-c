'use client'

import { useState } from 'react'
import { NFCCardDesignStepProps, CARD_DESIGNS, COLOR_OPTIONS } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { Palette, Layout, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NFCCardDesignStep({
  formData,
  selectedDesign,
  selectedColor,
  onDesignChange,
  onColorChange,
  onNext,
  onPrev,
  isLoading
}: NFCCardDesignStepProps) {
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null)

  const handleDesignSelect = (design: typeof CARD_DESIGNS[0]) => {
    onDesignChange(design)
  }

  const handleColorSelect = (color: typeof COLOR_OPTIONS[0]) => {
    onColorChange(color)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre design
        </h2>
        <p className="text-gray-600">
          Personnalisez l'apparence de votre carte NFC
        </p>
      </div>

      {/* Modèles de cartes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Modèle de carte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARD_DESIGNS.map((design) => (
              <div
                key={design.id}
                className={cn(
                  'relative cursor-pointer rounded-lg border-2 transition-all duration-200',
                  selectedDesign?.id === design.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300',
                  hoveredDesign === design.id && 'scale-105'
                )}
                onClick={() => handleDesignSelect(design)}
                onMouseEnter={() => setHoveredDesign(design.id)}
                onMouseLeave={() => setHoveredDesign(null)}
              >
                {/* Aperçu de la carte */}
                <div className="aspect-[85/55] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg m-4 relative overflow-hidden">
                  {/* Simulation de la carte */}
                  <div className="absolute inset-2 bg-white rounded shadow-sm p-2">
                    {/* Logo position */}
                    <div className={cn(
                      'w-6 h-6 bg-orange-500 rounded',
                      design.layout.logoPosition === 'top-left' && 'absolute top-1 left-1',
                      design.layout.logoPosition === 'top-center' && 'absolute top-1 left-1/2 transform -translate-x-1/2',
                      design.layout.logoPosition === 'top-right' && 'absolute top-1 right-1'
                    )} />
                    
                    {/* Texte central */}
                    <div className={cn(
                      'text-center mt-8',
                      design.layout.textAlignment === 'left' && 'text-left',
                      design.layout.textAlignment === 'center' && 'text-center',
                      design.layout.textAlignment === 'right' && 'text-right'
                    )}>
                      <div className="text-xs font-bold text-gray-800 truncate">
                        {formData.fullName || 'Nom Complet'}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {formData.company || 'Entreprise'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {formData.jobTitle || 'Poste'}
                      </div>
                    </div>
                    
                    {/* QR Code position */}
                    <div className={cn(
                      'w-4 h-4 bg-gray-800 rounded-sm',
                      design.layout.qrPosition === 'bottom-left' && 'absolute bottom-1 left-1',
                      design.layout.qrPosition === 'bottom-center' && 'absolute bottom-1 left-1/2 transform -translate-x-1/2',
                      design.layout.qrPosition === 'bottom-right' && 'absolute bottom-1 right-1'
                    )} />
                  </div>
                </div>

                {/* Informations du design */}
                <div className="p-4 pt-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    {design.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {design.description}
                  </p>
                  
                  {/* Badge de sélection */}
                  {selectedDesign?.id === design.id && (
                    <Badge className="bg-orange-500 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Sélectionné
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palette de couleurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Couleurs de votre carte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {COLOR_OPTIONS.map((color) => (
              <div
                key={color.id}
                className={cn(
                  'relative cursor-pointer rounded-lg border-2 transition-all duration-200',
                  selectedColor?.id === color.id
                    ? 'border-orange-500 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                )}
                onClick={() => handleColorSelect(color)}
              >
                {/* Aperçu de la couleur */}
                <div
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center text-xs font-medium',
                    `bg-gradient-to-br ${color.gradient}`,
                    color.textColor === 'white' ? 'text-white' : 'text-black'
                  )}
                >
                  {color.name}
                </div>
                
                {/* Badge de sélection */}
                {selectedColor?.id === color.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu en temps réel */}
      {(selectedDesign && selectedColor) && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu de votre carte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative">
                {/* Carte de prévisualisation */}
                <div
                  className={cn(
                    'w-64 h-40 rounded-lg shadow-lg flex flex-col p-4',
                    `bg-gradient-to-br ${selectedColor.gradient}`,
                    selectedColor.textColor === 'white' ? 'text-white' : 'text-black'
                  )}
                >
                  {/* Logo */}
                  <div className={cn(
                    'w-8 h-8 bg-white/20 rounded flex items-center justify-center',
                    selectedDesign.layout.logoPosition === 'top-left' && 'self-start',
                    selectedDesign.layout.logoPosition === 'top-center' && 'self-center',
                    selectedDesign.layout.logoPosition === 'top-right' && 'self-end'
                  )}>
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-white/50 rounded" />
                    )}
                  </div>

                  {/* Contenu central */}
                  <div className={cn(
                    'flex-1 flex flex-col justify-center',
                    selectedDesign.layout.textAlignment === 'left' && 'items-start text-left',
                    selectedDesign.layout.textAlignment === 'center' && 'items-center text-center',
                    selectedDesign.layout.textAlignment === 'right' && 'items-end text-right'
                  )}>
                    <h3 className="font-bold text-lg truncate w-full">
                      {formData.fullName || 'Nom Complet'}
                    </h3>
                    <p className="text-sm opacity-90 truncate w-full">
                      {formData.company || 'Entreprise'}
                    </p>
                    <p className="text-xs opacity-75 truncate w-full">
                      {formData.jobTitle || 'Poste'}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className={cn(
                    'w-8 h-8 bg-white/20 rounded flex items-center justify-center',
                    selectedDesign.layout.qrPosition === 'bottom-left' && 'self-start',
                    selectedDesign.layout.qrPosition === 'bottom-center' && 'self-center',
                    selectedDesign.layout.qrPosition === 'bottom-right' && 'self-end'
                  )}>
                    <div className="w-6 h-6 bg-white/50 rounded grid grid-cols-2 gap-0.5">
                      <div className="bg-black" />
                      <div className="bg-white" />
                      <div className="bg-white" />
                      <div className="bg-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isLoading}
        >
          Précédent
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!selectedDesign || !selectedColor || isLoading}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
        >
          {isLoading ? 'Chargement...' : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}
