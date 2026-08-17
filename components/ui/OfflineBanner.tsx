'use client'

import React from 'react'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useOfflineSync } from '@/lib/hooks/useOfflineSync'

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync()

  // Si on est en ligne ET sans aucune modification en attente, ne rien afficher
  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className={`w-full py-2.5 px-4 text-xs md:text-sm font-medium transition-all duration-300 shadow-md ${
      !isOnline 
        ? 'bg-amber-600 text-white dark:bg-amber-700' 
        : 'bg-emerald-600 text-white dark:bg-emerald-700'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                <strong>Mode Hors-Ligne</strong> — Vous pouvez continuer d&apos;utiliser Ofika. Vos modifications sont sauvegardées en local.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Réseau rétabli</strong> — {pendingCount} modification(s) en attente de synchronisation.
              </span>
            </>
          )}

          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-white text-xs font-semibold">
              {pendingCount} en attente
            </span>
          )}
        </div>

        {pendingCount > 0 && isOnline && (
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </button>
        )}
      </div>
    </div>
  )
}
