"use client"

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

/**
 * Composant LoadingSpinner réutilisable
 * Élimine la duplication du spinner dans toute l'application
 * 
 * @example
 * <LoadingSpinner size="md" text="Chargement..." />
 * <LoadingSpinner fullScreen />
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-orange-500")} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Variante avec le logo Ofika pour les pages d'authentification
 */
export function LoadingSpinnerWithLogo({ text }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Logo size="md" variant="color" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-gray-600">{text || 'Chargement...'}</span>
        </div>
      </div>
    </div>
  )
}
