'use client'


// =====================================================
// COMPOSANT DE DEBUG POUR LA SYNCHRONISATION SUPABASE
// =====================================================
// Affiche l'état de la synchronisation en temps réel
// À utiliser pendant le développement

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { Alert, AlertDescription } from '@/components/core/ui/alert'
import {
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSupabaseSync, useHasSupabaseData } from '@/lib/hooks/useSupabaseSync'
import { useAuth } from '@/lib/hooks/useAuth'

interface SupabaseSyncDebuggerProps {
  /**
   * Afficher le composant uniquement en développement
   */
  devOnly?: boolean

  /**
   * Position du composant (fixed ou relative)
   */
  position?: 'fixed' | 'relative'

  /**
   * Table à surveiller
   */
  table?: 'profiles' | 'digital_nfc_cards'
}

export function SupabaseSyncDebugger({
  devOnly = true,
  position = 'fixed',
  table = 'profiles'
}: SupabaseSyncDebuggerProps) {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [localStorageData, setLocalStorageData] = useState<{
    pending_profile_creation?: string
    pending_nfc_card_creation?: string
  }>({})

  const {
    isSyncing,
    isVerifying,
    syncError,
    verificationResult,
    sync,
    verify,
    testConnection,
    cleanup
  } = useSupabaseSync({
    table,
    showToasts: true
  })

  const hasProfiles = useHasSupabaseData('profiles')
  const hasNFCCards = useHasSupabaseData('digital_nfc_cards')

  // Masquer en production si devOnly = true
  useEffect(() => {
    if (devOnly && process.env.NODE_ENV === 'production') {
      setIsVisible(false)
    }
  }, [devOnly])

  // Lire le localStorage
  useEffect(() => {
    const readLocalStorage = () => {
      setLocalStorageData({
        pending_profile_creation: localStorage.getItem('pending_profile_creation') || undefined,
        pending_nfc_card_creation: localStorage.getItem('pending_nfc_card_creation') || undefined
      })
    }

    readLocalStorage()

    // Mettre à jour toutes les secondes
    const interval = setInterval(readLocalStorage, 1000)
    return () => clearInterval(interval)
  }, [])

  if (devOnly && process.env.NODE_ENV === 'production') {
    return null
  }

  const containerClasses = position === 'fixed'
    ? 'fixed bottom-4 right-4 w-96 z-50'
    : 'w-full max-w-2xl mx-auto'

  return (
    <div className={containerClasses}>
      {/* Toggle Button */}
      {position === 'fixed' && (
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className="mb-2 w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          {isVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {isVisible ? 'Masquer' : 'Debug Supabase'}
        </Button>
      )}

      {(isVisible || position === 'relative') && (
        <Card className="shadow-2xl border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5" />
              Supabase Sync Debugger
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Status Utilisateur */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilisateur:</span>
              {user ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connecté
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non connecté
                </Badge>
              )}
            </div>

            {user && (
              <p className="text-xs text-gray-600 truncate">
                {user.email}
              </p>
            )}

            {/* Données Supabase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profils:</span>
                {hasProfiles === null ? (
                  <Badge variant="outline">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Chargement...
                  </Badge>
                ) : hasProfiles ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Trouvés
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Aucun
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cartes NFC:</span>
                {hasNFCCards === null ? (
                  <Badge variant="outline">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Chargement...
                  </Badge>
                ) : hasNFCCards ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Trouvées
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Aucune
                  </Badge>
                )}
              </div>
            </div>

            {/* Résultat de vérification */}
            {verificationResult && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <strong>Dernière vérification:</strong>
                  <br />
                  {verificationResult.count} enregistrement(s) trouvé(s)
                </AlertDescription>
              </Alert>
            )}

            {/* LocalStorage */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">LocalStorage:</h4>

              <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">pending_profile_creation:</span>
                  <Badge variant={localStorageData.pending_profile_creation ? 'default' : 'outline'}>
                    {localStorageData.pending_profile_creation ? '✓' : '✗'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">pending_nfc_card_creation:</span>
                  <Badge variant={localStorageData.pending_nfc_card_creation ? 'default' : 'outline'}>
                    {localStorageData.pending_nfc_card_creation ? '✓' : '✗'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Erreurs */}
            {syncError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {syncError}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => sync()}
                disabled={isSyncing || !user}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync
              </Button>

              <Button
                onClick={() => verify(table)}
                disabled={isVerifying || !user}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Vérifier
              </Button>

              <Button
                onClick={testConnection}
                disabled={!user}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tester
              </Button>

              <Button
                onClick={cleanup}
                size="sm"
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Nettoyer
              </Button>
            </div>

            {/* Infos */}
            <p className="text-xs text-gray-500 text-center">
              🧪 Mode développement uniquement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
