'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Crown,
  Check,
  Star,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useSubscription, SUBSCRIPTION_PLANS, PaymentUtils } from '@/lib/hooks/usePayments'
import { toast } from 'sonner'

export default function SubscriptionPage() {
  const { subscription, loading, upgradeToPremium } = useSubscription()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId)

    try {
      await upgradeToPremium(planId)
      // La redirection se fait automatiquement dans le hook
    } catch (error) {
      console.error('Erreur mise à niveau:', error)
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement de vos abonnements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choisissez votre abonnement
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Débloquez tout le potentiel d'Ofika avec nos plans premium.
              Profils illimités, analyses avancées et support prioritaire.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Abonnement actuel */}
        {subscription && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span>Votre abonnement actuel</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{subscription.name}</h3>
                    <p className="text-gray-600">{subscription.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {subscription.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {subscription.price === 0 ? 'Gratuit' : `${PaymentUtils.formatAmount(subscription.price, subscription.currency)}`}
                    </div>
                    {subscription.interval && (
                      <div className="text-sm text-gray-600">par {subscription.interval}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans disponibles */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan Gratuit */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">{SUBSCRIPTION_PLANS.FREE.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                Gratuit
              </div>
              <p className="text-gray-600 mt-1">Pour découvrir Ofika</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.FREE.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant="outline"
                disabled={subscription?.plan_id === 'free'}
              >
                {subscription?.plan_id === 'free' ? 'Plan actuel' : 'Continuer gratuit'}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Premium - Recommandé */}
          <Card className="relative border-2 border-blue-500 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Recommandé
              </Badge>
            </div>

            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-600">{SUBSCRIPTION_PLANS.PREMIUM.name}</CardTitle>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {PaymentUtils.formatAmount(SUBSCRIPTION_PLANS.PREMIUM.price, SUBSCRIPTION_PLANS.PREMIUM.currency)}
              </div>
              <p className="text-gray-600 mt-1">par {SUBSCRIPTION_PLANS.PREMIUM.interval}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleUpgrade('premium')}
                disabled={upgrading === 'premium' || subscription?.plan_id === 'premium'}
              >
                {upgrading === 'premium' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : subscription?.plan_id === 'premium' ? (
                  'Plan actuel'
                ) : (
                  <>
                    Passer Premium
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Business */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-600">{SUBSCRIPTION_PLANS.BUSINESS.name}</CardTitle>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {PaymentUtils.formatAmount(SUBSCRIPTION_PLANS.BUSINESS.price, SUBSCRIPTION_PLANS.BUSINESS.currency)}
              </div>
              <p className="text-gray-600 mt-1">par {SUBSCRIPTION_PLANS.BUSINESS.interval}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {SUBSCRIPTION_PLANS.BUSINESS.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleUpgrade('business')}
                disabled={upgrading === 'business' || subscription?.plan_id === 'business'}
              >
                {upgrading === 'business' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : subscription?.plan_id === 'business' ? (
                  'Plan actuel'
                ) : (
                  <>
                    Passer Business
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fonctionnalités détaillées */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Analytics avancés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Suivez les performances de vos profils avec des métriques détaillées :
                vues, clics, conversions et géolocalisation des visiteurs.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Tableaux de bord en temps réel</li>
                <li>• Rapports hebdomadaires par email</li>
                <li>• Analyse des sources de trafic</li>
                <li>• Export des données</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Headphones className="h-5 w-5 text-green-600" />
                <span>Support prioritaire</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Bénéficiez d'une assistance dédiée pour maximiser votre présence en ligne.
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Support par chat 24/7</li>
                <li>• Conseiller personnel dédié</li>
                <li>• Formation personnalisée</li>
                <li>• Accès anticipé aux nouvelles fonctionnalités</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h4>
                <p className="text-gray-600 text-sm">
                  Oui, vous pouvez mettre à niveau ou rétrograder votre abonnement à tout moment.
                  Les changements prennent effet immédiatement.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Comment fonctionne la facturation ?</h4>
                <p className="text-gray-600 text-sm">
                  La facturation est mensuelle et renouvelée automatiquement.
                  Vous pouvez annuler à tout moment depuis votre tableau de bord.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quels moyens de paiement acceptez-vous ?</h4>
                <p className="text-gray-600 text-sm">
                  Nous acceptons les paiements mobiles (Orange Money, Moov Money, Wave)
                  et préparons l'intégration de cartes bancaires internationales.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Puis-je obtenir un remboursement ?</h4>
                <p className="text-gray-600 text-sm">
                  Oui, nous proposons une garantie satisfait ou remboursé de 30 jours
                  pour tous nos abonnements premium.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sécurité et confidentialité */}
        <div className="mt-8">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Sécurité garantie :</strong> Tous les paiements sont traités par nos partenaires
              financiers certifiés. Vos données bancaires ne sont jamais stockées sur nos serveurs.
              Conformité RGPD et normes de sécurité bancaires internationales.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
