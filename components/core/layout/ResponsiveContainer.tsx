'use client'

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Composant conteneur responsive qui empêche le scroll horizontal
 * et assure un comportement responsive correct sur mobile
 */
export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`min-h-screen overflow-x-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Composant pour les pages d'authentification (login, signup)
 */
export function AuthContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4 overflow-x-hidden ${className}`}>
      <div className="w-full max-w-md space-y-6 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}

/**
 * Composant pour les pages du dashboard
 */
export function DashboardContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`min-h-screen bg-gray-50 overflow-x-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Composant pour les conteneurs de contenu avec padding
 */
export function ContentContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-8 overflow-x-hidden ${className}`}>
      {children}
    </div>
  )
}
