'use client'

import { useMemo } from 'react'

interface ProfileMonogramProps {
  name?: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'dark' | 'light' | 'gold' | 'teal'
  shape?: 'rounded-2xl' | 'rounded-full' | 'rounded-xl'
  className?: string
  priority?: boolean
  customBgColor?: string
  customTextColor?: string
  customBorderColor?: string
}

export function ProfileMonogram({
  name = 'Votre Nom',
  imageUrl,
  size = 'lg',
  theme = 'dark',
  shape = 'rounded-2xl',
  className = '',
  customBgColor,
  customTextColor,
  customBorderColor,
}: ProfileMonogramProps) {
  // Extraction intelligente des initiales (ex: "Marc Kouadio" -> "MK", "Sophie" -> "S")
  const initials = useMemo(() => {
    if (!name || !name.trim()) return 'O'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase()
  }, [name])

  // Dimensions strictes conformes aux standards ergonomiques
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-28 h-28 text-3xl'
  }[size]

  // Styles thématiques nobles (couleurs pleines, aucun dégradé criard)
  const themeStyles = {
    dark: {
      bg: 'bg-[#121216]',
      text: 'text-neutral-100',
      border: 'border border-white/20',
      ring: 'ring-1 ring-inset ring-white/10',
      subText: 'text-neutral-400'
    },
    light: {
      bg: 'bg-slate-900',
      text: 'text-white',
      border: 'border border-slate-700',
      ring: 'ring-1 ring-inset ring-white/15',
      subText: 'text-slate-400'
    },
    gold: {
      bg: 'bg-[#0f0e0c]',
      text: 'text-[#e5c158]',
      border: 'border border-[#d4af37]/50',
      ring: 'ring-1 ring-inset ring-[#d4af37]/20',
      subText: 'text-[#d4af37]/70'
    },
    teal: {
      bg: 'bg-[#14363a]',
      text: 'text-[#f5efe6]',
      border: 'border border-[#f5efe6]/40',
      ring: 'ring-1 ring-inset ring-[#f5efe6]/15',
      subText: 'text-[#f5efe6]/70'
    }
  }[theme]

  // Cas 1 : Photo réelle disponible
  if (imageUrl) {
    return (
      <div
        className={`relative ${sizeClasses} ${shape} overflow-hidden shadow-md shrink-0 select-none ${themeStyles.border} ${className}`}
        style={customBorderColor ? { borderColor: customBorderColor } : undefined}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    )
  }

  // Cas 2 : Monogramme typographique de luxe
  return (
    <div
      role="img"
      aria-label={`Monogramme de ${name}`}
      className={`relative ${sizeClasses} ${shape} ${!customBgColor ? themeStyles.bg : ''} ${!customBorderColor ? themeStyles.border : ''} ${themeStyles.ring} shadow-md shrink-0 flex flex-col items-center justify-center select-none ${className}`}
      style={{
        ...(customBgColor ? { backgroundColor: customBgColor } : {}),
        ...(customBorderColor ? { borderColor: customBorderColor, borderWidth: '1.5px', borderStyle: 'solid' } : {})
      }}
    >
      {/* Lettres sculptées avec espacement optique */}
      <span
        className={`font-serif font-black tracking-widest ${!customTextColor ? themeStyles.text : ''} transition-transform duration-200`}
        style={customTextColor ? { color: customTextColor } : undefined}
      >
        {initials}
      </span>

      {/* Micro-barre d'accentuation haute joaillerie */}
      <div
        className={`h-[1.5px] w-4 mt-0.5 rounded-full ${
          theme === 'gold'
            ? 'bg-[#d4af37]/60'
            : theme === 'teal'
            ? 'bg-[#f5efe6]/40'
            : 'bg-white/30'
        }`}
        style={customTextColor ? { backgroundColor: customTextColor, opacity: 0.5 } : undefined}
      />
    </div>
  )
}
