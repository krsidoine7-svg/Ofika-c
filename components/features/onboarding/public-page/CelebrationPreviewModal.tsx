'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import { ArrowRight, Check } from 'lucide-react'

interface CelebrationPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedDesign: string
  renderPreview: (designId: string) => React.ReactNode
  isLoggedIn?: boolean
}

export function CelebrationPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDesign,
  renderPreview,
  isLoggedIn = false
}: CelebrationPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-2xl p-5 bg-white border border-neutral-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center max-h-[92vh] overflow-y-auto text-neutral-900">
        
        {/* En-tête Épuré & Statutaire (Style Apple / Linear) */}
        <div className="text-center space-y-1.5 pt-1 flex-shrink-0 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-medium mx-auto mb-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Votre carte est prête</span>
          </div>

          <DialogTitle className="text-xl font-semibold text-neutral-950 tracking-tight">
            Rendu Final de votre Profil
          </DialogTitle>

          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Voici comment votre page et vos coordonnées apparaîtront sur le smartphone de vos clients.
          </p>
        </div>

        {/* Aperçu Smartphone iPhone 15 */}
        <div className="w-full flex justify-center py-2 relative flex-shrink-0">
          <IPhone15Frame showColorPicker={false} scaleClass="scale-[0.85] sm:scale-[0.92] origin-top">
            <div className="w-full h-full relative">
              {renderPreview(selectedDesign)}
            </div>
          </IPhone15Frame>
        </div>

        {/* Boutons d'Action Épurés & Nobles */}
        <div className="flex flex-col items-center gap-2 w-full pt-3 flex-shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-md pb-1 border-t border-neutral-100 z-20">
          <Button
            onClick={onConfirm}
            className="w-full h-11 bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{isLoggedIn ? 'Valider et mettre en ligne mon profil' : 'Continuer vers la création du compte'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-700 font-normal transition-colors py-1 cursor-pointer"
          >
            Modifier encore les coordonnées
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
