'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import { ArrowRight, Sparkles, PartyPopper } from 'lucide-react'

interface CelebrationPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedDesign: string
  renderPreview: (designId: string) => React.ReactNode
}

export function CelebrationPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDesign,
  renderPreview
}: CelebrationPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-[2rem] p-4 bg-gradient-to-b from-amber-50/90 via-white to-orange-50/60 border border-orange-200 shadow-2xl flex flex-col items-center max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* En-tête */}
        <div className="text-center space-y-1 pt-1 flex-shrink-0 w-full">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/30 animate-bounce">
            <PartyPopper className="w-6 h-6" />
          </div>

          <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 flex items-center justify-center gap-1.5 pt-1">
            <span>Bravo ! Votre carte est prête</span>
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          </DialogTitle>

          <p className="text-[11px] sm:text-xs text-gray-600 max-w-xs mx-auto">
            Voici le rendu final de votre carte digitale dans le smartphone.
          </p>
        </div>

        {/* Aperçu Smartphone iPhone 15 (Très grand) */}
        <div className="w-full flex justify-center py-2 relative flex-shrink-0">
          <IPhone15Frame showColorPicker={false} scaleClass="scale-[0.88] sm:scale-[0.98] origin-top">
            <div className="w-full h-full relative">
              {renderPreview(selectedDesign)}
            </div>
          </IPhone15Frame>
        </div>

        {/* Bouton d'Action TOUJOURS VISIBLE ET ANCRE EN BAS */}
        <div className="flex flex-col items-center gap-1.5 w-full pt-3 flex-shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-md pb-1 border-t border-gray-100/80 z-20">
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-orange-500/30 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Continuer vers la création du compte</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-gray-400 hover:text-gray-600 underline font-medium cursor-pointer"
          >
            Modifier encore ma carte
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
