// =====================================================
// HOOK POUR LES CARTES NFC
// =====================================================

import { useState, useEffect, useCallback } from 'react'
import { NFCCard, CreateNFCCardData, UpdateNFCCardData } from '@/lib/types/nfc-cards'
import { 
  getNFCCards, 
  getNFCCard, 
  createNFCCard, 
  updateNFCCard, 
  deleteNFCCard 
} from '@/lib/services/nfc-cards'
import { useProfiles } from './useProfiles'
import { useOrderStats } from './usePayments'
import { useAuth } from './useAuth'

export function useNFCCards(userId?: string) {
  const { user } = useAuth()
  const [cards, setCards] = useState<NFCCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les cartes NFC
  const loadCards = useCallback(async () => {
    // Ne pas charger si l'utilisateur n'est pas encore là
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await getNFCCards(userId)
      
      if (response.success && response.data) {
        setCards(response.data)
      } else {
        // Ne pas afficher d'erreur si c'est juste une question d'auth pas encore prête
        if (response.error !== 'Utilisateur non authentifié') {
          setError(response.error || 'Erreur lors du chargement des cartes')
        }
      }
    } catch (err) {
      console.error('Error loading NFC cards:', err)
      setError('Erreur lors du chargement des cartes NFC')
    } finally {
      setLoading(false)
    }
  }, [user, userId])

  // Charger les cartes au montage du composant et quand l'utilisateur ou l'ID cible change
  useEffect(() => {
    loadCards()
  }, [loadCards])

  // Créer une nouvelle carte NFC
  const createCard = useCallback(async (cardData: CreateNFCCardData): Promise<{ success: boolean; data?: NFCCard; error?: string }> => {
    try {
      setError(null)
      
      const response = await createNFCCard(cardData)
      
      if (response.success && response.data) {
        setCards(prev => [response.data!, ...prev])
        return { success: true, data: response.data }
      } else {
        const errorMsg = response.error || 'Erreur lors de la création de la carte'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (err) {
      console.error('Error creating NFC card:', err)
      const errorMsg = 'Erreur lors de la création de la carte NFC'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  // Mettre à jour une carte NFC
  const updateCard = useCallback(async (cardId: string, updateData: UpdateNFCCardData): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await updateNFCCard(cardId, updateData)
      
      if (response.success && response.data) {
        setCards(prev => 
          prev.map(card => 
            card.id === cardId ? response.data! : card
          )
        )
        return true
      } else {
        setError(response.error || 'Erreur lors de la mise à jour de la carte')
        return false
      }
    } catch (err) {
      console.error('Error updating NFC card:', err)
      setError('Erreur lors de la mise à jour de la carte NFC')
      return false
    }
  }, [])

  // Supprimer une carte NFC
  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await deleteNFCCard(cardId)
      
      if (response.success) {
        setCards(prev => prev.filter(card => card.id !== cardId))
        return true
      } else {
        setError(response.error || 'Erreur lors de la suppression de la carte')
        return false
      }
    } catch (err) {
      console.error('Error deleting NFC card:', err)
      setError('Erreur lors de la suppression de la carte NFC')
      return false
    }
  }, [])

  // Recharger les cartes
  const refreshCards = useCallback(() => {
    loadCards()
  }, [loadCards])

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    refreshCards
  }
}

// Hook pour une carte NFC spécifique
export function useNFCCard(cardId: string) {
  const [card, setCard] = useState<NFCCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cardId) return

    const loadCard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getNFCCard(cardId)
        
        if (response.success && response.data) {
          setCard(response.data)
        } else {
          setError(response.error || 'Erreur lors du chargement de la carte')
        }
      } catch (err) {
        console.error('Error loading NFC card:', err)
        setError('Erreur lors du chargement de la carte NFC')
      } finally {
        setLoading(false)
      }
    }

    loadCard()
  }, [cardId])

  return {
    card,
    loading,
    error
  }
}

// =====================================================
// HOOK POUR LA LOGIQUE COHÉRENTE DES CARTES
// =====================================================

export interface UserCardStatus {
  hasProfile: boolean
  hasDigitalCards: boolean
  canCreateDigital: boolean
  canOrderPhysical: boolean
  digitalCardsCount: number
  physicalOrdersCount: number
  nextRequiredAction: 'create_profile' | 'create_digital_card' | 'can_order_physical' | 'all_complete'
  blockingMessage?: string
}

