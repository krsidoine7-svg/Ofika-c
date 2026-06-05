'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap
} from "lucide-react"
import { Order } from '@/lib/types/payments'

interface PaymentProcessStatusProps {
  order: Order
  onPaymentRedirect?: () => void
  className?: string
}

type ProcessStep = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'completed' | 'current' | 'pending' | 'error'
}

export function PaymentProcessStatus({
  order,
  onPaymentRedirect,
  className = ""
}: PaymentProcessStatusProps) {
  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)

  useEffect(() => {
    generateSteps()
  }, [order])

  const generateSteps = () => {
    const processSteps: ProcessStep[] = [
      {
        id: 'order_created',
        title: 'Commande créée',
        description: 'Votre commande a été enregistrée',
        icon: Package,
        status: 'completed'
      },
      {
        id: 'payment_link',
        title: 'Lien de paiement LyGOS',
        description: order.lygos_payment_url
          ? 'Lien de paiement LyGOS généré avec succès'
          : 'Génération du lien de paiement LyGOS...',
        icon: Zap,
        status: order.lygos_payment_url ? 'completed' : 'current'
      },
      {
        id: 'payment_pending',
        title: 'Paiement en attente',
        description: 'En attente de votre paiement via LyGOS',
        icon: Loader2,
        status: order.status === 'paid' ? 'completed' :
          order.lygos_payment_url ? 'current' : 'pending'
      },
      {
        id: 'payment_confirmed',
        title: 'Paiement confirmé',
        description: 'Votre paiement a été validé',
        icon: CheckCircle,
        status: order.status === 'paid' ? 'completed' : 'pending'
      }
    ]

    // Calculer le progrès
    const completedSteps = processSteps.filter(step => step.status === 'completed').length
    const progress = (completedSteps / processSteps.length) * 100

    setSteps(processSteps)
    setCurrentProgress(progress)
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'current': return 'text-orange-600 bg-orange-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-400 bg-gray-100'
    }
  }

  const getStepConnectorColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">État de votre commande</h3>
          <Progress value={currentProgress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(currentProgress)}% terminé
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${getStepStatusColor(step.status)}
                  `}>
                    <Icon className={`
                      h-5 w-5 
                      ${step.status === 'current' && step.id === 'payment_pending' ? 'animate-spin' : ''}
                    `} />
                  </div>
                  {!isLast && (
                    <div className={`
                      w-0.5 h-8 mt-2
                      ${getStepConnectorColor(step.status)}
                    `} />
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>

                  {/* Action button for LyGOS payment step */}
                  {step.id === 'payment_link' &&
                    step.status === 'completed' &&
                    order.lygos_payment_url &&
                    onPaymentRedirect && (
                      <Button
                        onClick={onPaymentRedirect}
                        size="sm"
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Payer avec LyGOS
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}

                  {/* Afficher le lien de paiement LyGOS */}
                  {step.id === 'payment_link' &&
                    step.status === 'completed' &&
                    order.lygos_payment_url && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                        <p className="text-green-800 font-medium mb-1">Lien de paiement LyGOS :</p>
                        <a
                          href={order.lygos_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline break-all"
                        >
                          {order.lygos_payment_url}
                        </a>
                      </div>
                    )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error state */}
        {order.status === 'failed' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Échec du paiement
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Votre paiement n'a pas pu être traité. Veuillez réessayer avec LyGOS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success state */}
        {order.status === 'paid' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800">
                  Paiement confirmé !
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Votre paiement via LyGOS a été validé.
                  Votre commande est maintenant en cours de traitement.
                  Vous recevrez un email de confirmation sous peu.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
