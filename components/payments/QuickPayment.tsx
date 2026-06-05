'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Smartphone,
  Loader2,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { useCreatePayment, usePaymentMethods, PaymentData, PaymentUtils } from '@/lib/hooks/usePayments'
import { toast } from 'sonner'

interface QuickPaymentProps {
  title?: string
  description?: string
  amount: number
  currency?: string
  orderId?: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  variant?: 'button' | 'card' | 'inline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showAmount?: boolean
  showDescription?: boolean
}

/**
 * Composant de paiement rapide et simple
 * Idéal pour intégrer les paiements partout dans l'application
 */
export function QuickPayment({
  title = "Paiement",
  description = "Effectuer un paiement sécurisé",
  amount,
  currency = 'XOF',
  orderId,
  onSuccess,
  onError,
  variant = 'button',
  size = 'default',
  className = '',
  showAmount = true,
  showDescription = true
}: QuickPaymentProps) {
  const { paymentMethods, loading: methodsLoading } = usePaymentMethods()
  const { createPayment, isProcessing } = useCreatePayment()
  const [selectedMethod, setSelectedMethod] = useState<string>('lygos')

  // Trouver la méthode de paiement par défaut (LyGOS si disponible)
  const defaultMethod = paymentMethods.find(m => m.id === 'lygos') || paymentMethods[0]

  const handlePayment = async () => {
    if (!defaultMethod) {
      toast.error('Aucune méthode de paiement disponible')
      return
    }

    const paymentData: PaymentData = {
      amount,
      currency,
      description: description || title,
      order_id: orderId || PaymentUtils.generateOrderId()
    }

    try {
      const result = await createPayment(defaultMethod.provider, paymentData)

      if (result.success) {
        toast.success('Redirection vers le paiement en cours...')
        onSuccess?.(result)
      } else {
        const errorMsg = result.error || 'Erreur lors du paiement'
        toast.error(errorMsg)
        onError?.(errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      toast.error(errorMsg)
      onError?.(errorMsg)
    }
  }

  if (methodsLoading) {
    return (
      <Button disabled size={size} className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Chargement...
      </Button>
    )
  }

  if (!defaultMethod) {
    return (
      <Button disabled size={size} className={className}>
        <CreditCard className="h-4 w-4 mr-2" />
        Indisponible
      </Button>
    )
  }

  // Variante bouton simple
  if (variant === 'button') {
    return (
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        size={size}
        className={`${className} ${defaultMethod.provider === 'lygos' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        {isProcessing
          ? 'Traitement...'
          : showAmount
            ? `Payer ${PaymentUtils.formatAmount(amount, currency)}`
            : 'Payer'
        }
      </Button>
    )
  }

  // Variante carte
  if (variant === 'card') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{title}</h3>
                {showDescription && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-lg">
                {PaymentUtils.formatAmount(amount, currency)}
              </div>
              <Badge variant="secondary" className="text-xs">
                {defaultMethod.name}
              </Badge>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full mt-4"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Payer maintenant
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Variante inline (minimal)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          size="sm"
          variant="outline"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <div className="text-sm font-medium">{title}</div>
          {showAmount && (
            <div className="text-xs text-gray-600">
              {PaymentUtils.formatAmount(amount, currency)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

/**
 * Composant pour les achats rapides (cartes NFC, etc.)
 */
export function QuickPurchase({
  itemName,
  price,
  currency = 'XOF',
  onPurchase,
  className = ''
}: {
  itemName: string
  price: number
  currency?: string
  onPurchase?: () => void
  className?: string
}) {
  return (
    <QuickPayment
      title={`Acheter ${itemName}`}
      description={`Carte ${itemName} - Livraison sous 24h`}
      amount={price}
      currency={currency}
      onSuccess={(result) => {
        toast.success(`${itemName} commandé avec succès !`)
        onPurchase?.()
      }}
      variant="card"
      className={className}
    />
  )
}

/**
 * Composant pour les dons/tips
 */
export function QuickDonation({
  recipientName,
  suggestedAmounts = [1000, 2500, 5000],
  currency = 'XOF',
  onDonation,
  className = ''
}: {
  recipientName: string
  suggestedAmounts?: number[]
  currency?: string
  onDonation?: (amount: number) => void
  className?: string
}) {
  const [selectedAmount, setSelectedAmount] = useState<number>(suggestedAmounts[0])

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="font-medium">Faire un don à {recipientName}</h3>
          <p className="text-sm text-gray-600">Votre soutien est apprécié 💝</p>
        </div>

        {/* Montants suggérés */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {suggestedAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAmount(amount)}
              className="text-xs"
            >
              {PaymentUtils.formatAmount(amount, currency)}
            </Button>
          ))}
        </div>

        {/* Paiement */}
        <QuickPayment
          title="Faire un don"
          description={`Don à ${recipientName}`}
          amount={selectedAmount}
          currency={currency}
          onSuccess={(result) => {
            toast.success('Merci pour votre don ! 🙏')
            onDonation?.(selectedAmount)
          }}
          variant="button"
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
