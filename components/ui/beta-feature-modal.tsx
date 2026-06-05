"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles, ArrowRight } from "lucide-react"

interface BetaFeatureModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  description?: string
}

export function BetaFeatureModal({ 
  isOpen, 
  onClose, 
  featureName,
  description 
}: BetaFeatureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Fonctionnalité Bêta
          </DialogTitle>
          <DialogDescription>
            {featureName} sera bientôt disponible !
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">En cours de développement</span>
            </div>
            <p className="text-sm text-orange-700">
              {description || `La fonctionnalité "${featureName}" est actuellement en développement et sera disponible très prochainement.`}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">En attendant, vous pouvez :</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Créer et personnaliser vos profils</li>
              <li>• Ajouter vos liens et réseaux sociaux</li>
              <li>• Tester les différents designs</li>
              <li>• Partager vos profils publics</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600">
              <ArrowRight className="h-4 w-4 mr-2" />
              Continuer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook pour gérer les fonctionnalités bêta
export function useBetaFeature() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [featureName, setFeatureName] = useState('')

  const showBetaModal = (feature: string) => {
    setFeatureName(feature)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFeatureName('')
  }

  return {
    isModalOpen,
    featureName,
    showBetaModal,
    closeModal
  }
}
