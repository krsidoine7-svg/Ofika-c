// =====================================================
// HOOK REACT POUR SYNCHRONISATION & VÉRIFICATION SUPABASE
// =====================================================

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  verifySupabaseData,
  syncLocalStorageToSupabase,
  testSupabaseConnection,
  displayVerificationResult,
  cleanupOnboardingLocalStorage
} from '../services/supabase-sync-verifier'

interface UseSupabaseSyncOptions {
  /**
   * Exécuter la synchronisation automatiquement au montage
   */
  autoSync?: boolean
  
  /**
   * Exécuter la vérification automatiquement après la sync
   */
  autoVerify?: boolean
  
  /**
   * Table à vérifier ('profiles' ou 'digital_nfc_cards')
   */
  table?: 'profiles' | 'digital_nfc_cards'
  
  /**
   * Afficher les toasts de résultat
   */
  showToasts?: boolean
}

interface UseSupabaseSyncReturn {
  // États
  isSyncing: boolean
  isVerifying: boolean
  syncError: string | null
  verificationResult: {
    success: boolean
    count: number
    data?: any[]
  } | null
  
  // Actions
  sync: () => Promise<void>
  verify: (table: 'profiles' | 'digital_nfc_cards') => Promise<void>
  testConnection: () => Promise<void>
  cleanup: () => void
}

/**
 * Hook pour gérer la synchronisation et vérification des données Supabase
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isSyncing, sync, verify, verificationResult } = useSupabaseSync({
 *     autoSync: true,
 *     autoVerify: true,
 *     table: 'profiles',
 *     showToasts: true
 *   })
 *   
 *   return (
 *     <div>
 *       {isSyncing && <p>Synchronisation en cours...</p>}
 *       {verificationResult && (
 *         <p>✅ {verificationResult.count} enregistrements trouvés</p>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSupabaseSync(options: UseSupabaseSyncOptions = {}): UseSupabaseSyncReturn {
  const {
    autoSync = false,
    autoVerify = false,
    table = 'profiles',
    showToasts = true
  } = options
  
  const { user, loading: authLoading } = useAuth()
  
  const [isSyncing, setIsSyncing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    count: number
    data?: any[]
  } | null>(null)
  
  /**
   * Synchroniser les données localStorage → Supabase
   */
  const sync = useCallback(async () => {
    if (!user) {
      console.warn('⚠️ useSupabaseSync: Utilisateur non connecté')
      return
    }
    
    setIsSyncing(true)
    setSyncError(null)
    
    try {
      console.log('🔄 Synchronisation démarrée...')
      const result = await syncLocalStorageToSupabase()
      
      if (result.success) {
        console.log('✅ Synchronisation réussie:', result.syncedTables)
        
        // Si auto-vérification activée, vérifier après sync
        if (autoVerify && table) {
          await verify(table)
        }
      } else {
        setSyncError(result.error || 'Erreur de synchronisation')
        console.error('❌ Échec de synchronisation:', result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setSyncError(errorMessage)
      console.error('❌ Exception lors de la synchronisation:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [user, autoVerify, table])
  
  /**
   * Modifier de nfc_profiles vers digital_nfc_cards
   */
  const verify = useCallback(async (targetTable: 'profiles' | 'digital_nfc_cards') => {
    if (!user) {
      console.warn('⚠️ useSupabaseSync: Utilisateur non connecté')
      return
    }
    
    setIsVerifying(true)
    
    try {
      console.log(`🔍 Vérification de ${targetTable}...`)
      const result = await verifySupabaseData(targetTable, user.id)
      
      setVerificationResult({
        success: result.success,
        count: result.count,
        data: result.data
      })
      
      // Afficher un toast si activé
      if (showToasts) {
        displayVerificationResult(targetTable, result)
      }
      
      console.log(`✅ Vérification terminée: ${result.count} enregistrement(s)`)
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
    } finally {
      setIsVerifying(false)
    }
  }, [user, showToasts])
  
  /**
   * Tester la connexion Supabase
   */
  const testConnection = useCallback(async () => {
    console.log('🧪 Test de connexion Supabase...')
    const result = await testSupabaseConnection()
    
    if (result.isConnected) {
      console.log('✅ Connexion Supabase OK')
    } else {
      console.error('❌ Problème de connexion:', result.error)
    }
  }, [])
  
  /**
   * Nettoyer le localStorage
   */
  const cleanup = useCallback(() => {
    cleanupOnboardingLocalStorage()
  }, [])
  
  /**
   * Auto-sync au montage si l'option est activée
   */
  useEffect(() => {
    if (autoSync && user && !authLoading) {
      console.log('🔄 Auto-sync activé, démarrage...')
      sync()
    }
  }, [autoSync, user, authLoading, sync])
  
  return {
    // États
    isSyncing,
    isVerifying,
    syncError,
    verificationResult,
    
    // Actions
    sync,
    verify,
    testConnection,
    cleanup
  }
}

/**
 * Hook simplifié pour vérifier rapidement si des données existent
 * 
 * @example
 * ```tsx
 * function ProfileCheck() {
 *   const hasProfiles = useHasSupabaseData('profiles')
 *   
 *   return hasProfiles ? <p>✅ Profils trouvés</p> : <p>⚠️ Aucun profil</p>
 * }
 * ```
 */
export function useHasSupabaseData(
  table: 'profiles' | 'digital_nfc_cards'
): boolean | null {
  const { user } = useAuth()
  const [hasData, setHasData] = useState<boolean | null>(null)
  
  useEffect(() => {
    if (!user) {
      setHasData(null)
      return
    }
    
    verifySupabaseData(table, user.id).then(result => {
      setHasData(result.success && result.count > 0)
    })
  }, [user, table])
  
  return hasData
}
