'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { Palette, Sparkles, CheckCircle, Eye, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface DesignSelectorProps {
  currentDesign: 'classic' | 'creative'
  onDesignChange: (design: 'classic' | 'creative') => Promise<void>
  isLoading?: boolean
}

export function DesignSelector({ 
  currentDesign, 
  onDesignChange, 
  isLoading = false 
}: DesignSelectorProps) {
  const [selectedDesign, setSelectedDesign] = useState<'classic' | 'creative'>(currentDesign)
  const [isChanging, setIsChanging] = useState(false)

  const handleDesignChange = async (design: 'classic' | 'creative') => {
    if (design === currentDesign) return

    setIsChanging(true)
    try {
      await onDesignChange(design)
      setSelectedDesign(design)
      toast.success(`Design changé vers ${design === 'classic' ? 'Classique' : 'Créatif'}`)
    } catch (error) {
      console.error('Error changing design:', error)
      toast.error('Erreur lors du changement de design')
    } finally {
      setIsChanging(false)
    }
  }

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
          
          {/* Design Classique */}
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedDesign === 'classic' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSelectedDesign('classic')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Design Classique</h3>
                  <p className="text-sm text-gray-600">Layout vertical épuré et professionnel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDesign === 'classic' && (
                  <Badge className="bg-blue-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actuel
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open('/test-linkinbio', '_blank')
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>
              </div>
            </div>
          </div>

          {/* Design Créatif */}
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedDesign === 'creative' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSelectedDesign('creative')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full mix-blend-multiply filter blur-sm opacity-50"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-500 rounded-full mix-blend-multiply filter blur-sm opacity-50"></div>
                  </div>
                  <Sparkles className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Design Créatif</h3>
                  <p className="text-sm text-gray-600">Effets visuels et animations modernes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDesign === 'creative' && (
                  <Badge className="bg-purple-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Actuel
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open('/test-linkinbio', '_blank')
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Aperçu
                </Button>
              </div>
            </div>
          </div>

          {/* Bouton de changement */}
          {selectedDesign !== currentDesign && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => handleDesignChange(selectedDesign)}
                disabled={isChanging || isLoading}
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
                    Changer vers {selectedDesign === 'classic' ? 'Design Classique' : 'Design Créatif'}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Informations */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>💡 Conseil :</strong> Visitez <code>/test-linkinbio</code> pour comparer les designs en temps réel.</p>
            <p><strong>🔄 Changement :</strong> Le nouveau design sera appliqué immédiatement à votre page publique.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
