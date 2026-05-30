'use client'

import { useEffect, useState } from 'react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

/**
 * Hook pour gérer le responsive et empêcher le scroll horizontal
 */
export function useResponsive() {
  const [responsive, setResponsive] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  })

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setResponsive({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      })

      // Empêcher le scroll horizontal sur mobile
      if (width < 768) {
        document.body.style.overflowX = 'hidden'
        document.documentElement.style.overflowX = 'hidden'
      } else {
        document.body.style.overflowX = 'auto'
        document.documentElement.style.overflowX = 'auto'
      }
    }

    // Mise à jour initiale
    updateResponsive()

    // Écouter les changements de taille
    window.addEventListener('resize', updateResponsive)
    
    // Nettoyage
    return () => {
      window.removeEventListener('resize', updateResponsive)
      // Restaurer les styles par défaut
      document.body.style.overflowX = 'auto'
      document.documentElement.style.overflowX = 'auto'
    }
  }, [])

  return responsive
}

/**
 * Hook pour empêcher le scroll horizontal
 */
export function usePreventHorizontalScroll() {
  useEffect(() => {
    const preventHorizontalScroll = (e: WheelEvent) => {
      // Empêcher le scroll horizontal avec la molette
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
      }
    }

    const preventTouchScroll = (e: TouchEvent) => {
      // Empêcher le scroll horizontal avec le touch
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const startX = touch.clientX
        const startY = touch.clientY
        
        const handleTouchMove = (moveEvent: TouchEvent) => {
          const currentX = moveEvent.touches[0].clientX
          const currentY = moveEvent.touches[0].clientY
          const deltaX = Math.abs(currentX - startX)
          const deltaY = Math.abs(currentY - startY)
          
          // Si le mouvement horizontal est plus important que le vertical, empêcher
          if (deltaX > deltaY) {
            moveEvent.preventDefault()
          }
        }

        document.addEventListener('touchmove', handleTouchMove, { passive: false })
        
        const cleanup = () => {
          document.removeEventListener('touchmove', handleTouchMove)
        }
        
        document.addEventListener('touchend', cleanup, { once: true })
      }
    }

    // Ajouter les écouteurs
    document.addEventListener('wheel', preventHorizontalScroll, { passive: false })
    document.addEventListener('touchstart', preventTouchScroll, { passive: false })

    // Nettoyage
    return () => {
      document.removeEventListener('wheel', preventHorizontalScroll)
      document.removeEventListener('touchstart', preventTouchScroll)
    }
  }, [])
}
