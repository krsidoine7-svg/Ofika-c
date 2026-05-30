'use client'

import { ReactNode } from 'react'
import { useResponsive, usePreventHorizontalScroll } from '@/lib/hooks/useResponsive'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Layout principal qui empêche le scroll horizontal et gère le responsive
 */
export function MainLayout({ children, className = "" }: MainLayoutProps) {
  // Utiliser les hooks pour gérer le responsive
  useResponsive()
  usePreventHorizontalScroll()

  return (
    <div className={`min-h-screen overflow-x-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Layout pour les pages d'authentification
 */
export function AuthLayout({ children, className = "" }: MainLayoutProps) {
  useResponsive()
  usePreventHorizontalScroll()

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4 overflow-x-hidden ${className}`}>
      <div className="w-full max-w-md space-y-6 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}

/**
 * Layout pour les pages du dashboard
 */
export function DashboardLayout({ children, className = "" }: MainLayoutProps) {
  useResponsive()
  usePreventHorizontalScroll()

  return (
    <div className={`min-h-screen bg-gray-50 overflow-x-hidden ${className}`}>
      {children}
    </div>
  )
}
