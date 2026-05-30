import { useEffect, useRef, useCallback } from 'react'

/**
 * Service de gestion du focus pour l'accessibilité
 */

export class FocusManager {
  /**
   * Hook pour gérer le focus dans les modales
   */
  static useModalFocus(isOpen: boolean) {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    useEffect(() => {
      if (isOpen) {
        // Sauvegarder l'élément actif
        previousActiveElement.current = document.activeElement as HTMLElement
        
        // Focus sur la modale
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus()
          }
        }
      } else {
        // Restaurer le focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      }
    }, [isOpen])

    return modalRef
  }

  /**
   * Hook pour gérer le focus trap dans les modales
   */
  static useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null)

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return

      if (event.key === 'Tab') {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }, [isActive])

    useEffect(() => {
      if (isActive) {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isActive, handleKeyDown])

    return containerRef
  }

  /**
   * Hook pour gérer l'annonce des changements aux lecteurs d'écran
   */
  static useScreenReaderAnnouncement() {
    const announceRef = useRef<HTMLDivElement>(null)

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (announceRef.current) {
        announceRef.current.setAttribute('aria-live', priority)
        announceRef.current.textContent = message
        
        // Nettoyer après 3 secondes
        setTimeout(() => {
          if (announceRef.current) {
            announceRef.current.textContent = ''
          }
        }, 3000)
      }
    }, [])

    return { announceRef, announce }
  }

  /**
   * Hook pour gérer la navigation au clavier
   */
  static useKeyboardNavigation() {
    const handleArrowKeys = useCallback((event: KeyboardEvent, items: HTMLElement[]) => {
      const currentIndex = items.findIndex(item => item === document.activeElement)
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          const nextIndex = (currentIndex + 1) % items.length
          items[nextIndex]?.focus()
          break
          
        case 'ArrowUp':
          event.preventDefault()
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
          items[prevIndex]?.focus()
          break
          
        case 'Home':
          event.preventDefault()
          items[0]?.focus()
          break
          
        case 'End':
          event.preventDefault()
          items[items.length - 1]?.focus()
          break
      }
    }, [])

    return { handleArrowKeys }
  }

  /**
   * Hook pour gérer les raccourcis clavier
   */
  static useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase()
        const modifier = event.ctrlKey || event.metaKey
        
        // Raccourcis avec modificateur (Ctrl/Cmd + key)
        if (modifier) {
          const shortcutKey = `ctrl+${key}`
          if (shortcuts[shortcutKey]) {
            event.preventDefault()
            shortcuts[shortcutKey]()
          }
        }
        
        // Raccourcis simples (Escape, Enter, etc.)
        if (shortcuts[key]) {
          event.preventDefault()
          shortcuts[key]()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts])
  }

  /**
   * Fonction utilitaire pour obtenir les éléments focusables
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }

  /**
   * Fonction utilitaire pour vérifier si un élément est visible
   */
  static isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0
  }

  /**
   * Fonction utilitaire pour annoncer les changements de page
   */
  static announcePageChange(pageTitle: string) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `Page changée: ${pageTitle}`
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}
