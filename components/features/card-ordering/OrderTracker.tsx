'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreatePayment, usePaymentMethods } from '@/lib/hooks/usePayments'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Order } from '@/lib/types/payments'

interface OrderTrackerProps {
  order: Order
  onRefresh?: () => void
  className?: string
}

type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'processing'

interface TrackingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'completed' | 'current' | 'pending'
  date?: string
}

export function OrderTracker({ order, onRefresh, className }: OrderTrackerProps) {
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([])
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { uploadReceipt } = useCreatePayment()
  const { paymentMethods } = usePaymentMethods()

  useEffect(() => {
    updateTrackingSteps()
    calculateEstimatedDelivery()
  }, [order])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceiptFile(file)
      setReceiptPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadAndSubmitReceipt = async () => {
    if (!receiptFile) {
      toast.error('Veuillez sélectionner un fichier à uploader')
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `receipts/${user.id}/${order.id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, receiptFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: receiptFile.type
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      const submitResult = await uploadReceipt(order.id, publicUrl)

      if (submitResult.success) {
        toast.success('Preuve de paiement soumise avec succès !')
        onRefresh?.()
      } else {
        throw new Error(submitResult.error || 'Erreur de soumission')
      }

    } catch (err: any) {
      console.error('Error uploading receipt:', err)
      toast.error(`Échec de la soumission : ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const updateTrackingSteps = () => {
    const isPaid = order.status === 'paid' || order.payment_status === 'paid' || order.payment_status === 'succeeded'
    const isShipped = order.status === 'shipped' || order.shipping_status === 'shipped'
    const isDelivered = order.status === 'delivered' || order.shipping_status === 'delivered'
    const isPreparing = order.status === 'paid' && !isShipped // Par défaut, payé = production

    const steps: TrackingStep[] = [
      {
        id: 'order',
        title: 'Commande passée',
        description: 'Votre commande a été enregistrée',
        icon: Package,
        status: 'completed',
        date: new Date(order.created_at).toLocaleDateString('fr-FR')
      },
      {
        id: 'payment',
        title: 'Paiement confirmé',
        description: isPaid ? 'Votre paiement a été validé' : 'En attente de validation du paiement',
        icon: CheckCircle,
        status: isPaid ? 'completed' : 'current',
        date: order.paid_at ? new Date(order.paid_at).toLocaleDateString('fr-FR') : undefined
      },
      {
        id: 'production',
        title: 'En production',
        description: 'Votre carte est en cours de fabrication',
        icon: RefreshCw,
        status: isShipped || isDelivered ? 'completed' : (isPaid ? 'current' : 'pending'),
        date: isShipped || isDelivered ? (order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('fr-FR') : undefined) : undefined
      },
      {
        id: 'shipped',
        title: 'Expédiée',
        description: 'Votre carte a été expédiée',
        icon: Truck,
        status: isDelivered ? 'completed' : (isShipped ? 'current' : 'pending'),
        date: order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('fr-FR') : undefined
      },
      {
        id: 'delivered',
        title: 'Livrée',
        description: 'Votre carte a été livrée',
        icon: CheckCircle,
        status: isDelivered ? 'completed' : 'pending',
        date: order.delivered_at || order.actual_delivery ? new Date(order.delivered_at || order.actual_delivery!).toLocaleDateString('fr-FR') : undefined
      }
    ]

    setTrackingSteps(steps)
  }

  const calculateEstimatedDelivery = () => {
    if (order.status === 'paid') {
      const orderDate = new Date(order.created_at)
      const estimatedDate = new Date(orderDate.getTime() + (10 * 24 * 60 * 60 * 1000)) // +10 jours
      setEstimatedDelivery(estimatedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente de paiement'
      case 'paid':
        return 'Payée - En cours de traitement'
      case 'failed':
        return 'Échec du paiement'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête de commande */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Commande #{order.id.slice(-8)}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Commandée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type de carte</p>
              <p className="font-medium">
                {order.card_type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant</p>
              <p className="font-medium">{order.total_amount.toLocaleString()} XOF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantité</p>
              <p className="font-medium">{order.quantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suivi de commande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Suivi de votre commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const StepIcon = step.icon
              const isLast = index === trackingSteps.length - 1
              
              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        step.status === 'completed' || step.status === 'current'
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      {step.date && (
                        <span className="text-sm text-gray-500">{step.date}</span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      step.status === 'completed' || step.status === 'current'
                        ? 'text-gray-600' 
                        : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informations de livraison */}
      {order.status === 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informations de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Délai de livraison</h4>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>7-14 jours ouvrés</span>
                </div>
                {estimatedDelivery && (
                  <p className="text-sm text-gray-500 mt-1">
                    Livraison estimée : {estimatedDelivery}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href="mailto:support@ofika.app" className="hover:text-orange-600">
                      support@ofika.app
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+221 XX XXX XX XX</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {order.status === 'pending' && (
        <Card className="border-orange-200 bg-orange-50/10">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Paiement Wave Marchand Direct</h3>
              <p className="text-sm text-gray-600">
                Votre commande est en attente de paiement. Veuillez effectuer le règlement via Wave puis soumettre votre preuve de paiement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.open((order as any).wave_payment_url || (order as any).checkout_url, '_blank')}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold gap-2 px-6 py-4 rounded-xl shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Payer avec Wave
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Option A : Uploader le reçu */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">Option A : Uploader votre reçu</h4>
                  <p className="text-xs text-gray-500">Uploadez la capture d'écran du reçu Wave.</p>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-all">
                    <span className="text-xs font-semibold text-gray-600">Choisir une capture d'écran</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>

                  {receiptPreviewUrl && (
                    <div className="relative rounded overflow-hidden border border-gray-200 max-h-32">
                      <img src={receiptPreviewUrl} alt="Aperçu reçu" className="object-cover w-full h-full" />
                    </div>
                  )}

                  <Button
                    onClick={handleUploadAndSubmitReceipt}
                    disabled={!receiptFile || isUploading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2"
                  >
                    {isUploading ? 'Upload en cours...' : 'Soumettre le reçu'}
                  </Button>
                </div>
              </div>

              {/* Option B : WhatsApp */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">Option B : Envoyer par WhatsApp</h4>
                  <p className="text-xs text-gray-500">Envoyez le reçu directement à notre support.</p>
                </div>

                {(() => {
                  const waveMethod = paymentMethods.find(m => m.id === 'wave')
                  const whatsappNumber = (waveMethod as any)?.whatsapp_number || '+2250503681588'
                  const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '')
                  const whatsappPrefilledText = encodeURIComponent(
                    `Bonjour Ofika, voici le reçu de paiement de ma commande #${order.order_number || order.id}`
                  )
                  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${whatsappPrefilledText}`

                  return (
                    <Button
                      onClick={() => window.open(whatsappUrl, '_blank')}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 gap-2"
                    >
                      Envoyer par WhatsApp
                    </Button>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {((order.status as any) === 'processing' || (order.payment_status as any) === 'processing') && (
        <Card className="border-green-200 bg-green-50/20">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
              <h3 className="text-lg font-bold text-green-900">Vérification en cours</h3>
              <p className="text-sm text-green-800 max-w-md mx-auto">
                Votre reçu de paiement a été soumis avec succès et est en cours d'examen par notre équipe. 
                Votre commande sera traitée dès confirmation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
