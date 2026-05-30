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
import { Button } from "@/components/core/ui/button"
import { Card, CardContent } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"

import { ArrowRight, Smartphone, CreditCard, Users, Globe, Shield, Zap, Play, CheckCircle, Smartphone as PhoneIcon, Zap as LightningIcon, Wifi, WifiOff, QrCode, Upload, User, Briefcase, Building, Image, RotateCcw, Palette, Mail, Phone, X, Loader2, UserPlus, Menu, Star, TrendingUp, Award, Link as LinkIcon, AlertTriangle, Facebook, Instagram, Linkedin, MessageCircle, Music2, Sparkles, Video } from "lucide-react"
import Link from "next/link"
import { HowItWorks } from "@/components/HowItWorks"
import InteractiveBusinessCard from "@/components/InteractiveBusinessCard"
import { Logo } from "@/components/core/ui/logo"

import { ModernHero } from "@/components/landing/ModernHero"
import { ScrollStorytelling } from "@/components/landing/ScrollStorytelling"
import { ScrollReveal } from "@/components/core/ScrollReveal"

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
    // Problem Section Animation
    gsap.from("#problem .container", {
      scrollTrigger: {
        trigger: "#problem",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 100,
      duration: 1.5,
      ease: "power4.out"
    })

    // Animate friction steps one by one
    gsap.utils.toArray("#problem .opacity-50").forEach((step: any, i) => {
      gsap.to(step, {
        scrollTrigger: {
          trigger: step,
          start: "top 90%",
        },
        opacity: 1,
        x: 0,
        delay: i * 0.2,
        duration: 0.8
      })
    })

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



      {/* TARGET AUDIENCE SECTION : POUR QUI ? */}
      <section className="pt-[20px] pb-20 bg-white border-b border-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
              La solution ultime pour ceux qui veulent <br className="hidden md:block" /> <span className="text-ofika-orange">monétiser leur audience</span> et <span className="text-purple-600">marquer les esprits</span>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <ScrollReveal delay={0.1} direction="up">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group h-full">
                <CardContent className="p-6 text-center pt-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600 shadow-[0_8px_30px_rgba(249,115,22,0.1)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(249,115,22,0.2)] transition-all duration-300">
                    <Video className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Créateurs & Vidéastes</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Centralisez tout votre univers (TikTok, YT, Shop) sur un lien unique. Ne laissez plus un abonné se perdre en chemin.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group h-full">
                <CardContent className="p-6 text-center pt-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-[0_8px_30px_rgba(168,85,247,0.1)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(168,85,247,0.2)] transition-all duration-300">
                    <Sparkles className="w-8 h-8 text-purple-600 fill-purple-500/20" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Influenceurs</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Collabore avec des marques ? Affiche ton kit média, tes promos et ton contact pro en un clic. Professionnalisme = Gros contrats.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group h-full">
                <CardContent className="p-6 text-center pt-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600 shadow-[0_8px_30px_rgba(236,72,153,0.1)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(236,72,153,0.2)] transition-all duration-300">
                    <Palette className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tous les Créatifs</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Sublimez votre présence. Regroupez vos portfolios, projets récents et liens de contact pour faire briller votre identité visuelle.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.4} direction="up">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group h-full">
                <CardContent className="p-6 text-center pt-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-[0_8px_30px_rgba(59,130,246,0.1)] group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)] transition-all duration-300">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Freelances</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">En networking physique, sors ta carte NFC. "Bip", tes infos sont chez ton prospect. Effet "Wow" garanti et contrat signé.</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION : LA RÉVÉLATION */}
      <section id="solution" className="py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              La solution <span className="ofika-text-gradient">Anti-Friction</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofika transforme ton profil en autoroute vers la vente. Un seul lien, zéro effort pour tes clients.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            <ScrollReveal delay={0.1} direction="right" className="flex flex-col h-full">
              <Card className="shadow-md hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] transition-all duration-500 group h-full flex flex-col bg-white overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:-translate-y-2">
                <CardContent className="p-8 text-center flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Un Hub de Croissance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Ne donnez plus d'excuses à vos clients. WhatsApp, boutique, réseaux sociaux... <strong className="text-gray-900">tout votre univers est à portée d'un seul clic.</strong>
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="left" className="flex flex-col h-full">
              <Card className="shadow-md hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.3)] transition-all duration-500 group h-full flex flex-col bg-white overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-purple-500 hover:-translate-y-2">
                <CardContent className="p-8 text-center flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <QrCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Carte de Visite Numérique</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Le duo gagnant <strong className="text-gray-900">QR Code + Carte NFC</strong>. Partagez votre profil instantanément en ligne ou en personne. <strong className="text-gray-900">Plus professionnelle, plus écologique, plus efficace.</strong>
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* HYBRID SECTION : LE MEILLEUR DES DEUX MONDES */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <ScrollReveal direction="right" className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Le QR Code pour <span className="text-ofika-orange">l'écran</span>.<br />
                La Carte NFC pour <span className="text-purple-600">la main</span>.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">Pourquoi choisir ? Ofika vous donne le meilleur des deux technologies pour ne rater aucune opportunité de connexion.</p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"><QrCode className="w-6 h-6 text-ofika-orange" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">QR Code Téléchargeable</h4>
                    <p className="text-sm text-gray-600">Imprimez-le sur vos packagings, vitrines ou flyers. Un scan et vos clients sont sur votre profil.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><Wifi className="w-6 h-6 text-purple-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Carte NFC Professionnelle</h4>
                    <p className="text-sm text-gray-600">Posez votre carte sur le téléphone de votre prospect. Vos infos s'enregistrent en 1 seconde. Effet garanti.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" className="w-[calc(100%+2rem)] -mx-4 lg:w-full lg:mx-0 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 hidden lg:block"></div>
              <div className="relative bg-white p-6 sm:p-8 rounded-3xl border-0 lg:border border-gray-100 shadow-none lg:shadow-xl overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-100 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-50 rounded-full"></div>
                  </div>
                  <QrCode className="w-16 h-16 text-gray-200" />
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 relative flex flex-col justify-end">
                  <div className="absolute top-4 right-4"><Wifi className="w-8 h-8 text-white/20 animate-pulse-slow" /></div>
                  <div className="text-white">
                    <div className="text-xl font-bold mb-1 tracking-wider uppercase">VOTRE NOM</div>
                    <div className="text-xs text-orange-400 font-medium">Business Card NFC</div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                  <div className="h-2 w-16 bg-ofika-orange/30 rounded-full"></div>
                  <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="py-20 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Testez le rendu de votre carte <br />
              <span className="text-ofika-orange">avec vos propres informations</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-medium">
              Personnalisez votre design en temps réel. <br />
              Ne nous croyez pas sur parole, remplissez le formulaire ci-dessous.
            </p>


            <Link href="/get-started">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg">
                Je valide mon design
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="w-full flex justify-center">
            <div className="w-full">
              <InteractiveBusinessCard />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Des tarifs adaptés à <span className="text-ofika-orange">votre ambition</span>.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Pas de frais cachés. Annulable à tout moment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* PLAN GRATUIT - DÉCOUVERTE */}
            <ScrollReveal delay={0.1} className="h-full">
              <Card className="bg-gray-800 border-gray-700 text-white shadow-xl hover:border-gray-600 transition-all flex flex-col h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600 mb-3 px-3 py-1 font-bold italic">Essentiel</Badge>
                    <h3 className="text-2xl font-bold mb-2 text-white">Gratuit à vie</h3>
                    <div className="flex items-end gap-2"><span className="text-4xl font-black text-white">0 <span className="text-lg font-bold">FCFA</span></span></div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1 text-sm">
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Jusqu'à 3 pages Link-in-Bio publiques</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Jusqu'à 3 cartes NFC virtuelles (V-NFC)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>7 QR Codes statiques & 7 QR Codes dynamiques (y compris les 3 pour vos cartes virtuelles)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Jusqu'à 4 liens externes par page</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>2 templates de page public inclus</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>1 seul lien de collecte d'avis clients</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Achat de Cartes NFC Physiques disponible</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span className="text-orange-300 font-medium">Logo Ofika obligatoire sur le design final</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Sélecteur d'Emojis Émotionnels (40+ emojis)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Notifications Web Push (max 100 / mois)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Rappels de relance automatiques (7 jours)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Zéro commission de vente (100% pour vous)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /><span>Statistiques de visites intégrées (30 jours)</span></li>
                  </ul>
                  <Link href="/onboarding/public-page" className="block w-full">
                    <Button size="lg" className="w-full bg-black text-white hover:bg-gray-900 border border-gray-700/60 font-bold h-12 rounded-xl transition-all shadow-md">
                      Essayer maintenant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* PLAN PRO - CONQUÉRANT */}
            <ScrollReveal delay={0.2} className="h-full">
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-ofika-orange border-2 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] z-10 flex flex-col h-full transform lg:scale-105">
                <div className="absolute top-0 right-0 bg-ofika-orange text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">Recommandé</div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-ofika-orange/20 text-ofika-orange border-ofika-orange/30 px-3 py-1 text-xs font-bold italic">Premium</Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-2 py-0.5 text-[10px] font-black">BETA</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <div className="flex items-end gap-2 mb-2"><span className="text-4xl font-black text-white">1.000 <span className="text-lg font-bold">FCFA</span></span><span className="text-gray-400 text-xs mb-1">/ mois</span></div>
                    <p className="text-[10px] text-orange-200/60 leading-tight italic bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">En cours de développement. Seul le plan Gratuit et l'achat de carte NFC sont actifs pour le moment.</p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1 text-[13px]">
                    <li className="flex items-center gap-3 text-white font-bold mb-2"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Tout du plan Gratuit +</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Jusqu'à 20 pages Link-in-Bio publiques</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Jusqu'à 20 cartes NFC virtuelles (V-NFC)</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Jusqu'à 10 liens externes par page</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Jusqu'à 20 liens de collecte d'avis clients</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Achat de Cartes NFC Physiques disponible</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>20 QR Codes statiques & 20 QR Codes dynamiques (y compris les 20 pour vos cartes virtuelles)</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>8 templates de page public premium débloqués</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Notifications Web Push (max 1 000 / mois)</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Protection Anti-Fake sur vos avis clients</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Statistiques avancées (90j) + Géo-scans</span></li>
                    <li className="flex items-center gap-3 text-white/90"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>50 SMS et E-mails de relance automatique</span></li>
                  </ul>
                  <Button disabled size="lg" className="w-full bg-gray-700 text-gray-400 font-black h-12 rounded-xl cursor-not-allowed">
                    Bientôt Disponible
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* PLAN BUSINESS - DOMINATION */}
            <ScrollReveal delay={0.3} className="h-full">
              <Card className="bg-gray-800 border-purple-500/30 border text-white shadow-xl hover:border-purple-500/50 transition-all flex flex-col h-full opacity-90">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-900/40 text-purple-400 border-purple-500/30 px-3 py-1 font-bold italic">Entreprise</Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-2 py-0.5 text-[10px] font-black">BETA</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Business</h3>
                    <div className="flex items-end gap-2 mb-2"><span className="text-4xl font-black text-white">3.000 <span className="text-lg font-bold">FCFA</span></span><span className="text-gray-400 text-xs mb-1">/ mois</span></div>
                    <p className="text-[10px] text-purple-300/60 leading-tight italic bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">En cours de développement. Seul le plan Gratuit et l'achat de carte NFC sont actifs pour le moment.</p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1 text-[13px]">
                    <li className="flex items-center gap-3 text-gray-200 font-bold mb-2"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Tout du plan Pro +</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Pages Link-in-Bio & V-NFC 100% Illimitées</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>100 QR Codes statiques & 100 QR Codes dynamiques (y compris pour vos cartes virtuelles)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Nombre de liens par page 100% Illimité</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Tous les templates + Personnalisation sur-mesure</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Création de designs uniques & sur-mesure</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Liens de collecte d'avis clients 100% Illimités</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Achat de Cartes NFC Physiques disponible</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Notifications Web Push 100% Illimitées</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Vente directe (E-commerce / Services)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Intégration checkout & Paiement direct</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Nom de domaine personnalisé (.com, .ci)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Marque blanche complète (sans logo Ofika)</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Statistiques à vie + Export CSV complet</span></li>
                    <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" /><span>Support Dédié Prioritaire 24h/24 et 7j/7</span></li>
                  </ul>
                  <Button disabled size="lg" className="w-full bg-gray-700 text-gray-400 font-black h-12 rounded-xl cursor-not-allowed">
                    Bientôt Disponible
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* PHYSICAL CARD SECTION - SEPARATE */}
          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={0.4}>
              <Card className="bg-white border-2 border-orange-100 text-gray-900 shadow-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 md:w-1/3 flex flex-col justify-center items-center text-center">
                    <div className="bg-white/20 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform duration-500">
                      <CreditCard className="w-12 h-12 text-white" />
                    </div>
                    <Badge className="bg-white text-orange-600 mb-2 font-bold tracking-tighter">ÉDITION PHYSIQUE</Badge>
                    <h3 className="text-2xl font-black mb-1">Carte NFC Ofika</h3>
                    <div className="text-3xl font-black text-white/95">{NFC_CARD_BASE_PRICE.toLocaleString('fr-FR')} FCFA</div>
                    <p className="text-[9px] text-orange-100 font-bold uppercase tracking-wider mt-1.5 leading-tight">Design par défaut • Achat Unique</p>
                  </div>
                  <div className="p-8 md:w-2/3 flex flex-col">
                    <h3 className="text-2xl font-bold mb-4">La carte qui fait tout le travail</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <li className="flex items-center gap-3 text-gray-600"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Friction-zéro (Bip & Connect)</span></li>
                      <li className="flex items-center gap-3 text-gray-600"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Écologique & Réutilisable à vie</span></li>
                      <li className="flex items-center gap-3 text-gray-600"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Modifiable en temps réel</span></li>
                      <li className="flex items-center gap-3 text-gray-600"><CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" /><span>Livraison Express 24h</span></li>
                      <li className="flex items-start gap-3 sm:col-span-2 bg-orange-50/70 p-3 rounded-xl border border-orange-100/60 mt-1">
                        <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-700 leading-relaxed">
                          <strong>Personnalisation sur-mesure disponible :</strong> Quel que soit votre plan, concevez une carte physique 100% unique (logo, couleurs, finitions) en contactant l'équipe Ofika (le prix s'ajustera selon votre demande).
                        </span>
                      </li>
                    </ul>
                    <Link href="/get-started" className="mt-auto">
                      <Button size="lg" className="w-full bg-gray-900 hover:bg-ofika-orange text-white font-bold h-14 rounded-2xl shadow-xl transition-all flex items-center justify-center text-lg">
                        Commander ma carte
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm max-w-lg mx-auto leading-tight italic">
              Besoin de cartes NFC physiques ? Elles sont disponibles à l'achat une fois votre compte créé.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-6 px-4 py-1.5 text-sm uppercase tracking-wide font-bold">Notre Mission</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Digitaliser le commerce en Afrique,<br /> une connexion à la fois.</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">Ofika est né d'un constat simple à Abidjan : trop de ventes se perdent parce que partager ses contacts est compliqué. Nous sommes une équipe de passionnés (développeurs, designers, marketeurs) déterminés à donner aux entrepreneurs africains les outils "No-Code" les plus puissants du monde.</p>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">Notre but ? Que chaque vendeur, du grand magasin au freelance, puisse avoir une présence professionnelle en 2 minutes chrono.</p>
          </div>
        </div>
      </section>



      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white text-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-ofika-orange/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black mb-8 max-w-4xl mx-auto leading-[1.1] tracking-tighter">
            Rejoignez la révolution du <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">networking ivoirien.</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
            Vos concurrents sont déjà en train de digitaliser leur carnet d'adresses. Arrêtez de passer pour un amateur avec des cartons papier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/onboarding/public-page">
              <Button size="lg" className="bg-ofika-orange hover:bg-orange-600 text-white text-xl font-bold px-12 py-8 rounded-2xl shadow-2xl shadow-orange-900/20 transform hover:-translate-y-1 transition-all">
                Je veux mon profil gratuit
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-500 font-bold flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Sans carte bancaire • 2 minutes chrono
          </p>
        </div>
      </section>

      {/* Footer Premium — 4 colonnes */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">

        {/* Corps principal */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Colonne 1 : Logo + Description + Réseaux */}
            <div className="space-y-6 lg:col-span-1">
              <Logo size="md" showText variant="white" />
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                La solution Nº1 en Afrique pour digitaliser votre présence professionnelle et convertir vos prospects instantanément.
              </p>
              <div className="flex gap-3">
                <Link href="https://www.facebook.com/profile.php?id=61583402783024" target="_blank" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-ofika-orange hover:text-white transition-all duration-200">
                  <Facebook className="w-4 h-4" />
                </Link>
                <Link href="https://www.instagram.com/chris.co0/" target="_blank" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-ofika-orange hover:text-white transition-all duration-200">
                  <Instagram className="w-4 h-4" />
                </Link>
                <Link href="https://www.linkedin.com/company/ofikacard/" target="_blank" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-ofika-orange hover:text-white transition-all duration-200">
                  <Linkedin className="w-4 h-4" />
                </Link>
                <Link href="https://wa.me/2250503681588?text=Bonjour%20Ofika" target="_blank" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-200">
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <Link href="https://www.tiktok.com/@ofika.ci" target="_blank" className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-600 hover:text-white transition-all duration-200">
                  <Music2 className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Colonne 2 : Navigation */}
            <div>
              <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => scrollToSection('problem')} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pourquoi Ofika ?
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('solution')} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    La Solution
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Tarifs
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    FAQ
                  </button>
                </li>
                <li>
                  <Link href="/onboarding/public-page" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Créer mon lien
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 3 : Services */}
            <div>
              <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Nos Services</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/onboarding/public-page" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Lien Bio SmartLink
                  </Link>
                </li>
                <li>
                  <Link href="/get-started" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ofika-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Carte NFC Physique
                  </Link>
                </li>
                <li>
                  <Link href="https://ofika-insight.vercel.app/" target="_blank" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Ofika Insight — Analytics
                  </Link>
                </li>
                <li>
                  <Link href="https://orla-nou.vercel.app/" target="_blank" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Orla_nou Automatication
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Menly — Menu Digital
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4 : Légal */}
            <div>
              <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Légal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terms" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Confidentialité et RGPD
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Clause de non-responsabilité
                  </Link>
                </li>
                <li>
                  <Link href="/bug-bounty" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Programme de primes aux bogues
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Éthique et conformité
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 5 : Contact */}
            <div>
              <h4 className="text-white font-black mb-6 uppercase text-xs tracking-widest">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs mb-0.5">WhatsApp</p>
                    <Link href="https://wa.me/2250503681588" target="_blank" className="hover:text-white transition-colors text-xs">+225 05 03 68 15 88</Link>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-ofika-orange" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs mb-0.5">Email</p>
                    <Link href="mailto:krsidoine7@gmail.com" className="hover:text-white transition-colors text-xs">krsidoine7@gmail.com</Link>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-gray-900 bg-black/30">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} <span className="text-gray-300 font-bold">Ofika</span>. Tous droits réservés.
              </p>
              <p className="text-[10px] text-gray-700 uppercase tracking-widest font-medium">Une solution propulsée par l'innovation</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[11px] text-gray-500 font-medium">
              <Link href="/terms" className="hover:text-ofika-orange transition-colors">Conditions</Link>
              <Link href="/privacy" className="hover:text-ofika-orange transition-colors">Confidentialité</Link>
              <Link href="/compliance" className="hover:text-ofika-orange transition-colors">Conformité</Link>
              <Link href="/auth/login" className="hover:text-ofika-orange transition-colors">Espace Pro</Link>
            </div>
          </div>
        </div>

      </footer>
    </div>
  )
}