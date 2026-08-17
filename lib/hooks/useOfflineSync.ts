'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  getPendingMutations,
  removePendingMutation,
  getPendingBlob,
  removePendingBlob,
  PendingMutation
} from '@/lib/offline/offlineStore'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Mettre à jour le nombre de mutations en attente
  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await getPendingMutations()
      setPendingCount(pending.length)
    } catch (err) {
      console.warn('[useOfflineSync] Erreur lecture pending count:', err)
    }
  }, [])

  // Exécution de la synchronisation de toutes les mutations
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return

    try {
      setIsSyncing(true)
      const mutations = await getPendingMutations()
      if (mutations.length === 0) {
        setIsSyncing(false)
        return
      }

      toast.info(`Synchronisation de ${mutations.length} modification(s) en cours...`)
      const supabase = createClient()
      let successCount = 0

      for (const m of mutations) {
        try {
          // Gestion des images/médias associés s'il y en a
          if (m.blobId) {
            const pendingBlob = await getPendingBlob(m.blobId)
            if (pendingBlob) {
              const fileExt = pendingBlob.fileName.split('.').pop() || 'png'
              const filePath = `offline-sync/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
              
              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(filePath, pendingBlob.blob, {
                  contentType: pendingBlob.mimeType,
                  upsert: true
                })

              if (!uploadErr && uploadData) {
                const { data: publicUrlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(uploadData.path)

                if (publicUrlData?.publicUrl) {
                  m.data.avatar_url = publicUrlData.publicUrl
                }
              }
              await removePendingBlob(m.blobId)
            }
          }

          // Traitement de l'entité
          if (m.entity === 'profiles') {
            if (m.type === 'CREATE_PROFILE' || m.type === 'UPDATE_PROFILE') {
              const { error } = await supabase
                .from('profiles')
                .upsert(m.data, { onConflict: 'id' })

              if (error) throw error
            } else if (m.type === 'DELETE_PROFILE') {
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', m.data.id)

              if (error) throw error
            }
          } else if (m.entity === 'reviews') {
            if (m.type === 'ADD_REVIEW') {
              const { error } = await supabase
                .from('reviews')
                .insert(m.data)

              if (error) throw error
            }
          }

          // Si la mutation s'est bien déroulée, on la retire de IndexedDB
          if (m.id) {
            await removePendingMutation(m.id)
            successCount++
          }
        } catch (mErr) {
          console.error(`[useOfflineSync] Erreur lors de la synchro mutation ${m.id}:`, mErr)
        }
      }

      await refreshPendingCount()

      if (successCount > 0) {
        toast.success(`${successCount} modification(s) synchronisée(s) avec succès !`)
      }
    } catch (err) {
      console.error('[useOfflineSync] Erreur globale de synchronisation:', err)
      toast.error('Erreur lors de la synchronisation automatique.')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, refreshPendingCount])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connexion Internet rétablie !')
      syncNow()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('Mode Hors-Ligne activé.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    refreshPendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncNow, refreshPendingCount])

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
    refreshPendingCount
  }
}
