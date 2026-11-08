'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { ArrowRight, Smartphone, CreditCard, Users, Globe, Shield, Zap, Play, CheckCircle, Smartphone as PhoneIcon, Zap as LightningIcon, Wifi, WifiOff, QrCode, Upload, User, Briefcase, Building, Image, RotateCcw, Palette, Mail, Phone, X, Loader2, UserPlus, Menu, Star, TrendingUp, Award, AlertTriangle, Instagram, Linkedin, MessageCircle, Music2, Sparkles, Video, Truck, MapPin } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic'
import { Logo } from "@/components/ui/logo"

const InteractiveBusinessCard = dynamic(() => import("@/components/InteractiveBusinessCard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-900 rounded-3xl border border-gray-800">
      <Loader2 className="w-8 h-8 text-ofika-orange animate-spin" />
    </div>
  )
})

const ModernHero = dynamic(() => import("@/components/landing/ModernHero").then(mod => mod.ModernHero), {
  ssr: false,
  loading: () => <div className="min-h-[600px] w-full bg-white" />
})
import { ScrollStorytelling } from "@/components/landing/ScrollStorytelling"
import { ScrollReveal } from "@/components/core/ScrollReveal"
import { VerifiedReviewsSection } from "@/components/landing/VerifiedReviewsSection"

import { NFC_CARD_BASE_PRICE } from "@/lib/config/pricing"

