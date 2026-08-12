'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowUpRight } from 'lucide-react'

interface OfikaBlinkingLogoProps {
  className?: string
  fontSize?: string
  color?: string
  isDark?: boolean
  showCta?: boolean
}

export const OfikaBlinkingLogo = ({ 
  className = '', 
  fontSize = 'text-xs',
  color,
  isDark = false,
  showCta = true
}: OfikaBlinkingLogoProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open('https://ofika.co', '_blank')
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs transition-all duration-300 cursor-pointer ${
          isDark 
            ? 'bg-gray-900/85 hover:bg-gray-900 border border-white/15 text-white hover:border-orange-500/40 shadow-black/40' 
            : 'bg-white/90 hover:bg-white border border-gray-200/90 text-gray-800 hover:border-orange-300 shadow-gray-200/50'
        }`}
      >
        {/* Label mention */}
        <span className="text-[9px] font-medium text-gray-400 tracking-tight whitespace-nowrap">
          Propulsé par
        </span>

        {/* Brand Logo OFIKA avec point brillant orange */}
        <div className="flex items-center gap-0.5 font-bold tracking-tight">
          <span className={`${fontSize} font-black ${color || (isDark ? 'text-white' : 'text-gray-900')}`}>
            O<span className="text-orange-500">FIKA</span>
          </span>
          <motion.span 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-1 h-1 rounded-full bg-orange-500 ml-0.5 shadow-[0_0_6px_rgba(249,115,22,0.9)]"
          />
        </div>

        {/* Mini-Bouton CTA "Créer la mienne" compact */}
        {showCta && (
          <div className="flex items-center gap-0.5 ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide whitespace-nowrap leading-none bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
            <span>Créer la mienne</span>
            <ArrowUpRight className="w-2.5 h-2.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        )}
      </motion.div>
    </div>
  )
}
