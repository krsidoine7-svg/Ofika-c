'use client'

import { useState } from 'react'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Checkbox } from '@/components/core/ui/checkbox'
import { Label } from '@/components/core/ui/label'
import { Alert, AlertDescription } from '@/components/core/ui/alert'
import { Shield, Mail, Database, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConsentData {
  essential: boolean
  analytics: boolean
  marketing: boolean
  dataProcessing: boolean
}

interface ConsentBannerProps {
  onConsentChange: (consent: ConsentData) => void
  initialConsent?: Partial<ConsentData>
  className?: string
  showDetails?: boolean
  required?: boolean
}

export function ConsentBanner({
  onConsentChange,
  initialConsent = {},
  className,
  showDetails = false,
  required = false
}: ConsentBannerProps) {
  const [consent, setConsent] = useState<ConsentData>({
    essential: true, // Toujours requis
    analytics: false,
    marketing: false,
    dataProcessing: false,
    ...initialConsent
  })

  const [showFullDetails, setShowFullDetails] = useState(showDetails)

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    const newConsent = { ...consent, [key]: value }
    setConsent(newConsent)
    onConsentChange(newConsent)
  }

  const isConsentValid = required ? consent.essential && consent.dataProcessing : true

  return (
    <Card className={cn("border-2", className, !isConsentValid && "border-red-200 bg-red-50")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          Consentement pour le traitement des données
        </CardTitle>
        <CardDescription>
          Nous respectons votre vie privée. Choisissez ce que vous acceptez :
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consentement groupé (Essentiel + Carte NFC) */}
        <div className={`flex items-start space-x-3 p-3 rounded-lg border ${required && !consent.dataProcessing
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
          }`}>
          <Checkbox
            id="mandatoryConsent"
            checked={consent.dataProcessing}
            onCheckedChange={(checked) => handleConsentChange('dataProcessing', checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="mandatoryConsent" className={`text-sm font-medium cursor-pointer ${required && !consent.dataProcessing
              ? 'text-red-800'
              : 'text-blue-800'
              }`}>
              <Shield className="inline h-4 w-4 mr-1" />
              Données essentielles et traitement de votre carte NFC <span className="text-red-500">*</span>
            </Label>
            <div className={`text-xs mt-2 space-y-2 ${required && !consent.dataProcessing
              ? 'text-red-700'
              : 'text-blue-700'
              }`}>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <p><strong>Compte :</strong> Email, nom et mot de passe pour l'accès à votre espace.</p>
              </div>
              <div className="flex items-start gap-2">
                <Database className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <p><strong>Carte NFC :</strong> Stockage des informations visibles sur votre carte (nom, entreprise, contacts).</p>
              </div>
              {required && !consent.dataProcessing && (
                <span className="block mt-1 font-medium">⚠️ Obligatoire pour finaliser votre commande</span>
              )}
            </div>
          </div>
        </div>

        {/* Consentement analytics */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id="analytics"
            checked={consent.analytics}
            onCheckedChange={(checked) => handleConsentChange('analytics', checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="analytics" className="text-sm font-medium text-gray-800 cursor-pointer">
              <Eye className="inline h-4 w-4 mr-1" />
              Analytics et statistiques (optionnel)
            </Label>
            <p className="text-xs text-gray-700 mt-1">
              Collecte de données anonymisées pour améliorer nos services
            </p>
          </div>
        </div>

        {/* Consentement marketing */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id="marketing"
            checked={consent.marketing}
            onCheckedChange={(checked) => handleConsentChange('marketing', checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="marketing" className="text-sm font-medium text-gray-800 cursor-pointer">
              <Mail className="inline h-4 w-4 mr-1" />
              Communications marketing (optionnel)
            </Label>
            <p className="text-xs text-gray-700 mt-1">
              Recevoir des emails sur nos nouveaux produits et fonctionnalités
            </p>
          </div>
        </div>

        {/* Bouton pour voir plus de détails */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="w-full text-xs"
        >
          {showFullDetails ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {showFullDetails ? 'Masquer les détails' : 'Voir les détails complets'}
        </Button>

        {/* Détails complets */}
        {showFullDetails && (
          <div className="space-y-3 pt-4 border-t">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Vos droits :</strong> Vous pouvez retirer votre consentement à tout moment.
                Vos données sont stockées de manière sécurisée et ne sont jamais vendues à des tiers.
              </AlertDescription>
            </Alert>


          </div>
        )}

        {/* Message d'erreur si requis */}
        {required && !isConsentValid && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez accepter le traitement des données essentielles et de votre carte NFC pour continuer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
