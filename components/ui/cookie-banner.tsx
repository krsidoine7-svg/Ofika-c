'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const COOKIE_CONSENT_KEY = 'ofika_cookie_consent'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const notifyConsentChange = (status: string) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status)
    window.dispatchEvent(new CustomEvent('ofika_consent_update', { detail: status }))
    setIsVisible(false)
  }

  const acceptAll = () => notifyConsentChange('accepted')
  const declineAll = () => notifyConsentChange('declined')
  const savePreferences = () => notifyConsentChange(analyticsEnabled ? 'accepted' : 'declined')

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:p-6 animate-in slide-in-from-bottom-5">
      {!showPreferences ? (
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Cookies & Personnalisation
            </h3>
            <p className="text-xs text-gray-500">
              Nous utilisons des cookies pour améliorer votre expérience.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPreferences(true)} className="text-xs text-gray-500 hover:text-gray-900">
              Préférences
            </Button>
            <Button variant="outline" size="sm" onClick={declineAll} className="text-xs">
              Tout refuser
            </Button>
            <Button size="sm" onClick={acceptAll} className="text-xs bg-black text-white hover:bg-gray-800">
              Tout accepter
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Préférences de confidentialité
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Nous utilisons des cookies et récupérons votre adresse IP pour des statistiques de visite anonymes afin d'améliorer l'expérience sur ce profil (Analytiques RGPD). Vous pouvez personnaliser ces options ci-dessous.
            </p>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Cookies essentiels</Label>
                  <p className="text-xs text-gray-500">Requis pour le fonctionnement du site.</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Statistiques & Analytiques</Label>
                  <p className="text-xs text-gray-500">Pour compter les visites et les clics.</p>
                </div>
                <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreferences(false)} className="text-xs">
              Retour
            </Button>
            <Button size="sm" onClick={savePreferences} className="text-xs bg-black text-white hover:bg-gray-800">
              Enregistrer mes choix
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
