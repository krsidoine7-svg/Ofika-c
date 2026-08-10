'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'
import { useCreatePayment, PaymentData, PaymentMethod, PaymentUtils } from '@/lib/hooks/usePayments'

interface PaymentButtonProps {
  paymentData: PaymentData
  paymentMethod: PaymentMethod
  variant?: 'button' | 'card' | 'minimal'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  disabled?: boolean
  showFees?: boolean
}

export function PaymentButton({
  paymentData,
  paymentMethod,
  variant = 'button',
  size = 'default',
  className = '',
  onSuccess,
  onError,
  disabled = false,
  showFees = true
}: PaymentButtonProps) {
  const { createPayment, isProcessing } = useCreatePayment()
  const [showDetails, setShowDetails] = useState(false)

  const handlePayment = async () => {
    if (!paymentMethod.is_active) {
      toast.error(`${paymentMethod.name} n'est pas disponible actuellement`)
      return
    }

    try {
      const result = await createPayment(paymentMethod.provider, paymentData)

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

  // Calcul des frais
  const fees = paymentMethod.fees ? PaymentUtils.calculateFees(paymentData.amount, paymentMethod.fees / 100) : 0
  const totalAmount = paymentData.amount + fees

  // Icône selon le fournisseur
  const getProviderIcon = () => {
    switch (paymentMethod.provider) {
      case 'wave':
        return <Wallet className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  // Variante bouton simple
  if (variant === 'button') {
    return (
      <div className="space-y-2">
        <Button
          onClick={handlePayment}
          disabled={disabled || isProcessing || !paymentMethod.is_active}
          size={size}
          className={`${className} ${!paymentMethod.is_active ? 'opacity-50' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            getProviderIcon()
          )}
          <span className="ml-2">
            {isProcessing
              ? 'Traitement...'
              : `Payer ${PaymentUtils.formatAmount(totalAmount, paymentMethod.currency)}`
            }
          </span>
        </Button>

        {showFees && fees > 0 && (
          <p className="text-xs text-gray-500 text-center">
            Montant: {PaymentUtils.formatAmount(paymentData.amount, paymentMethod.currency)} +
            Frais: {PaymentUtils.formatAmount(fees, paymentMethod.currency)}
          </p>
        )}
      </div>
    )
  }

  // Variante carte
  if (variant === 'card') {
    return (
      <Card className={`cursor-pointer transition-all ${!paymentMethod.is_active ? 'opacity-50' : 'hover:shadow-md'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getProviderIcon()}
              <div>
                <h3 className="font-medium">{paymentMethod.name}</h3>
                <p className="text-sm text-gray-600">{paymentMethod.description}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold">
                {PaymentUtils.formatAmount(totalAmount, paymentMethod.currency)}
              </div>
              {showFees && fees > 0 && (
                <div className="text-xs text-gray-500">
                  +{PaymentUtils.formatAmount(fees, paymentMethod.currency)} frais
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!paymentMethod.is_active && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Indisponible
                </Badge>
              )}
              {paymentMethod.countries && (
                <Badge variant="outline" className="text-xs">
                  {paymentMethod.countries.length} pays
                </Badge>
              )}
            </div>

            <Button
              onClick={handlePayment}
              disabled={disabled || isProcessing || !paymentMethod.is_active}
              size="sm"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                'Payer'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Variante minimal
  if (variant === 'minimal') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handlePayment}
        disabled={disabled || isProcessing || !paymentMethod.is_active}
        className={className}
      >
        {getProviderIcon()}
        <span className="ml-2">{paymentMethod.name}</span>
        {!paymentMethod.is_active && (
          <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
        )}
      </Button>
    )
  }

  return null
}

// Composant pour sélectionner une méthode de paiement
interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[]
  selectedMethod?: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  amount: number
  currency?: string
  showFees?: boolean
}

export function PaymentMethodSelector({
  paymentMethods,
  selectedMethod,
  onSelect,
  amount,
  currency = 'XOF',
  showFees = true
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Choisissez votre méthode de paiement</h3>

      {paymentMethods.map((method) => {
        const fees = method.fees ? PaymentUtils.calculateFees(amount, method.fees / 100) : 0
        const total = amount + fees

        return (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all ${selectedMethod?.id === method.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
              } ${!method.is_active ? 'opacity-50' : ''}`}
            onClick={() => method.is_active && onSelect(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={selectedMethod?.id === method.id}
                    onChange={() => method.is_active && onSelect(method)}
                    disabled={!method.is_active}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-2">
                    {method.provider === 'wave' && <Wallet className="h-5 w-5 text-sky-500" />}
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {PaymentUtils.formatAmount(total, currency)}
                  </div>
                  {showFees && fees > 0 && (
                    <div className="text-xs text-gray-500">
                      {PaymentUtils.formatAmount(amount, currency)} + {PaymentUtils.formatAmount(fees, currency)} frais
                    </div>
                  )}
                </div>
              </div>

              {!method.is_active && (
                <div className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Méthode temporairement indisponible
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">Aucune méthode de paiement disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
