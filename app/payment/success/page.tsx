'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  ArrowRight,
  Home,
  Package,
  Truck,
  ShieldCheck,
  Star,
  Download,
  Phone
} from "lucide-react"
import { toast } from "sonner"
import confetti from 'canvas-confetti'
import gsap from 'gsap'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  // Récupérer les paramètres de l'URL
  const cardType = searchParams.get('type') || 'nfc_qr'
  const amount = searchParams.get('amount') || '14600'
  const transactionId = searchParams.get('transaction_id') || 'OFK-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  
  useEffect(() => {
    // Simuler le traitement final
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // Déclencher les confettis
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)

      // GSAP Animations
      if (containerRef.current) {
        gsap.fromTo(iconRef.current, 
          { scale: 0, rotation: -180 }, 
          { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)" }
        )
        gsap.fromTo(titleRef.current, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, delay: 0.5 }
        )
        gsap.fromTo(detailsRef.current?.children || [], 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.8 }
        )
      }

      toast.success('Paiement confirmé ! Bienvenue chez Ofika.')
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const formatPrice = (price: string) => {
    return parseInt(price).toLocaleString('fr-FR') + ' XOF'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
            <img src="/assets/logos/logo-orange.svg" alt="Ofika" className="w-10 h-10 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Sécurisation du paiement...</h2>
          <p className="text-gray-400 animate-pulse">Veuillez ne pas fermer cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>

      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Success Icon Section */}
        <div ref={iconRef} className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)] rotate-12 group hover:rotate-0 transition-transform duration-500">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-2xl mb-12">
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            C'EST VALIDÉ ! 🎉
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Votre commande <span className="text-white font-bold">#{transactionId}</span> est confirmée. Préparez-vous à révolutionner votre networking.
          </p>
        </div>

        {/* Content Grid */}
        <div ref={detailsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Summary Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden group hover:border-orange-500/50 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Récapitulatif</h3>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm">Produit</span>
                  <span className="font-bold text-white uppercase">{cardType === 'nfc_qr' ? 'Pack Premium NFC+QR' : 'Digital QR Card'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm">Montant investi</span>
                  <span className="font-black text-2xl text-orange-500">{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm">Livraison estimée</span>
                  <div className="flex items-center gap-2 text-green-400">
                    <Truck className="w-4 h-4" />
                    <span className="font-bold">1 à 5 jours</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 w-fit">
                   <ShieldCheck className="w-4 h-4 text-green-500" />
                   <span className="text-xs font-bold text-green-500 uppercase">Paiement Sécurisé GeniusPay</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl group hover:border-blue-500/50 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Et maintenant ?</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4 group/step">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-black text-sm flex-shrink-0 group-hover/step:scale-110 transition-transform">1</div>
                  <div>
                    <p className="font-bold text-white">Personnalisation</p>
                    <p className="text-sm text-gray-400">Rendez-vous dans votre espace pour finaliser votre design.</p>
                  </div>
                </div>
                <div className="flex gap-4 group/step">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-sm flex-shrink-0 group-hover/step:scale-110 transition-transform">2</div>
                  <div>
                    <p className="font-bold text-white">Vérification</p>
                    <p className="text-sm text-gray-400">Notre équipe vérifie les fichiers. On vous appelle si besoin.</p>
                  </div>
                </div>
                <div className="flex gap-4 group/step">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-black text-sm flex-shrink-0 group-hover/step:scale-110 transition-transform">3</div>
                  <div>
                    <p className="font-bold text-white">Expédition rapide</p>
                    <p className="text-sm text-gray-400">Votre carte arrive chez vous à Abidjan sous 1 à 5 jours.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col md:flex-row gap-4 w-full max-w-4xl opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-forwards">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold text-lg rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] group"
          >
            Configuer ma carte
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl"
          >
            <Download className="mr-2 w-5 h-5" />
            Télécharger le reçu
          </Button>

          <Button 
             variant="ghost"
             onClick={() => window.open('https://wa.me/2250503681588', '_blank')}
             className="h-14 text-orange-500 hover:text-orange-400 hover:bg-orange-500/5 font-bold rounded-2xl"
          >
            <Phone className="mr-2 w-5 h-5" />
            Support WhatsApp
          </Button>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-gray-500 text-sm">
           <p>© {new Date().getFullYear()} OFIKA.CI - Technologie de Networking NFC Ivoirienne.</p>
           <p className="mt-2 flex items-center justify-center gap-2">
              <img src="/assets/logos/logo-orange.svg" alt="Ofika" className="w-4 h-4 grayscale opacity-50" />
              L'avenir du contact professionnel est là.
           </p>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full animate-pulse mx-auto"></div>
          <p className="text-gray-500 font-mono tracking-tighter">INITIALISATION...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
