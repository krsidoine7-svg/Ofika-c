'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface OfikaBlinkingLogoProps {
  className?: string
  fontSize?: string
  color?: string
}

export const OfikaBlinkingLogo = ({ 
  className = '', 
  fontSize = 'text-lg',
  color = 'text-gray-900'
}: OfikaBlinkingLogoProps) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex items-center gap-2"
      >
        <span className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase whitespace-nowrap">
          Crée ton
        </span>
        
        <div className="relative flex items-center">
          <motion.div
              animate={{ 
                opacity: [1, 0.5, 1],
                filter: [
                  'drop-shadow(0 0 0px rgba(249,115,22,0))',
                  'drop-shadow(0 0 8px rgba(249,115,22,0.4))',
                  'drop-shadow(0 0 0px rgba(249,115,22,0))'
                ]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center"
          >
              <span className={`${fontSize} font-black tracking-tighter ${color} flex items-center`}>
                  O
                  <span className="text-orange-500">FIKA</span>
              </span>
              
              <motion.div 
                  animate={{ 
                      scale: [1, 1.5, 1],
                  }}
                  transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                  }}
                  className="w-2 h-2 rounded-full bg-orange-500 ml-1 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
              />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
