'use client'

import React, { useState, ReactNode } from 'react'
import { Wifi, Signal } from 'lucide-react'

export type iPhoneFinish = 'titanium' | 'black' | 'white'

interface IPhone15FrameProps {
  children: ReactNode
  className?: string
  showColorPicker?: boolean
  defaultFinish?: iPhoneFinish
  scaleClass?: string
}

const finishConfig: Record<
  iPhoneFinish,
  {
    name: string
    outerBg: string
    borderTone: string
    buttonBg: string
    swatchBg: string
    swatchBorder: string
    shadowColor: string
  }
> = {
  titanium: {
    name: 'Titanium Naturel',
    outerBg: 'bg-gradient-to-b from-[#B8B4AA] via-[#8C887F] to-[#5C5952]',
    borderTone: 'border-[#7E7A72]',
    buttonBg: 'bg-[#8C887F]',
    swatchBg: 'bg-[#9C988F]',
    swatchBorder: 'border-[#6C685F]',
    shadowColor: 'shadow-stone-900/30'
  },
  black: {
    name: 'Noir Sidéral',
    outerBg: 'bg-gradient-to-b from-[#444347] via-[#242326] to-[#121114]',
    borderTone: 'border-[#2E2D31]',
    buttonBg: 'bg-[#2A292D]',
    swatchBg: 'bg-[#242326]',
    swatchBorder: 'border-[#121114]',
    shadowColor: 'shadow-black/50'
  },
  white: {
    name: 'Blanc Titanium',
    outerBg: 'bg-gradient-to-b from-[#F5F6F8] via-[#D8DADF] to-[#B0B3B8]',
    borderTone: 'border-[#C8CACF]',
    buttonBg: 'bg-[#D0D2D7]',
    swatchBg: 'bg-[#EAECEF]',
    swatchBorder: 'border-[#B8BABF]',
    shadowColor: 'shadow-slate-400/30'
  }
}

export function IPhone15Frame({
  children,
  className = '',
  showColorPicker = true,
  defaultFinish = 'titanium',
  scaleClass = 'scale-[0.70] sm:scale-[0.78] lg:scale-[0.82] xl:scale-[0.88] 2xl:scale-100 origin-center'
}: IPhone15FrameProps) {
  const [finish, setFinish] = useState<iPhoneFinish>(defaultFinish)
  const currentFinish = finishConfig[finish]

  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      {/* Sélecteur de couleur / finition */}
      {showColorPicker && (
        <div className="flex items-center gap-3 mb-6 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200/80 shadow-sm z-10 flex-shrink-0">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Finition :</span>
          <div className="flex items-center gap-2">
            {(Object.keys(finishConfig) as iPhoneFinish[]).map((key) => {
              const cfg = finishConfig[key]
              const isSelected = finish === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFinish(key)}
                  title={cfg.name}
                  className={`w-5 h-5 rounded-full ${cfg.swatchBg} ${cfg.swatchBorder} border shadow-inner transition-all duration-200 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-orange-500 ring-offset-2 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </button>
              )
            })}
          </div>
          <span className="text-[11px] font-semibold text-gray-700 ml-1">{currentFinish.name}</span>
        </div>
      )}

      {/* Cadre global du Smartphone avec boutons physiques externes */}
      <div className={`relative flex items-center justify-center ${scaleClass} transition-transform duration-300 flex-shrink-0`}>
        {/* Bouton Action (Gauche Haut) */}
        <div className={`absolute -left-[3px] top-[102px] w-[3px] h-[26px] ${currentFinish.buttonBg} rounded-l-sm z-0 shadow-sm`} />
        {/* Bouton Volume + (Gauche Milieu-Haut) */}
        <div className={`absolute -left-[3px] top-[144px] w-[3px] h-[46px] ${currentFinish.buttonBg} rounded-l-sm z-0 shadow-sm`} />
        {/* Bouton Volume - (Gauche Milieu-Bas) */}
        <div className={`absolute -left-[3px] top-[200px] w-[3px] h-[46px] ${currentFinish.buttonBg} rounded-l-sm z-0 shadow-sm`} />
        {/* Bouton Power (Droite) */}
        <div className={`absolute -right-[3px] top-[155px] w-[3px] h-[70px] ${currentFinish.buttonBg} rounded-r-sm z-0 shadow-sm`} />

        {/* Chassis Externe Titane */}
        <div
          className={`relative p-[6px] rounded-[50px] ${currentFinish.outerBg} ${currentFinish.borderTone} border ${currentFinish.shadowColor} shadow-2xl transition-colors duration-500 flex-shrink-0 flex flex-col`}
        >
          {/* Bordure intérieure noire de l'écran (Bezel ultra-fin) */}
          <div className="relative w-[320px] h-[640px] bg-black rounded-[44px] p-[3px] overflow-hidden flex flex-col shadow-inner flex-shrink-0">
            
            {/* Écran Intérieur */}
            <div className="relative w-full h-full bg-white rounded-[42px] overflow-hidden flex flex-col">

              {/* Barre d'état iOS Supérieure (Fixed Header inside screen) */}
              <div className="relative z-30 w-full h-[44px] px-6 pt-2 pb-1 flex items-center justify-between bg-transparent select-none pointer-events-none flex-shrink-0">
                {/* Heure à gauche */}
                <div className="w-16 flex items-center">
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight font-sans">9:41</span>
                </div>

                {/* Dynamic Island au centre */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2 z-40">
                  <div className="w-[110px] h-[28px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
                    {/* Objectif Appareil Photo */}
                    <div className="w-3.5 h-3.5 rounded-full bg-[#0a0a0f] ring-1 ring-white/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#181825] opacity-80" />
                    </div>
                    {/* Capteur de proximité / Glow discret */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0d0d15] ring-1 ring-white/5" />
                  </div>
                </div>

                {/* Icônes Réseau, WiFi et Batterie à droite */}
                <div className="w-16 flex items-center justify-end gap-1.5 text-gray-900">
                  <Signal className="w-3.5 h-3.5 fill-current stroke-none" />
                  <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                  {/* Batterie 100% */}
                  <div className="flex items-center gap-0.5">
                    <div className="w-5 h-2.5 border border-gray-900 rounded-[3px] p-[1px] flex items-center">
                      <div className="w-full h-full bg-gray-900 rounded-[1px]" />
                    </div>
                    <div className="w-[1px] h-1 bg-gray-900 rounded-r-sm" />
                  </div>
                </div>
              </div>

              {/* Contenu Défilant de l'Aperçu (Exclusif) */}
              <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain relative z-10 min-h-0">
                {children}
              </div>

              {/* Barre d'accueil iOS Inférieure (Home Indicator) */}
              <div className="relative z-30 w-full py-1.5 flex justify-center bg-transparent pointer-events-none flex-shrink-0">
                <div className="w-32 h-1 bg-gray-900/60 rounded-full" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
