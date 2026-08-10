'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Order } from '@/lib/types/payments'

interface ProcessOrderResult {
  success: boolean
  error?: string
  order?: Order | null
  paymentUrl?: string | null
}

// Types de paiement
export interface PaymentMethod {
  id: string
  name: string
  provider: 'lygos' | 'wave'
  is_active: boolean
  icon_url?: string
  description?: string
  fees?: number
  currency: string
  min_amount?: number
  max_amount?: number
  countries?: string[]
}

export interface PaymentData {
  amount: number
  currency: string
  description: string
  order_id?: string
  customer_email?: string
  customer_name?: string
  success_url?: string
  cancel_url?: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  payment_id?: string
  payment_url?: string
  error?: string
  data?: any
}

// Sélecteur de méthode de paiement
export function PaymentMethodSelector({
  paymentMethods,
  selectedMethod,
  onSelect,
  amount,
  currency = 'XOF',
  showFees = true
}: {
  paymentMethods: PaymentMethod[]
  selectedMethod?: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  amount: number
  currency?: string
  showFees?: boolean
}) {
  // Ce composant est défini dans PaymentButton.tsx
  return null
}

// Hook pour récupérer les méthodes de paiement disponibles
export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [basePrice, setBasePrice] = useState<number>(14600)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/payments/methods')

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des méthodes de paiement')
        }

        const data = await response.json()
        setPaymentMethods(data.methods || [])
        if (data.methods?.[0]?.base_price) {
          setBasePrice(data.methods[0].base_price)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        console.error('Erreur chargement méthodes de paiement:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  return { paymentMethods, basePrice, loading, error }
}

// Hook pour créer un paiement
export function useCreatePayment() {
  const [isProcessing, setIsProcessing] = useState(false)

  const createPayment = async (
    provider: 'lygos' | 'wave',
    paymentData: PaymentData
  ): Promise<PaymentResult> => {
    setIsProcessing(true)

    try {
      const endpoint = `/api/payments/${provider}/create`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du paiement')
      }

      if (result.success && result.data?.link) {
        // Rediriger automatiquement vers la page de paiement
        window.location.href = result.data.link
        return result
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur création paiement:', error)
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }

  const uploadReceipt = async (orderId: string, receiptUrl: string): Promise<PaymentResult> => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/orders/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, receipt_url: receiptUrl })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la soumission du reçu')
      }
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }

  return { createPayment, uploadReceipt, isProcessing }
}

// Hook pour vérifier le statut d'un paiement
export function usePaymentStatus(paymentId: string, provider: 'lygos' | 'wave') {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    if (!paymentId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/payments/${provider}/status/${paymentId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setStatus(result.data.status)
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (paymentId) {
      checkStatus()
      // Vérifier le statut toutes les 5 secondes
      const interval = setInterval(checkStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [paymentId])

  return { status, loading, checkStatus }
}

// Hook pour gérer les abonnements/premium
export function useSubscription() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/current')
        const data = await response.json()

        if (data.success) {
          setSubscription(data.subscription)
        }
      } catch (error) {
        console.error('Erreur chargement abonnement:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const upgradeToPremium = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId })
      })

      const result = await response.json()

      if (result.success && result.data?.link) {
        window.location.href = result.data.link
      } else {
        toast.error(result.error || 'Erreur lors de la mise à niveau')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à niveau')
      console.error('Erreur upgrade:', error)
    }
  }

  return { subscription, loading, upgradeToPremium }
}

