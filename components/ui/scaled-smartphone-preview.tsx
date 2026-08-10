'use client'

import { ReactNode } from 'react'

interface ScaledSmartphonePreviewProps {
  children: ReactNode
  maxHeightClass?: string
  scaleClass?: string
}

export function ScaledSmartphonePreview({
  children,
  maxHeightClass = "max-h-[450px] xl:max-h-[500px]",
  scaleClass = "scale-[0.48] xl:scale-[0.54]"
}: ScaledSmartphonePreviewProps) {
  return (
    <div className={`relative mx-auto border-gray-900 bg-gray-900 border-[6px] rounded-[2.5rem] h-full ${maxHeightClass} aspect-[9/18.5] shadow-2xl overflow-hidden ring-4 ring-gray-900/10 transition-all duration-500 hover:scale-[1.01] flex flex-col flex-shrink min-h-0`}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-900 rounded-b-xl z-20"></div>

      {/* Container de contour (sans scrollbar) */}
      <div className="rounded-[1.8rem] overflow-hidden w-full h-full bg-transparent relative z-10 flex items-start justify-center flex-1">
        {/* Zone d'affichage proportionnelle émulant une résolution mobile (360x720px) */}
        <div className={`w-[360px] h-[720px] origin-top ${scaleClass} flex-shrink-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent h-full relative`}>
          {children}
        </div>
      </div>
    </div>
  )
}