export default function HomePage() {
  // États pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Authentification
  const { user, loading } = useAuth()
  const router = useRouter()

  // --- GLOBAL SCROLL STORYTELLING ANIMATIONS ---
  const mainContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Solution Section - Cards reveal
    gsap.from("#solution .grid > div", {
      scrollTrigger: {
        trigger: "#solution",
        start: "top 70%",
      },
      opacity: 0,
      scale: 0.8,
      y: 50,
      stagger: 0.2,
      duration: 1.2,
      ease: "back.out(1.7)"
    })

    // Parallax branding elements
    gsap.to(".ofika-text-gradient", {
      scrollTrigger: {
        trigger: "#solution",
        scrub: true
      },
      backgroundPosition: "200% center",
      duration: 1
    })

    // Final CTA - Punchy reveal
    gsap.from(".py-24.bg-gradient-to-br", {
      scrollTrigger: {
        trigger: ".py-24.bg-gradient-to-br",
        start: "top 90%",
      },
      scale: 0.9,
      opacity: 0,
      duration: 1.5,
      ease: "expo.out"
    })

  }, { scope: mainContainerRef })

  // Fermer le menu mobile au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobileMenuOpen])

  // Fermer le menu mobile au clic sur un lien
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Smooth scroll pour la navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
    closeMobileMenu()
  }

  return (
    <div ref={mainContainerRef} className="min-h-screen bg-white relative font-sans">
      {/* Navigation Premium - Floating Glassmorphism */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
              <Logo
                size="sm"
                variant="insigne"
                className="transition-transform duration-300 group-hover:rotate-[10deg] drop-shadow-sm"
              />
              <Logo size="sm" showText className="transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-10">
              <button onClick={() => scrollToSection('problem')} className="text-gray-600 hover:text-ofika-orange font-semibold text-sm transition-all relative group">
                Pourquoi Ofika ?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ofika-orange transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('solution')} className="text-gray-600 hover:text-ofika-orange font-semibold text-sm transition-all relative group">
                La Solution
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ofika-orange transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-ofika-orange font-semibold text-sm transition-all relative group">
                Tarifs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ofika-orange transition-all duration-300 group-hover:w-full"></span>
              </button>


              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-ofika-orange hover:bg-orange-600 font-bold px-6 rounded-xl shadow-lg shadow-orange-500/20 text-white transition-all hover:-translate-y-0.5 active:translate-y-0">
                    Mon Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-6">
                  <Link href="/auth/login" className="text-gray-700 font-bold hover:text-ofika-orange transition-colors text-sm">
                    Connexion
                  </Link>
                  <Link href="/onboarding/public-page">
                    <Button className="bg-gray-900 hover:bg-black text-white font-bold px-6 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
                      Créer mon lien
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Menu Mobile Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-900 hover:bg-orange-50 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Menu Mobile Dropdown */}
          <div className={`md:hidden transition-all duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="py-6 space-y-4 border-t border-gray-100/50">
              <button onClick={() => scrollToSection('problem')} className="block w-full text-left text-gray-800 font-bold text-lg hover:text-ofika-orange transition-colors">Pourquoi Ofika ?</button>
              <button onClick={() => scrollToSection('solution')} className="block w-full text-left text-gray-800 font-bold text-lg hover:text-ofika-orange transition-colors">La Solution</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-800 font-bold text-lg hover:text-ofika-orange transition-colors">Tarifs</button>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full border-gray-200 text-gray-900 font-bold h-12 rounded-xl">Connexion</Button>
                </Link>
                <Link href="/onboarding/public-page">
                  <Button className="w-full bg-ofika-orange hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-md">Démarrer</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MODERN PREMIUM HERO */}
      <ModernHero videoUrl="/deo-tuto.mp4" />

      {/* SCROLL STORYTELLING : L'animation qui explique le concept "Tap & Connect" */}
      <ScrollStorytelling videoUrl="/deo-tuto.mp4" />



      {/* SECTION COMBINÉE : SOLUTION, NFC vs QR & POUR QUI */}
      <section id="solution" className="py-16 sm:py-20 bg-gray-50/70 border-b border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* En-tête percutant */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/80 text-ofika-orange mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              L&apos;alternative moderne à la carte papier
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Le sans contact pour vos rencontres.<br className="hidden sm:block" />
              <span className="text-ofika-orange"> Le QR code</span> pour vos supports.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              <strong className="text-gray-900 font-semibold">88% des cartes papier finissent à la poubelle</strong> en moins d&apos;une semaine. Avec Ofika, vos coordonnées s&apos;enregistrent instantanément dans le téléphone de votre client, modifiables à vie et sans application.
            </p>
          </div>

          {/* Les 2 Piliers : NFC vs QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {/* Pilier 1 : NFC */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-ofika-orange flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Wifi className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-ofika-orange">En face-à-face</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 mb-2">La Carte Sans Contact (NFC)</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 leading-relaxed">
                Approchez votre carte du smartphone de votre interlocuteur. Votre fiche s&apos;ouvre automatiquement sans qu&apos;il ait besoin d&apos;installer la moindre application.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 font-medium border-t border-gray-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>100% compatible iPhone &amp; Android</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Enregistrement en 1 tap dans les contacts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Profil et coordonnées modifiables à vie</span>
                </li>
              </ul>
            </div>

            {/* Pilier 2 : QR Code */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Sur vos supports &amp; à distance</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 mb-2">Le QR Code Intelligent</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5 leading-relaxed">
                Imprimé au dos de votre carte ou affiché sur vos vitrines, emballages, factures et réseaux pour être contacté même à distance.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 font-medium border-t border-gray-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Idéal pour vitrines, emballages et flyers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Lien direct vers WhatsApp, catalogue &amp; réseaux</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Scannable avec tout appareil photo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bandeau compact : Pour qui ? */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/70 shadow-sm">
            <div className="text-center sm:text-left mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pour qui ?</span>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900">Une solution pensée pour votre quotidien professionnel</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 hover:bg-orange-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Boutiques &amp; Commerces</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">WhatsApp, catalogue &amp; localisation en un geste.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 hover:bg-purple-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Cadres &amp; Entreprises</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Salons et déjeuners sans jamais manquer de cartes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 hover:bg-pink-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Freelances &amp; Experts</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Portfolio, offres et prise de contact immédiate.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 hover:bg-blue-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Créateurs &amp; Médias</h5>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Réseaux, vidéos et partenariats sur une seule page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="py-16 sm:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white border-b border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-ofika-orange mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Simulateur 3D en direct
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
              Testez votre carte <span className="text-ofika-orange">en temps réel</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Tapez vos informations et observez immédiatement le résultat en 3D sur votre future carte.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div className="w-full">
              <InteractiveBusinessCard />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - REDESIGN LUMINEUX & ÉPURÉ */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50/70 border-b border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* En-tête de section */}
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-ofika-orange mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Transparence totale
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Des tarifs adaptés à <span className="text-ofika-orange">votre ambition</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Pas de frais cachés, aucun abonnement forcé. Commencez gratuitement ou commandez votre carte physique sans contact.
            </p>
          </div>

          {/* Grille des 3 offres claires */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
            {/* OFFRE 1 : PROFIL DIGITAL (GRATUIT) */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 mb-4">
                  Pour démarrer
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Profil Digital</h3>
                <p className="text-sm text-gray-500 mb-5">Votre vitrine en ligne accessible par QR code.</p>
                
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-gray-100">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900">0</span>
                  <span className="text-base font-bold text-gray-500">FCFA</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2">Gratuit à vie</span>
                </div>

                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Page de profil en ligne personnalisée</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Bouton "Ajouter aux contacts" en 1 clic</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>WhatsApp, téléphone, catalogues &amp; réseaux</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>QR Code digital prêt à scanner</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Modifiable en temps réel à tout moment</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>100% compatible tous smartphones</span>
                  </li>
                </ul>
              </div>

              <Link href="/onboarding/public-page" className="block w-full">
                <Button size="lg" className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer">
                  Créer mon profil gratuit
                </Button>
              </Link>
            </div>

            {/* OFFRE 2 : CARTE NFC PHYSIQUE */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 mb-4">
                  Édition physique
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Carte NFC Physique</h3>
                <p className="text-sm text-gray-500 mb-5">Le geste sans contact qui marque vos rencontres.</p>
                
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-gray-100">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900">{NFC_CARD_BASE_PRICE.toLocaleString('fr-FR')}</span>
                  <span className="text-base font-bold text-gray-500">FCFA</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2">Achat unique • À vie</span>
                </div>

                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Puce NFC sans contact (1 tap sur smartphone)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>QR Code haute définition gravé au dos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Carte rigide haut de gamme, étanche &amp; inusable</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Profil digital complet inclus et modifiable à vie</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Aucun abonnement, aucun frais mensuel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">Livraison 100% gratuite dans tout Abidjan</span>
                  </li>
                </ul>
              </div>

              <Link href="/get-started" className="block w-full">
                <Button size="lg" className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>Commander ma carte</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* OFFRE 3 : ENTREPRISES & ÉQUIPES */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 mb-4">
                  Équipes &amp; Flottes
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Entreprises</h3>
                <p className="text-sm text-gray-500 mb-5">Équipez vos collaborateurs avec votre logo officiel.</p>
                
                <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-gray-100">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900">Sur devis</span>
                  <span className="text-xs text-purple-600 font-semibold ml-2">Dès 5 cartes</span>
                </div>

                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Design 100% sur-mesure à vos couleurs &amp; logo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Gestion centralisée des collaborateurs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Réattribution instantanée si un membre change</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Facturation entreprise &amp; commande groupée</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Accompagnement dédié &amp; support prioritaire</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://wa.me/2250503681588?text=Bonjour%20Ofika,%20je%20souhaite%20un%20devis%20pour%20%C3%A9quiper%20mon%20entreprise."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button size="lg" variant="outline" className="w-full h-12 rounded-xl border-gray-300 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 text-gray-700 font-bold text-sm transition-all cursor-pointer">
                  Demander un devis équipe
                </Button>
              </a>
            </div>
          </div>

          {/* Note rassurante avec icônes professionnelles */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-xl mx-auto flex items-center justify-center flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                Livraison 100% gratuite dans tout Abidjan
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gray-500" />
                Paiement sécurisé par Mobile Money (Orange, Wave, MTN, Moov) ou carte
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION CTA SIMPLE, DIRECTE & CLAIRE (SANS FOND NOIR, TEXTES ÉPURÉS) */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl sm:rounded-[32px] bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white border border-orange-100 p-8 sm:p-14 lg:p-16 text-center max-w-4xl mx-auto shadow-sm">
            
            {/* Titre direct & percutant */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              Prêt à passer à la carte <br className="hidden sm:inline" />
              <span className="text-ofika-orange">nouvelle génération</span> ?
            </h2>

            {/* Sous-titre court en une phrase */}
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto font-normal leading-relaxed">
              Partagez vos coordonnées d'un simple geste sur n'importe quel smartphone, sans application.
            </p>

            {/* Boutons d'Action Directs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding/public-page" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-13 sm:h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl sm:rounded-2xl text-base font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group">
                  Créer mon profil gratuit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://wa.me/2250503681588?text=Bonjour%20Ofika%20je%20souhaite%20commander%20une%20carte%20NFC" target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 sm:h-14 px-7 border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Commander une carte physique
                </Button>
              </Link>
            </div>

            {/* Micro-réassurance concise */}
            <p className="mt-6 text-xs text-gray-500 font-medium">
              100% gratuit pour commencer • Sans engagement • Prêt en 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Section Avis Clients Vérifiés */}
      <VerifiedReviewsSection />

      {/* FOOTER ULTRA-MODERNE & ÉPURÉ */}
      <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

            {/* Colonne 1 : Marque + Mission + Réseaux (4 colonnes) */}
            <div className="lg:col-span-4 space-y-6">
              <Logo size="md" showText variant="white" />
              <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
                La référence de la carte de visite sans contact et du profil digital professionnel en Afrique de l'Ouest. Partagez vos coordonnées d'un simple geste.
              </p>
              
              {/* Réseaux sociaux officiels (SANS Facebook !) */}
              <div className="flex items-center gap-3 pt-2">
                <Link 
                  href="https://www.instagram.com/chris.co0/" 
                  target="_blank" 
                  aria-label="Instagram Ofika"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </Link>
                <Link 
                  href="https://www.linkedin.com/company/ofikacard/" 
                  target="_blank" 
                  aria-label="LinkedIn Ofika"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </Link>
                <Link 
                  href="https://wa.me/2250503681588?text=Bonjour%20Ofika" 
                  target="_blank" 
                  aria-label="WhatsApp Ofika"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <Link 
                  href="https://www.tiktok.com/@ofika.ci" 
                  target="_blank" 
                  aria-label="TikTok Ofika"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all"
                >
                  <Music2 className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Colonne 2 : Navigation (2 colonnes) */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => scrollToSection('problem')} className="hover:text-white transition-colors">
                    Pourquoi Ofika ?
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('solution')} className="hover:text-white transition-colors">
                    La Solution
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">
                    Tarifs
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <Link href="/onboarding/public-page" className="hover:text-orange-400 transition-colors font-medium">
                    Créer mon profil gratuit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 3 : Écosystème & Solutions (3 colonnes) */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Nos Solutions</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/get-started" className="hover:text-white transition-colors">
                    Cartes NFC Métal & Minérale
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding/public-page" className="hover:text-white transition-colors">
                    Profil SmartLink Connecté
                  </Link>
                </li>
                <li>
                  <Link href="https://ofika-insight.vercel.app/" target="_blank" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    <span>Ofika Insight (Analytics)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Pro</span>
                  </Link>
                </li>
                <li>
                  <Link href="https://orla-nou.vercel.app/" target="_blank" className="hover:text-white transition-colors">
                    Orla_nou Automation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Menly — Menu Digital Restaurants
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4 : Contact & Support (3 colonnes) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">Contact direct</h4>
              
              <Link 
                href="https://wa.me/2250503681588" 
                target="_blank"
                className="group flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Assistance WhatsApp</div>
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">+225 05 03 68 15 88</div>
                </div>
              </Link>

              <Link 
                href="mailto:contact@ofika.ci" 
                className="group flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Email commercial</div>
                  <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">contact@ofika.ci</div>
                </div>
              </Link>

              <div className="text-xs text-neutral-400 flex items-center gap-1.5 pt-1 px-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Abidjan, Côte d&apos;Ivoire</span>
              </div>
            </div>

          </div>
        </div>

        {/* Barre de copyright & statut */}
        <div className="border-t border-neutral-900 bg-neutral-950/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tous les systèmes opérationnels</span>
              </span>
              <span>•</span>
              <span>© {new Date().getFullYear()} <strong className="text-white font-semibold">Ofika</strong>. Tous droits réservés.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
              <Link href="/terms" className="hover:text-neutral-300 transition-colors">Conditions</Link>
              <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Confidentialité</Link>
              <Link href="/compliance" className="hover:text-neutral-300 transition-colors">Conformité</Link>
              <Link href="/auth/login" className="hover:text-orange-400 transition-colors font-medium">Espace Pro</Link>
            </div>

          </div>
        </div>
      </footer>
    </div>
  )
}