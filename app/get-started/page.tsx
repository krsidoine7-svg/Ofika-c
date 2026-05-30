'use client'

import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { CreditCard, Globe, ArrowRight, CheckCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getRawPrice } from '@/lib/config/pricing'
import { Logo } from '@/components/core/ui/logo'

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="sm" showText />
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choisissez votre solution
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Partagez vos informations professionnelles avec style.
            Choisissez entre une carte NFC physique ou une page publique en ligne.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Carte NFC */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden transition-all duration-300 h-full shadow-lg border-gray-100">
              {/* Badge populaire */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Populaire
                </Badge>
              </div>

              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10" />

              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Carte NFC Physique</CardTitle>
                <CardDescription className="text-base">
                  Une carte intelligente à taper pour partager instantanément
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Prix */}
                <div className="bg-white rounded-lg p-4 border-2 border-orange-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {getRawPrice().toLocaleString('fr-FR')} XOF
                    </span>
                    <span className="text-gray-500">+ livraison</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Carte premium incluse</p>
                </div>

                {/* Fonctionnalités */}
                <ul className="space-y-3">
                  {[
                    'Carte NFC physique haut de gamme',
                    'Design personnalisable',
                    'QR Code intégré',
                    'Profil digital complet',
                    'Analytics en temps réel',
                    'Livraison sous 5-7 jours'
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <p className="text-xs text-center text-gray-500 mt-6">
                  💳 Paiement sécurisé • 🚚 Livraison gratuite dès 2 cartes
                </p>

                <div className="pt-4">
                  <Link href="/onboarding/nfc-card">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all group">
                      Choisir la Carte NFC
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Page Publique */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden transition-all duration-300 h-full shadow-lg border-gray-100">
              {/* Badge gratuit */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white">
                  Gratuit
                </Badge>
              </div>

              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />

              <CardHeader className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Page Publique</CardTitle>
                <CardDescription className="text-base">
                  Un profil en ligne accessible partout, tout le temps
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Prix */}
                <div className="bg-white rounded-lg p-4 border-2 border-green-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">Gratuit</span>
                    <span className="text-gray-500">pour toujours</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Pas de carte de crédit requise</p>
                </div>

                {/* Fonctionnalités */}
                <ul className="space-y-3">
                  {[
                    'Page personnalisée avec votre URL',
                    'Jusqu\'à 4 réseaux sociaux + 4 liens',
                    'QR Code téléchargeable',
                    'Templates professionnels',
                    'Analytics basiques',
                    'En ligne en 5 minutes'
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <p className="text-xs text-center text-gray-500 mt-6">
                  ✨ Créez votre page en quelques clics • 🌐 Accessible 24/7
                </p>

                <div className="pt-4">
                  <Link href="/onboarding/public-page">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all group">
                      Choisir la Page Publique
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bouton d'action central */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-16"
        >
          <Link href="/onboarding/public-page" className="w-full sm:w-auto">
            <div className="w-fit mx-auto px-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Créer ma page publique
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </Link>
        </motion.div>

        {/* Comparaison rapide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center mb-4">
                💡 Pas sûr de votre choix ?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">Choisissez la carte NFC si :</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Vous réseautez en personne</li>
                    <li>✓ Vous voulez impressionner</li>
                    <li>✓ Vous participez à des événements</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">Choisissez la page publique si :</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Vous débutez</li>
                    <li>✓ Vous voulez tester gratuitement</li>
                    <li>✓ Vous préférez partager un lien</li>
                  </ul>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                <strong>Bon à savoir :</strong> Vous pourrez toujours commander une carte NFC plus tard !
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Ofika. Tous droits réservés.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/about" className="hover:text-orange-500">À propos</Link>
              <Link href="/privacy" className="hover:text-orange-500">Confidentialité</Link>
              <Link href="/terms" className="hover:text-orange-500">CGU</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
