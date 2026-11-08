'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, Palette, Layout } from 'lucide-react'

interface Step3CustomizationProps {
  data: any
  onChange: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

const COLOR_THEMES = [
  { id: 'blue', name: 'Bleu Océan', primary: '#3B82F6', secondary: '#60A5FA', gradient: 'from-blue-600 to-blue-400' },
  { id: 'purple', name: 'Violet Mystique', primary: '#8B5CF6', secondary: '#A78BFA', gradient: 'from-purple-600 to-purple-400' },
  { id: 'pink', name: 'Rose Passion', primary: '#EC4899', secondary: '#F472B6', gradient: 'from-pink-600 to-pink-400' },
  { id: 'green', name: 'Vert Nature', primary: '#10B981', secondary: '#34D399', gradient: 'from-green-600 to-green-400' },
  { id: 'orange', name: 'Orange Énergie', primary: '#F59E0B', secondary: '#FBBF24', gradient: 'from-orange-600 to-orange-400' },
  { id: 'dark', name: 'Noir Élégant', primary: '#1F2937', secondary: '#374151', gradient: 'from-gray-900 to-gray-700' }
]

const TEMPLATES = [
  { 
    id: 'minimal', 
    name: 'Minimaliste', 
    description: 'Design épuré et moderne',
    preview: '📄'
  },
  { 
    id: 'card', 
    name: 'Carte', 
    description: 'Style carte de visite',
    preview: '🎴'
  },
  { 
    id: 'gradient', 
    name: 'Gradient', 
    description: 'Fond avec dégradé coloré',
    preview: '🌈'
  },
  { 
    id: 'glass', 
    name: 'Glassmorphism', 
    description: 'Effet de verre moderne',
    preview: '💎'
  }
]

export function Step3Customization({ data, onChange, onNext, onPrev }: Step3CustomizationProps) {
  const [colorTheme, setColorTheme] = useState(data.colorTheme || 'blue')
  const [template, setTemplate] = useState(data.template || 'minimal')

  const handleColorChange = (value: string) => {
    setColorTheme(value)
    onChange({ ...data, colorTheme: value })
  }

  const handleTemplateChange = (value: string) => {
    setTemplate(value)
    onChange({ ...data, template: value })
  }

  const handleSubmit = () => {
    onChange({ colorTheme, template })
    onNext()
  }

  const selectedColor = COLOR_THEMES.find(c => c.id === colorTheme)

  return (
    <div className="space-y-8">
      {/* Thème de couleur */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Thème de couleur</h3>
        </div>
        
        <RadioGroup value={colorTheme} onValueChange={handleColorChange}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COLOR_THEMES.map((theme) => (
              <Card
                key={theme.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  colorTheme === theme.id ? 'ring-2 ring-offset-2 ring-blue-600 shadow-lg' : ''
                }`}
                onClick={() => handleColorChange(theme.id)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={theme.id} id={theme.id} />
                  <Label htmlFor={theme.id} className="flex-1 cursor-pointer">
                    <div className="space-y-2">
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${theme.gradient}`} />
                      <p className="font-medium text-sm">{theme.name}</p>
                    </div>
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Template */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Style de page</h3>
        </div>

        <RadioGroup value={template} onValueChange={handleTemplateChange}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((tmpl) => (
              <Card
                key={tmpl.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  template === tmpl.id ? 'ring-2 ring-offset-2 ring-blue-600 shadow-lg' : ''
                }`}
                onClick={() => handleTemplateChange(tmpl.id)}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={tmpl.id} id={tmpl.id} className="mt-1" />
                  <Label htmlFor={tmpl.id} className="flex-1 cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tmpl.preview}</span>
                        <div>
                          <p className="font-medium">{tmpl.name}</p>
                          <p className="text-sm text-gray-500">{tmpl.description}</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Aperçu */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Aperçu de votre style</h4>
        <div className={`h-40 rounded-lg bg-gradient-to-br ${selectedColor?.gradient} flex items-center justify-center shadow-xl`}>
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-2">{data.fullName || 'Votre Nom'}</p>
            <p className="text-sm opacity-90">{data.bio || 'Votre biographie apparaîtra ici'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Thème : {selectedColor?.name} • Style : {TEMPLATES.find(t => t.id === template)?.name}
        </p>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="min-w-[200px]"
        >
          Continuer
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
