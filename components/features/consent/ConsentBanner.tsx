'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Mail, Database, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConsentData {
  essential: boolean
  analytics: boolean
  marketing: boolean
  dataProcessing: boolean
  acceptTerms: boolean
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
    dataProcessing: true, // Toujours vrai pour la création de carte
    acceptTerms: false,
    ...initialConsent
  })

  const [showFullDetails, setShowFullDetails] = useState(showDetails)

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    const newConsent = { ...consent, [key]: value }
    setConsent(newConsent)
    onConsentChange(newConsent)
  }

  const isConsentValid = required ? consent.acceptTerms : true

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

        {/* Conditions et Politique de Confidentialité */}
        <div className={cn(
          "flex items-start space-x-3 p-3 rounded-lg border",
          required && !consent.acceptTerms
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        )}>
          <Checkbox
            id="acceptTerms"
            checked={consent.acceptTerms}
            onCheckedChange={(checked) => handleConsentChange('acceptTerms', checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="acceptTerms" className={cn(
              "text-sm font-semibold cursor-pointer",
              required && !consent.acceptTerms ? 'text-red-800' : 'text-gray-800'
            )}>
              Conditions générales et Confidentialité <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              J'ai lu et j'accepte les{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                Conditions d'Utilisation
              </a>{' '}
              et la{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                Politique de Confidentialité
              </a>{' '}
              de la plateforme.
            </p>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              <strong>Garantie de confidentialité :</strong> Vos données ne sont pas vendues à des tiers et sont utilisées uniquement dans le cadre des fonctionnalités de l'application (carte NFC et compte utilisateur).
            </p>
            {required && !consent.acceptTerms && (
              <span className="block mt-1 text-xs font-semibold text-red-700">Vous devez accepter les conditions pour continuer</span>
            )}
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
              Vous devez accepter les conditions générales et la politique de confidentialité pour continuer.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