export function useCardLogic() {
  const { profiles, loading: profilesLoading } = useProfiles()
  const { cards, loading: cardsLoading } = useNFCCards()
  const { stats, loading: statsLoading } = useOrderStats()
  
  const [status, setStatus] = useState<UserCardStatus>({
    hasProfile: false,
    hasDigitalCards: false,
    canCreateDigital: false,
    canOrderPhysical: false,
    digitalCardsCount: 0,
    physicalOrdersCount: 0,
    nextRequiredAction: 'create_profile'
  })
  
  const [loading, setLoading] = useState(true)

  // Calculer le statut utilisateur
  useEffect(() => {
    if (profilesLoading || cardsLoading || statsLoading) {
      setLoading(true)
      return
    }

    const hasProfile = profiles && profiles.length > 0
    const hasDigitalCards = cards && cards.length > 0
    const digitalCardsCount = cards?.length || 0
    const physicalOrdersCount = stats?.paid_orders || 0
    
    const canCreateDigital = digitalCardsCount < 2
    const canOrderPhysical = hasProfile && hasDigitalCards && physicalOrdersCount < 2

    let nextRequiredAction: UserCardStatus['nextRequiredAction'] = 'all_complete'
    let blockingMessage: string | undefined

    if (!hasProfile && !hasDigitalCards) {
      nextRequiredAction = 'create_profile'
      blockingMessage = 'Créez votre profil professionnel ou votre carte numérique'
    } else if (!hasProfile && hasDigitalCards) {
      nextRequiredAction = 'create_profile'
      blockingMessage = 'Créez votre profil professionnel pour commander une carte physique'
    } else if (hasProfile && !hasDigitalCards) {
      nextRequiredAction = 'create_digital_card'
      blockingMessage = 'Créez d\'abord votre carte numérique avant de commander'
    } else if (canOrderPhysical) {
      nextRequiredAction = 'can_order_physical'
    } else {
      blockingMessage = 'Vous avez atteint la limite de commandes (2 max)'
    }

    setStatus({
      hasProfile,
      hasDigitalCards,
      canCreateDigital,
      canOrderPhysical,
      digitalCardsCount,
      physicalOrdersCount,
      nextRequiredAction,
      blockingMessage
    })

    setLoading(false)
  }, [
    profiles?.length, 
    cards?.length, 
    stats?.paid_orders, 
    profilesLoading, 
    cardsLoading, 
    statsLoading
  ])

  // Actions intelligentes
  const handleCreateProfile = useCallback(() => {
    return '/dashboard/profiles/new'
  }, [])

  const handleCreateDigitalCard = useCallback(() => {
    return '/onboarding/nfc-card'
  }, [])

  const handleOrderPhysicalCard = useCallback(() => {
    if (!status.hasProfile) {
      return { redirect: '/dashboard/profiles/new', message: 'Créez d\'abord votre profil pour commander' }
    }
    if (!status.hasDigitalCards) {
      return { redirect: '/onboarding/nfc-card', message: 'Créez d\'abord votre carte numérique' }
    }
    if (!status.canOrderPhysical) {
      return { redirect: null, message: 'Limite de commandes atteinte (2 max)' }
    }
    return { redirect: '/onboarding/card-order', message: null }
  }, [status])

  const getActionMessage = useCallback((action: 'profile' | 'digital' | 'physical') => {
    switch (action) {
      case 'profile':
        return !status.hasProfile 
          ? 'Créer mon profil professionnel' 
          : 'Modifier mon profil'
      case 'digital':
        return !status.hasDigitalCards 
          ? 'Créer ma première carte numérique' 
          : status.canCreateDigital 
            ? 'Créer une nouvelle carte numérique'
            : 'Limite de cartes atteinte (2 max)'
      case 'physical':
        return status.canOrderPhysical 
          ? 'Commander ma carte physique'
          : status.blockingMessage || 'Action non disponible'
      default:
        return ''
    }
  }, [status])

  return {
    status,
    loading,
    actions: {
      handleCreateProfile,
      handleCreateDigitalCard,
      handleOrderPhysicalCard
    },
    helpers: {
      getActionMessage
    }
  }
}