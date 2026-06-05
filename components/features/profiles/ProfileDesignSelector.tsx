'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, RefreshCw, Eye, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from '@/lib/supabase/client'

interface ProfileDesignSelectorProps {
  profileId: string
  currentDesign: string
  onDesignChange?: (newDesign: string) => void
}

const designOptions = [
  {
    value: 'design1',
    label: 'Design Classique',
    description: 'Layout vertical épuré et professionnel',
    priority: 'Professionnel',
    color: 'blue'
  },
  {
    value: 'design2',
    label: 'Design',
    description: 'Grille de cartes avec effets interactifs',
    priority: 'Populaire',
    color: 'purple'
  },
  {
    value: 'design3',
    label: 'Design Créatif',
    description: 'Effets visuels et animations avancées',
    priority: 'Premium',
    color: 'pink'
  },
  {
    value: 'design4',
    label: 'Design Nature',
    description: 'Style minimaliste avec couleurs naturelles',
    priority: 'Nouveau',
    color: 'emerald'
  }
]

export function ProfileDesignSelector({
  profileId,
  currentDesign,
  onDesignChange
}: ProfileDesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] = useState(currentDesign)
  const [isChanging, setIsChanging] = useState(false)

  const handleDesignChange = async (newDesign: string) => {
    if (newDesign === currentDesign) return

    setIsChanging(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          design_choice: newDesign,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) throw error

      setSelectedDesign(newDesign)
      onDesignChange?.(newDesign)

      const designLabel = designOptions.find(d => d.value === newDesign)?.label
      toast.success(`Design changé vers ${designLabel}`)

    } catch (error) {
      console.error('Error changing design:', error)
      toast.error('Erreur lors du changement de design')
    } finally {
      setIsChanging(false)
    }
  }

  const getCurrentDesignInfo = () => {
    return designOptions.find(d => d.value === currentDesign) || designOptions[0]
  }

  const currentDesignInfo = getCurrentDesignInfo()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Design de la page publique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Design actuel */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{currentDesignInfo.label}</h3>
                <p className="text-sm text-gray-600">{currentDesignInfo.description}</p>
              </div>
              <Badge className={`bg-${currentDesignInfo.color}-500 text-white`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Actuel
              </Badge>
            </div>
          </div>

          {/* Sélecteur de design */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Changer le design
            </label>
            <Select
              value={selectedDesign}
              onValueChange={setSelectedDesign}
              disabled={isChanging}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un design" />
              </SelectTrigger>
              <SelectContent>
                {designOptions.map((design) => (
                  <SelectItem key={design.value} value={design.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${design.color}-500`}></div>
                      <div>
                        <div className="font-medium">{design.label}</div>
                        <div className="text-xs text-gray-500">{design.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bouton de changement */}
          {selectedDesign !== currentDesign && (
            <Button
              onClick={() => handleDesignChange(selectedDesign)}
              disabled={isChanging}
              className="w-full"
            >
              {isChanging ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Changement en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Changer le design
                </>
              )}
            </Button>
          )}

          {/* Actions rapides */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/test-linkinbio', '_blank')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir les designs
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const profileUrl = window.location.origin + '/test-profile'
                  window.open(profileUrl, '_blank')
                }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </Button>
            </div>
          </div>

          {/* Informations */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>💡 Conseil :</strong> Le nouveau design sera appliqué immédiatement à votre page publique.</p>
            <p><strong>🔄 Changement :</strong> Videz le cache de votre navigateur (Ctrl+F5) si le changement n'est pas visible.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
