'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { FocusManager } from '@/lib/accessibility/focus-manager'
import { AriaLabels } from '@/lib/accessibility/aria-labels'
import { Button } from './button'
import { X } from 'lucide-react'

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ariaLabel,
  ariaDescribedBy
}: AccessibleModalProps) {
  const modalRef = FocusManager.useModalFocus(isOpen)
  const focusTrapRef = FocusManager.useFocusTrap(isOpen)
  const { announce } = FocusManager.useScreenReaderAnnouncement()

  // Gérer les raccourcis clavier
  FocusManager.useKeyboardShortcuts({
    'Escape': () => closeOnEscape && onClose(),
    'ctrl+k': () => onClose(),
    'ctrl+w': () => onClose()
  })

  // Annoncer l'ouverture/fermeture de la modale
  useEffect(() => {
    if (isOpen) {
      announce(`Modale ouverte: ${title}`, 'assertive')
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden'
    } else {
      announce('Modale fermée', 'polite')
      // Restaurer le scroll du body
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, title, announce])

  // Gérer le clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={ariaDescribedBy}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Contenu de la modale */}
      <div
        ref={(node) => {
          if (modalRef.current !== node) {
            (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
          if (focusTrapRef.current !== node) {
            (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
        }}
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full mx-4',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 
            id="modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label={AriaLabels.descriptions.closeModal}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Composant pour les modales de confirmation
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      ariaLabel={AriaLabels.modals.confirmDelete}
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label={AriaLabels.descriptions.cancelChanges}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            aria-label={AriaLabels.descriptions.saveChanges}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </AccessibleModal>
  )
}
