'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConsentBanner, ConsentData } from '@/components/features/consent/ConsentBanner'
import { useConsent } from '@/lib/hooks/useConsent'
import { useAuth } from '@/lib/hooks/useAuth'
import { Shield, CheckCircle, AlertCircle, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/core/auth/ProtectedRoute'

export default function ConsentManagementPage() {
  const { user } = useAuth()
  const { consent, loading, error, updateConsent, refreshConsent } = useConsent()
  const [localConsent, setLocalConsent] = useState<ConsentData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialiser le consentement local
  useEffect(() => {
    if (consent) {
      setLocalConsent(consent)
    }
  }, [consent])

  const handleConsentChange = (newConsent: ConsentData) => {
    setLocalConsent(newConsent)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!localConsent) return

    setIsSaving(true)
    try {
      const result = await updateConsent(localConsent)
      
      if (result.success) {
        setHasChanges(false)
        toast.success('Vos préférences de consentement ont été mises à jour')
        await refreshConsent()
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (consent) {
      setLocalConsent(consent)
      setHasChanges(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erreur lors du chargement de vos préférences : {error}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion de vos données
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Contrôlez comment nous utilisons vos données personnelles. 
                Vous pouvez modifier vos préférences à tout moment.
              </p>
            </div>

            {/* Statut actuel */}
            {consent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Statut actuel de vos consentements
                  </CardTitle>
                  <CardDescription>
                    Dernière mise à jour : {new Date(consent.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Données essentielles</span>
                      <span className="text-green-600 font-semibold">
                        {consent.essential ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Traitement carte NFC</span>
                      <span className={`font-semibold ${consent.dataProcessing ? 'text-blue-600' : 'text-gray-500'}`}>
                        {consent.dataProcessing ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">Analytics</span>
                      <span className={`font-semibold ${consent.analytics ? 'text-green-600' : 'text-gray-500'}`}>
                        {consent.analytics ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">Marketing</span>
                      <span className={`font-semibold ${consent.marketing ? 'text-green-600' : 'text-gray-500'}`}>
                        {consent.marketing ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modification des consentements */}
            {localConsent && (
              <Card>
                <CardHeader>
                  <CardTitle>Modifier vos préférences</CardTitle>
                  <CardDescription>
                    Cochez ou décochez les options selon vos préférences. 
                    Les données essentielles sont obligatoires pour utiliser le service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsentBanner
                    onConsentChange={handleConsentChange}
                    initialConsent={localConsent}
                    showDetails={true}
                    className="mb-6"
                  />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges || isSaving}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving || !localConsent.essential || !localConsent.dataProcessing}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>

                  {hasChanges && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Vous avez des modifications non sauvegardées. 
                        N'oubliez pas de sauvegarder vos changements.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informations légales */}
            <Card>
              <CardHeader>
                <CardTitle>Vos droits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez demander une copie de toutes les données que nous avons sur vous.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez corriger ou mettre à jour vos informations personnelles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez demander la suppression de vos données personnelles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Droit de portabilité</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez exporter vos données dans un format lisible par machine.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Contact :</strong> Pour exercer vos droits ou pour toute question sur la protection de vos données, 
                    contactez-nous à <a href="mailto:privacy@ofika.app" className="text-blue-600 hover:underline">privacy@ofika.app</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