// Hooks pour les commandes
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders/create')
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders || [])
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des commandes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur useOrders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return { orders, loading, error, refreshOrders: fetchOrders }
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!orderId) return
    try {
      setLoading(true)
      // On utilise le endpoint de liste et on filtre ou on crée un endpoint dédié
      const response = await fetch('/api/orders/create')
      const data = await response.json()

      if (data.success) {
        const foundOrder = data.orders.find((o: any) => o.id === orderId)
        setOrder(foundOrder || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  return { order, loading, error, refreshOrder: fetchOrder }
}

export function useOrderStats() {
  const { orders, loading, error, refreshOrders } = useOrders()
  const [stats, setStats] = useState({
    total_spent: 0,
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    paid_orders: 0
  })

  useEffect(() => {
    if (orders && orders.length > 0) {
      const total_spent = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0)
      const total_orders = orders.length
      const pending_orders = orders.filter(o => o.status === 'pending').length
      const paid_orders = orders.filter(o => o.status === 'paid').length
      const completed_orders = orders.filter(o => o.status === 'delivered').length

      setStats({
        total_spent,
        total_orders,
        pending_orders,
        completed_orders,
        paid_orders
      })
    } else {
      setStats({
        total_spent: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        paid_orders: 0
      })
    }
  }, [orders])

  return {
    stats,
    loading,
    error,
    refreshStats: refreshOrders
  }
}

export function useOrderProcess() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const processOrder = async (orderData: any): Promise<ProcessOrderResult> => {
    setIsProcessing(true)
    setError(null)
    setPaymentUrl(null)

    try {
      // 1. Créer la commande
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la création de la commande')
      }

      const order = data.order
      const paymentMethod = orderData.payment_method || 'lygos'
      
      // Déterminer le provider (en attendant que l'API le retourne ou gère tout)
      // Pour l'instant on garde la logique : lygos -> lygos, wave -> wave
      const provider = paymentMethod === 'wave' ? 'wave' : 'lygos'

      // 2. Créer le paiement
      const paymentResponse = await fetch(`/api/payments/${provider}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.order.amount_cents, // Utiliser le montant de la commande
          order_id: order.id,
          message: `Commande #${order.order_number}`
        })
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(paymentData.error || 'Erreur lors de la création du paiement')
      }

      const url = paymentData.data?.link
      setPaymentUrl(url)

      return {
        success: true,
        order,
        paymentUrl: url
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
      return { success: false, error: message, order: null, paymentUrl: null }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processOrder,
    isProcessing,
    error,
    paymentUrl,
    currentStep: isProcessing ? 'processing' : 'idle',
    steps: []
  }
}

// Utilitaires de paiement
export const PaymentUtils = {
  // Formater le montant selon la devise
  formatAmount: (amount: number, currency: string = 'XOF'): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  },

  // Calculer les frais de transaction
  calculateFees: (amount: number, feePercentage: number = 0.029): number => {
    return Math.round(amount * feePercentage * 100) / 100
  },

  // Valider un montant
  validateAmount: (amount: number, min: number = 100, max: number = 1000000): boolean => {
    return amount >= min && amount <= max && Number.isFinite(amount)
  },

  // Générer un ID de commande unique
  generateOrderId: (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `order_${timestamp}_${random}`
  }
}

// Types d'abonnement disponibles
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'XOF',
    interval: 'forever',
    features: [
      'Page perso avec votre URL',
      '2 Designs de page',
      'Création de 1 carte NFC virtuelle',
      '7 QR Statiques / 2 Dynamiques',
      '2 Liens d\'avis (Max 50 avis)',
      'Analytics (15 jours)'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    currency: 'XOF',
    interval: 'month',
    features: [
      'Tout du plan Gratuit +',
      '7 QR Codes dynamiques',
      '8 Designs Premium',
      '3 Pages Link-in-Bio (Liens illimités)',
      'Avis Clients illimités + Anti-Fake',
      '20 Liens d\'avis clients',
      'Statistiques avancées (90 jours)',
      'Géolocalisation des scans',
      'Création de 3 cartes NFC virtuelles',
      '50 envois d\'e-mails par mois',
      'Carte NFC physique (payant)'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 3000,
    currency: 'XOF',
    interval: 'month',
    features: [
      'Tout du plan Pro +',
      'Vendre produits numériques illimités',
      'Paiement direct sur votre page',
      'Domaine personnalisé dans la bio',
      'URL des produits de la boutique',
      'Création de liens d\'affiliation',
      'Pages Link-in-Bio illimitées',
      'Cartes NFC virtuelles illimitées',
      'Marque Blanche (White Label)',
      'Statistiques à vie + Export CSV',
      'Support Dédié'
    ]
  }
}