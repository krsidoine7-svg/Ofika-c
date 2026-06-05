"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  variant?: 'color' | 'white' | 'dark' | 'secondary' | 'slogan' | 'slogan-white' | 'slogan-dark' | 'insigne'
}

const sizeClasses = {
  sm: {
    container: 'w-8 h-8',
    fullText: 'text-lg'
  },
  md: {
    container: 'w-12 h-12',
    fullText: 'text-2xl'
  },
  lg: {
    container: 'w-16 h-16',
    fullText: 'text-3xl'
  },
  xl: {
    container: 'w-20 h-20',
    fullText: 'text-4xl'
  }
}

/**
 * Composant Logo Ofika réutilisable avec les vrais logos
 * Utilise les logos SVG fournis sans modification ni fond simulé
 * 
 * @example
 * <Logo size="md" />
 * <Logo size="lg" showText />
 * <Logo size="md" variant="white" />
 * <Logo size="xl" variant="icon" />
 * <Logo size="md" variant="secondary" />
 */
export function Logo({
  size = 'md',
  className,
  showText = false,
  variant = 'color'
}: LogoProps) {
  const sizes = sizeClasses[size]

  // Mappage des logos selon la variante et si on veut le texte ou non
  const getLogoSrc = () => {
    if (showText) {
      switch (variant) {
        case 'white': return '/assets/logos/logo-white-full.svg'
        case 'secondary':
        case 'dark': return '/assets/logos/logo-black-full.svg'
        case 'slogan': return '/assets/logos/logo-slogan.svg'
        case 'slogan-white': return '/assets/logos/logo-slogan-white.svg'
        case 'slogan-dark': return '/assets/logos/logo-slogan-black.svg'
        case 'color':
        default: return '/assets/logos/logo-orange-full.svg'
      }
    } else {
      switch (variant) {
        case 'insigne': return '/assets/logos/logo-square.svg'
        case 'white': return '/assets/logos/logo-white.svg'
        case 'secondary':
        case 'dark': return '/assets/logos/logo-black.svg'
        case 'color':
        default: return '/assets/logos/logo-orange.svg'
      }
    }
  }

  const logoSrc = getLogoSrc()
  const isWide = showText // Les logos avec texte sont rectangulaires, les icônes sont carrées

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      sizes.container,
      isWide ? (size === 'sm' ? 'w-24' : size === 'md' ? 'w-32' : size === 'lg' ? 'w-48' : 'w-64') : sizes.container.split(' ')[0],
      className
    )}>
      <Image
        src={logoSrc}
        alt="Ofika Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
