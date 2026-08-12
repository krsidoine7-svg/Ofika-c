'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'

interface PaymentButtonGeniusPayProps {
  orderId: string
  className?: string
  text?: string
}

export function PaymentButtonGeniusPay({ orderId, className = '', text = 'Payer avec GeniusPay' }: PaymentButtonGeniusPayProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/payments/geniuspay/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Une erreur est survenue lors de l\'initiation du paiement.')
      }

      if (data.checkout_url) {
        // Redirection vers la page de paiement GeniusPay
        window.location.href = data.checkout_url
      } else {
        throw new Error('Aucune URL de paiement retournée.')
      }
    } catch (err) {
      console.error('Erreur de paiement:', err)
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className={`w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-lg shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap active:scale-[0.98] ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            <span className="truncate">Redirection...</span>
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{text}</span>
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-xs text-red-500 font-medium break-words max-w-xs">
          {error}
        </p>
      )}
    </div>
  )
}
