'use client'

// =====================================================
// COMPOSANT DE PERSONNALISATION QR CODE
// Sélection couleurs, presets, formes, logo
// =====================================================

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Label } from '@/components/core/ui/label'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs'
import { Palette, Image, Shapes, Sparkles } from 'lucide-react'
import { QR_PRESETS } from '@/lib/services/qr-generator'
import type { QRCustomizationOptions } from '@/lib/services/qr-generator'

interface CustomizationPanelProps {
  customization: Partial<QRCustomizationOptions>
  onChange: (customization: Partial<QRCustomizationOptions>) => void
  compact?: boolean
}

export default function CustomizationPanel({
  customization,
  onChange,
  compact = false
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'shapes' | 'logo'>('presets')

  // Appliquer un preset
  const applyPreset = (presetKey: keyof typeof QR_PRESETS) => {
    const preset = QR_PRESETS[presetKey]
    onChange({
      ...customization,
      ...preset
    })
  }

  return (
    <Card className={compact ? 'border-0 shadow-sm' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-orange-600" />
          Personnalisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="w-3 h-3 mr-1" />
              Couleurs
            </TabsTrigger>
            <TabsTrigger value="shapes" className="text-xs">
              <Shapes className="w-3 h-3 mr-1" />
              Formes
            </TabsTrigger>
            <TabsTrigger value="logo" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              Logo
            </TabsTrigger>
          </TabsList>

          {/* Tab Presets */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Preset Classic */}
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-orange-500"
                onClick={() => applyPreset('classic')}
              >
                <div className="w-full h-16 bg-black rounded mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 grid grid-cols-3 gap-0.5">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white" />
                    ))}
                  </div>
                </div>
                <span className="font-semibold text-sm">Classic</span>
                <span className="text-xs text-gray-500">Noir & Blanc</span>
              </Button>

              {/* Preset Modern */}
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-orange-500"
                onClick={() => applyPreset('modern')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white rounded-full" />
                    ))}
                  </div>
                </div>
                <span className="font-semibold text-sm">Modern</span>
                <span className="text-xs text-gray-500">Orange Ofika</span>
              </Button>

              {/* Preset Elegant */}
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-orange-500"
                onClick={() => applyPreset('elegant')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 grid grid-cols-3 gap-0.5">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-indigo-400 rounded-sm" />
                    ))}
                  </div>
                </div>
                <span className="font-semibold text-sm">Elegant</span>
                <span className="text-xs text-gray-500">Gris élégant</span>
              </Button>

              {/* Preset Gradient */}
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-orange-500"
                onClick={() => applyPreset('gradient')}
              >
                <div className="w-full h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white rounded-full" />
                    ))}
                  </div>
                </div>
                <span className="font-semibold text-sm">Gradient</span>
                <span className="text-xs text-gray-500">Orange-Rose</span>
              </Button>

              {/* Preset Minimal */}
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-orange-500 col-span-2"
                onClick={() => applyPreset('minimal')}
              >
                <div className="w-full h-16 bg-transparent border-2 border-gray-200 rounded mb-2 flex items-center justify-center">
                  <div className="w-12 h-12 grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-gray-600 rounded-full w-2 h-2" />
                    ))}
                  </div>
                </div>
                <span className="font-semibold text-sm">Minimal</span>
                <span className="text-xs text-gray-500">Dots minimalistes</span>
              </Button>
            </div>
          </TabsContent>

          {/* Tab Couleurs */}
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-3">
              {/* Couleur des points */}
              <div className="space-y-2">
                <Label htmlFor="dots-color">Couleur des points</Label>
                <div className="flex gap-2">
                  <Input
                    id="dots-color"
                    type="color"
                    value={customization.dotsColor || '#000000'}
                    onChange={(e) => onChange({ ...customization, dotsColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customization.dotsColor || '#000000'}
                    onChange={(e) => onChange({ ...customization, dotsColor: e.target.value })}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Couleur des coins */}
              <div className="space-y-2">
                <Label htmlFor="corners-color">Couleur des coins</Label>
                <div className="flex gap-2">
                  <Input
                    id="corners-color"
                    type="color"
                    value={customization.cornersSquareColor || customization.dotsColor || '#000000'}
                    onChange={(e) => onChange({ ...customization, cornersSquareColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customization.cornersSquareColor || customization.dotsColor || '#000000'}
                    onChange={(e) => onChange({ ...customization, cornersSquareColor: e.target.value })}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Couleur de fond */}
              <div className="space-y-2">
                <Label htmlFor="bg-color">Couleur de fond</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={customization.backgroundColor || '#FFFFFF'}
                    onChange={(e) => onChange({ ...customization, backgroundColor: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customization.backgroundColor || '#FFFFFF'}
                    onChange={(e) => onChange({ ...customization, backgroundColor: e.target.value })}
                    className="flex-1 font-mono"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              {/* Couleurs rapides */}
              <div className="space-y-2">
                <Label>Couleurs rapides</Label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#000000', '#f97316', '#ec4899', '#8b5cf6',
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
                  ].map(color => (
                    <button
                      key={color}
                      onClick={() => onChange({ ...customization, dotsColor: color })}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Formes */}
          <TabsContent value="shapes" className="space-y-4">
            <div className="space-y-4">
              {/* Forme des points */}
              <div className="space-y-2">
                <Label>Forme des points</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'square', label: 'Carré' },
                    { value: 'rounded', label: 'Arrondi' },
                    { value: 'dots', label: 'Points' },
                    { value: 'classy', label: 'Classe' },
                    { value: 'classy-rounded', label: 'Classe+' },
                    { value: 'extra-rounded', label: 'Très rond' },
                  ].map(shape => (
                    <Button
                      key={shape.value}
                      variant={customization.dotsType === shape.value ? 'default' : 'outline'}
                      onClick={() => onChange({ ...customization, dotsType: shape.value as any })}
                      className="text-xs"
                    >
                      {shape.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Forme des coins */}
              <div className="space-y-2">
                <Label>Forme des coins</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'square', label: 'Carré' },
                    { value: 'dot', label: 'Point' },
                    { value: 'extra-rounded', label: 'Arrondi' },
                  ].map(shape => (
                    <Button
                      key={shape.value}
                      variant={customization.cornersSquareType === shape.value ? 'default' : 'outline'}
                      onClick={() => onChange({ ...customization, cornersSquareType: shape.value as any })}
                      className="text-xs"
                    >
                      {shape.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Niveau de correction d'erreur */}
              <div className="space-y-2">
                <Label>Correction d'erreur</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'L', label: 'L (7%)' },
                    { value: 'M', label: 'M (15%)' },
                    { value: 'Q', label: 'Q (25%)' },
                    { value: 'H', label: 'H (30%)' },
                  ].map(level => (
                    <Button
                      key={level.value}
                      variant={customization.errorCorrectionLevel === level.value ? 'default' : 'outline'}
                      onClick={() => onChange({ ...customization, errorCorrectionLevel: level.value as any })}
                      className="text-xs"
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Plus le niveau est élevé, plus le QR code peut être endommagé tout en restant scannable
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab Logo */}
          <TabsContent value="logo" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce:</strong> Pour ajouter un logo, il doit être hébergé en ligne (URL HTTPS).
                  Utilisez un niveau de correction d'erreur élevé (Q ou H) pour plus de fiabilité.
                </p>
              </div>

              {/* URL du logo */}
              <div className="space-y-2">
                <Label htmlFor="logo-url">URL du logo</Label>
                <Input
                  id="logo-url"
                  type="url"
                  value={customization.logo || ''}
                  onChange={(e) => onChange({ ...customization, logo: e.target.value })}
                  placeholder="https://exemple.com/logo.png"
                  className="font-mono text-sm"
                />
              </div>

              {/* Preview du logo */}
              {customization.logo && (
                <div className="space-y-2">
                  <Label>Aperçu du logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-gray-50">
                    <img
                      src={customization.logo}
                      alt="Logo preview"
                      className="max-w-[100px] max-h-[100px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        e.currentTarget.alt = '❌ Erreur de chargement'
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({ ...customization, logo: undefined })}
                    className="w-full"
                  >
                    Retirer le logo
                  </Button>
                </div>
              )}

              {/* Conseil */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ Assurez-vous que le logo contraste bien avec le QR code et n'est pas trop grand (max 30% de la taille du QR).
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
