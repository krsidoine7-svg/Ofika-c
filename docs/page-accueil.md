'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/core/ui/accordion"
import { ArrowRight, Smartphone, CreditCard, Users, Globe, Shield, Zap, Play, CheckCircle, Smartphone as PhoneIcon, Zap as LightningIcon, Wifi, WifiOff, QrCode, Upload, User, Briefcase, Building, Image, RotateCcw, Palette, Mail, Phone, X, Loader2, UserPlus, Menu, Star, TrendingUp, Award, Link as LinkIcon, AlertTriangle, Facebook, Instagram, Linkedin, MessageCircle, Music2 } from "lucide-react"
import Link from "next/link"
import { HowItWorks } from "@/components/HowItWorks"
import InteractiveBusinessCard from "@/components/InteractiveBusinessCard"
import { Logo } from "@/components/core/ui/logo"


export default function HomePage() {
  // États pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Authentification
  const { user, loading } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen bg-white relative font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <Logo size="sm" showText />
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('problem')} className="text-gray-600 hover:text-ofika-orange font-medium transition-colors">Pourquoi Ofika ?</button>
              <button onClick={() => scrollToSection('solution')} className="text-gray-600 hover:text-ofika-orange font-medium transition-colors">La Solution</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-ofika-orange font-medium transition-colors">Tarifs</button>
              <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-ofika-orange font-medium transition-colors">FAQ</button>

              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-ofika-orange hover:bg-ofika-orange/90 font-bold shadow-lg shadow-orange-500/20">
                    Mon Tableau de Bord
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className="text-gray-900 font-semibold hover:text-ofika-orange transition-colors">
                    Connexion
                  </Link>
                  <Link href="/get-started">
                    <Button className="bg-ofika-orange hover:bg-ofika-orange/90 font-bold shadow-lg shadow-orange-500/20">
                      Créer mon lien gratuit
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Menu Mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-800"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </Button>
            </div>
          </div>

          {/* Menu Mobile Dropdown */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100 shadow-xl rounded-b-2xl' : 'max-h-0 opacity-0'
            }`}>
            <div className="py-4 border-t border-gray-100 bg-white px-2">
              <div className="flex flex-col space-y-2">
                <button onClick={() => scrollToSection('problem')} className="text-left text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors">Pourquoi Ofika ?</button>
                <button onClick={() => scrollToSection('solution')} className="text-left text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors">La Solution</button>
                <button onClick={() => scrollToSection('pricing')} className="text-left text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors">Tarifs</button>
                <button onClick={() => scrollToSection('faq')} className="text-left text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors">FAQ</button>
                <div className="pt-4 px-2">
                  <Link href="/get-started">
                    <Button className="bg-ofika-orange hover:bg-ofika-orange/90 w-full font-bold text-lg h-12 shadow-md">
                      Créer mon lien gratuit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION : ACCROCHE CHOC */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 bg-gradient-to-b from-orange-50/50 via-white to-white overflow-hidden">
        <div className="container mx-auto px-4 relative">

          {/* Badge Flottant "Héros" */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-bold border border-orange-200 shadow-sm">
              <TrendingUp className="w-4 h-4" />
              Optimisez vos conversions dès maintenant
            </span>
          </div>

          <div className="max-w-5xl mx-auto text-center z-10 relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Ne laissez plus vos clients <br className="hidden sm:block" />
              <span className="text-ofika-orange underline decoration-4 decoration-orange-200">s'échapper</span>.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Vos abonnés TikTok & Instagram abandonnent face à la difficulté de vous contacter.
              <br className="hidden sm:block" />
              <span className="block mt-2 font-medium text-gray-900">Adoptez la <span className="text-purple-600">Carte de Visite Numérique</span> (NFC + QR) qui convertit vos prospects en un clic.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg sm:max-w-none mx-auto">
              <Link href="/get-started" className="w-full sm:w-auto">
                <Button size="lg" className="bg-ofika-orange hover:bg-ofika-orange/90 text-white text-lg sm:text-xl font-bold px-8 py-6 w-full sm:w-auto shadow-xl shadow-orange-500/30 transform hover:-translate-y-1 transition-all rounded-xl">
                  Créer mon lien gratuit
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>
              <button onClick={() => scrollToSection('demo')} className="w-full sm:w-auto group">
                <div className="flex items-center justify-center gap-3 px-8 py-6 rounded-xl border-2 border-gray-200 hover:border-ofika-orange/50 hover:bg-orange-50 transition-all">
                  <Play className="w-5 h-5 text-gray-700 group-hover:text-ofika-orange fill-current" />
                  <span className="text-lg font-bold text-gray-700 group-hover:text-ofika-orange">Voir comment ça marche</span>
                </div>
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Gratuit à vie</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Configuration en 2 minutes</span>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* PAIN POINT SECTION : STORYTELLING (Le Cauchemar) */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Visuel "Le Cauchemar" */}
              <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
                <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                  <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                  <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

                  {/* Écran Simulé : Friction */}
                  <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative flex flex-col pt-12">
                    {/* Header Tiktok fake */}
                    <div className="px-4 pb-2 border-b flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="h-4 w-20 bg-gray-100 rounded"></div>
                    </div>

                    {/* Bio Profile */}
                    <div className="p-4 flex flex-col items-center border-b pb-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mb-2"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="text-center text-sm text-gray-500 mb-4 px-2">
                        👗 Vendeuse de robes chics<br />
                        👇 Contactez-moi ici :<br />
                        <span className="bg-yellow-100 px-1 border border-dashed border-red-300 font-mono text-xs">07 09 11 22 33</span>
                      </div>
                      <div className="w-full bg-gray-100 h-10 rounded flex items-center justify-center text-gray-400 text-sm">
                        Pas de lien...
                      </div>
                    </div>

                    {/* Action Lente : Simulation */}
                    <div className="p-4 flex-1 bg-red-50/50 relative">
                      {/* Étapes frustration */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">1</div>
                          <div className="text-xs text-gray-600">Copier le numéro...</div>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">2</div>
                          <div className="text-xs text-gray-600">Quitter l'appli...</div>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">3</div>
                          <div className="text-xs text-gray-600">Ouvrir Contacts...</div>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">4</div>
                          <div className="text-xs text-gray-600">Enregistrer "Vendeuse Robe"...</div>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">5</div>
                          <div className="text-xs text-gray-600">Ouvrir WhatsApp...</div>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-xs">6</div>
                          <div className="text-xs text-gray-600">Actualiser la liste...</div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl transform rotate-12 text-center border-4 border-white">
                            <div className="text-3xl font-bold mb-1">ABANDON !</div>
                            <div className="text-xs opacity-90">Trop long. Trop chiant.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Texte Storytelling */}
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-4 px-3 py-1 text-sm">Le scénario catastrophe</Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Vos clients veulent acheter.<br />
                  <span className="text-gray-400">Mais c'est trop compliqué.</span>
                </h2>

                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    Imaginez le parcours de votre client :
                  </p>
                  <ul className="space-y-3 font-medium">
                    <li className="flex items-center gap-2 text-red-500"><X className="w-5 h-5" /> Il doit copier votre numéro.</li>
                    <li className="flex items-center gap-2 text-red-500"><X className="w-5 h-5" /> Quitter Instagram/TikTok.</li>
                    <li className="flex items-center gap-2 text-red-500"><X className="w-5 h-5" /> Enregistrer un nouveau contact.</li>
                    <li className="flex items-center gap-2 text-red-500"><X className="w-5 h-5" /> Attendre que WhatsApp s'actualise...</li>
                  </ul>

                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <span className="block font-bold text-red-700 mb-1">RÉSULTAT : ABANDON.</span>
                    <p className="text-sm">C'est trop long. La flemme gagne toujours.</p>
                  </div>

                  <p className="font-bold text-gray-900 text-xl pt-2">
                    La solution ? <span className="text-ofika-orange">Un seul lien qui regroupe tout votre univers.</span>
                  </p>
                  <p className="text-base text-gray-500">
                    Site web, WhatsApp, Localisation, Catalogue... Tout est là, accessible en 1 clic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARGET AUDIENCE SECTION : POUR QUI ? */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-6 px-4 py-1.5 text-sm uppercase tracking-wide font-bold">
            C'est fait pour toi
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
            La solution ultime pour ceux qui veulent <br className="hidden md:block" /> <span className="text-ofika-orange">monétiser leur audience</span> et <span className="text-purple-600">marquer les esprits</span>.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Persona 1: Créateurs de Contenu */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group">
              <CardContent className="p-6 text-center pt-10">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform">
                  📹
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Créateurs de Contenu</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  TikTok, YouTube, Insta. Centralise tous tes liens. Ne perds plus tes abonnés entre tes différentes plateformes.
                </p>
              </CardContent>
            </Card>

            {/* Persona 2: Influenceurs */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group">
              <CardContent className="p-6 text-center pt-10">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Influenceurs</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Collabore avec des marques ? Affiche ton kit média, tes promos et ton contact pro en un clic. Professionnalisme = Gros contrats.
                </p>
              </CardContent>
            </Card>

            {/* Persona 3: Solo-Entrepreneurs */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group">
              <CardContent className="p-6 text-center pt-10">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solo-Entrepreneurs</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tu vends sur WhatsApp ? Simplifie la vie de tes clients. Un lien "Commander" qui ouvre WhatsApp, c'est +30% de ventes.
                </p>
              </CardContent>
            </Card>

            {/* Persona 4: Freelances */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-50 hover:bg-orange-50/50 group">
              <CardContent className="p-6 text-center pt-10">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform">
                  💻
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Freelances</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  En networking physique, sors ta carte NFC. "Bip", tes infos sont chez ton prospect. Effet "Wow" garanti et contrat signé.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION : LA RÉVÉLATION */}
      <section id="solution" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
              La solution <span className="ofika-text-gradient">Anti-Friction</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofika transforme ton profil en autoroute vers la vente. Un seul lien, zéro effort pour tes clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Link-in-Bio */}
            <Card className="border-2 border-transparent hover:border-ofika-orange/20 shadow-lg hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8 text-center bg-gradient-to-b from-white to-gray-50/50">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <LinkIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lien Bio Universel</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tes clients cliquent. Ils voient tout : WhatsApp, Boutique, Facebook, Map. <strong className="text-gray-900">Tout est accessible en 1 clic.</strong>
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: WhatsApp Direct */}
            <Card className="border-2 border-ofika-orange shadow-2xl scale-105 z-10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ofika-orange text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                Le plus important
              </div>
              <CardContent className="p-8 text-center bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                  <Smartphone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">WhatsApp Direct</h3>
                <p className="text-gray-600 leading-relaxed">
                  Fini d'enregistrer les numéros. Un bouton "WhatsApp", ça ouvre la conversation directement. <strong className="text-gray-900">Conversion x3 immédiate.</strong>
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: Digital Business Card NFC/QR */}
            <Card className="border-2 border-transparent hover:border-ofika-orange/20 shadow-lg hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8 text-center bg-gradient-to-b from-white to-gray-50/50">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Carte de Visite Numérique</h3>
                <p className="text-gray-600 leading-relaxed">
                  Le duo gagnant <strong className="text-gray-900">QR Code + Carte NFC</strong>. Partagez votre profil instantanément en ligne ou en personne. <strong className="text-gray-900">Plus professionnelle, plus écologique, plus efficace.</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HYBRID SECTION : LE MEILLEUR DES DEUX MONDES */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mb-4 px-3 py-1 text-sm font-bold">Hybride : Physique + Digital</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Le QR Code pour <span className="text-ofika-orange">l'écran</span>.<br />
                La Carte NFC pour <span className="text-purple-600">la main</span>.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Pourquoi choisir ? Ofika vous donne le meilleur des deux technologies pour ne rater aucune opportunité de connexion.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-6 h-6 text-ofika-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">QR Code Téléchargeable</h4>
                    <p className="text-sm text-gray-600">Imprimez-le sur vos packagings, vitrines ou flyers. Un scan et vos clients sont sur votre profil.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wifi className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Carte NFC Professionnelle</h4>
                    <p className="text-sm text-gray-600">Posez votre carte sur le téléphone de votre prospect. Vos infos s'enregistrent en 1 seconde. Effet garanti.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-100 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-50 rounded-full"></div>
                  </div>
                  <QrCode className="w-16 h-16 text-gray-200" />
                </div>

                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 relative flex flex-col justify-end">
                  <div className="absolute top-4 right-4">
                    <Wifi className="w-8 h-8 text-white/20 animate-pulse-slow" />
                  </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="py-20 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <Badge className="bg-ofika-orange text-white px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block animate-pulse">
                Simulation Gratuite
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Essayez avec vos <br /> <span className="text-ofika-orange">propres infos</span>.
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Ne nous croyez pas sur parole.
                <strong className="text-white block mt-2">Remplissez le formulaire à droite 👉</strong>
                et regardez votre carte professionnelle se créer sous vos yeux. C'est magique.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Analytics Inclus</h4>
                    <p className="text-gray-500 text-sm">Sache combien de personnes cliquent sur tes liens.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">QR Code Dynamique</h4>
                    <p className="text-gray-500 text-sm">Modifie tes liens sans réimprimer ton QR code.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/get-started">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 w-full sm:w-auto text-lg">
                    Je valide mon design
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              {/* Embed Interactive Card Component */}
              <div className="transform scale-90 sm:scale-100">
                <InteractiveBusinessCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-orange-50/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Ils ne perdent plus de clients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="flex text-yellow-500 mb-4 text-lg">★★★★★</div>
              <p className="text-gray-600 mb-6 leading-relaxed italic">
                "Avant, je recevais plein de questions en DM mais peu de ventes. Depuis que j'ai mis mon lien Ofika, les gens m'écrivent direct sur WhatsApp pour commander. C'est magique."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">S</div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah K.</h4>
                  <p className="text-xs text-gray-500">Boutique de mèches, Abidjan</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="flex text-yellow-500 mb-4 text-lg">★★★★★</div>
              <p className="text-gray-600 mb-6 leading-relaxed italic">
                "J'ai arrêté de répéter 'mon numéro est dans le post'. Je dis juste 'lien en bio'. Ça fait tellement plus pro, mes clients ont confiance."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">M</div>
                <div>
                  <h4 className="font-bold text-gray-900">Marc doumbia</h4>
                  <p className="text-xs text-gray-500">Coach Sportif, Cocody</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
              <div className="flex text-yellow-500 mb-4 text-lg">★★★★★</div>
              <p className="text-gray-600 mb-6 leading-relaxed italic">
                "La carte NFC c'est un game changer en soirée networking. Je la sors, je touche le téléphone, et bam, mes infos sont là. Tout le monde est impressionné."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">J</div>
                <div>
                  <h4 className="font-bold text-gray-900">Jean-Yves</h4>
                  <p className="text-xs text-gray-500">Consultant Immobilier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Des tarifs adaptés à <span className="text-ofika-orange">votre ambition</span>.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Pas de frais cachés. Annulable à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-none mx-auto">
            {/* PLAN GRATUIT */}
            <Card className="bg-gray-800 border-gray-700 text-white shadow-xl hover:border-gray-600 transition-all">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-6">
                  <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600 mb-3 px-3 py-1">Découverte</Badge>
                  <h3 className="text-xl font-bold mb-2">Gratuit</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-white">0 <span className="text-lg font-bold">FCFA</span></span>
                    <span className="text-gray-400 text-xs mb-1">/ vie</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Page perso avec votre URL</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>2 Designs de page</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>1 Carte NFC virtuelle</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>7 QR Statiques / 2 Dyn.</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>2 Liens d'avis (Max 50)</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Analytics (15 jours)</span>
                  </li>
                </ul>

                <Link href="/get-started" className="block w-full mt-auto">
                  <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-900 hover:bg-gray-700 hover:text-white font-bold h-10 rounded-xl">
                    Commencer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* PLAN PREMIUM */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-ofika-orange border-2 relative overflow-hidden shadow-2xl z-10">
              <div className="absolute top-0 right-0 bg-ofika-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                Recommandé
              </div>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-orange-900/50 text-ofika-orange border-ofika-orange/20 px-3 py-1 text-xs">Premium</Badge>
                    <Badge className="bg-blue-600 text-white border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">BETA</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-white">1.000 <span className="text-lg font-bold">FCFA</span></span>
                    <span className="text-gray-400 text-xs mb-1">/ mois</span>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-ofika-orange font-medium leading-tight">
                      🚧 En cours de développement. Seul le plan Gratuit et l'achat de carte NFC sont actifs pour le moment.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Tout du plan Gratuit +</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>7 QR Codes dynamiques</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>8 Designs Premium</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>3 Pages Link-in-Bio</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Avis illimités + Anti-Fake</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>20 Liens d'avis clients</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Stats avancées (90 j)</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Géo-localisation des scans</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>3 Cartes NFC virtuelles</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>50 envois d'e-mails / mois</span>
                  </li>
                  <li className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Carte NFC physique (payant)</span>
                  </li>
                </ul>

                <div className="mt-auto">
                  <Button disabled size="sm" className="w-full bg-gray-700 text-gray-400 cursor-not-allowed font-bold h-10 rounded-xl">
                    Bientôt Disponible
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PLAN BUSINESS */}
            <Card className="bg-gray-800 border-purple-500/30 border text-white shadow-xl hover:border-purple-500/50 transition-all">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-900/30 text-purple-400 border-purple-500/20 px-3 py-1">Entreprise</Badge>
                    <Badge className="bg-blue-600 text-white border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">BETA</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Business</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-white">3.000 <span className="text-lg font-bold">FCFA</span></span>
                    <span className="text-gray-400 text-xs mb-1">/ mois</span>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-purple-300 font-medium leading-tight">
                      🚧 En cours de développement. Seul le plan Gratuit et l'achat de carte NFC sont actifs pour le moment.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Tout du plan Pro +</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Vendre produits numériques illimités</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Paiement direct sur votre page</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Domaine personnalisé (URL propre)</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>URLs produits & Affiliation</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>V-NFC & Pages illimitées</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Marque Blanche complète</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Stats à vie + Export CSV</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Support Dédié</span>
                  </li>
                </ul>

                <div className="mt-auto">
                  <Button disabled size="sm" variant="outline" className="w-full border-gray-700 text-gray-500 cursor-not-allowed font-bold h-10 rounded-xl">
                    Bientôt Disponible
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARTE PHYSIQUE standalone */}
            <Card className="bg-white border-2 border-gray-100 text-gray-900 shadow-xl hover:border-ofika-orange/30 transition-all group overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-purple-600"></div>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="mb-6 text-center">
                  <Badge className="bg-gray-100 text-gray-600 mb-3 px-3 py-1">Édition Physique</Badge>
                  <h3 className="text-xl font-bold mb-2">Carte NFC Ofika</h3>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">11.850 <span className="text-lg font-bold">FCFA</span></span>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tighter">Achat Unique • Sans Abonnement</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-center group-hover:bg-orange-50 transition-colors">
                  <CreditCard className="w-12 h-12 text-gray-400 group-hover:text-ofika-orange transition-colors" />
                </div>

                <ul className="space-y-3 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Profil Ofika Inclus</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Puce NFC ultra-sensible</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>QR Code gravé au dos</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-ofika-orange flex-shrink-0" />
                    <span>Livraison rapide</span>
                  </li>
                </ul>

                <Link href="/get-started" className="block w-full mt-auto">
                  <Button size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-12 rounded-xl shadow-lg group-hover:bg-ofika-orange transition-colors">
                    Acheter la carte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Besoin de cartes NFC physiques ? Elles sont disponibles à l'achat une fois votre compte créé.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-6 px-4 py-1.5 text-sm uppercase tracking-wide font-bold">
              Notre Mission
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Digitaliser le commerce en Afrique,<br /> une connexion à la fois.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Ofika est né d'un constat simple à Abidjan : trop de ventes se perdent parce que partager ses contacts est compliqué.
              Nous sommes une équipe de passionnés (développeurs, designers, marketeurs) déterminés à donner aux entrepreneurs africains les outils "No-Code" les plus puissants du monde.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Notre but ? Que chaque vendeur, du grand magasin au freelance, puisse avoir une présence professionnelle en 2 minutes chrono.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            Questions Fréquentes
          </h2>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="bg-white rounded-xl border border-gray-100 px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-bold text-gray-900 py-6 hover:no-underline hover:text-ofika-orange">
                  C'est vraiment gratuit ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Oui, l'offre de lien en bio (SmartLink) est <strong className="text-gray-900">100% gratuite à vie</strong>. Vous pouvez créer votre page, ajouter vos liens et recevoir des commandes sans rien payer. Nous proposons des options payantes (comme la Carte NFC ou des thèmes premium) uniquement si vous voulez aller plus loin.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white rounded-xl border border-gray-100 px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-bold text-gray-900 py-6 hover:no-underline hover:text-ofika-orange">
                  Comment fonctionne la carte NFC ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  C'est magique ! La carte contient une puce sans contact. Il suffit de l'approcher du haut d'un iPhone ou du dos d'un smartphone Android pour que votre profil s'ouvre instantanément. <strong className="text-gray-900">Votre interlocuteur n'a pas besoin d'installer d'application.</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white rounded-xl border border-gray-100 px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-bold text-gray-900 py-6 hover:no-underline hover:text-ofika-orange">
                  J'ai déjà un site (ou Linktree), pourquoi changer ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Ofika n'est pas juste une liste de liens, c'est un outil de <strong className="text-gray-900">conversion</strong>. Nous intégrons WhatsApp nativement, nous avons des designs pensés pour la vente, et nous offrons le duo "Digital + Physique" avec la carte NFC. C'est beaucoup plus professionnel pour votre image de marque.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white rounded-xl border border-gray-100 px-6 shadow-sm">
                <AccordionTrigger className="text-lg font-bold text-gray-900 py-6 hover:no-underline hover:text-ofika-orange">
                  Puis-je modifier mes infos après ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Absolument ! C'est l'avantage du système Ofika. Vous modifiez votre numéro, votre promo ou votre photo sur votre tableau de bord, et c'est mis à jour <strong className="text-gray-900">instantanément</strong> sur votre lien et votre carte NFC. Vous n'avez jamais besoin de réimprimer quoi que ce soit.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-ofika-orange to-red-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 max-w-4xl mx-auto leading-tight">
            Passez à la <span className="text-gray-900">Carte de Visite Numérique</span> dès aujourd'hui.
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Tes concurrents s'y mettent. Ne sois pas le dernier à comprendre que la friction tue le business.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-white text-ofika-orange hover:bg-gray-100 text-xl font-bold px-12 py-8 rounded-xl shadow-2xl transform hover:-translate-y-1 transition-all">
              Je veux mon lien Ofika maintenant
            </Button>
          </Link>
          <p className="mt-6 text-sm text-white/80 opacity-75">
            Pas de carte bancaire requise • Annulable à tout moment
          </p>
        </div>
      </section>

      {/* Footer enrichi */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Colonne 1: Branding */}
            <div className="space-y-6">
              <Logo size="md" showText variant="white" />
              <p className="text-sm leading-relaxed max-w-xs">
                La solution Nº1 en Afrique pour digitaliser votre présence professionnelle et convertir vos prospects instantanément.
              </p>
              <div className="flex gap-4">
                <Link href="https://www.facebook.com/profile.php?id=61583402783024" className="hover:text-ofika-orange transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="https://www.instagram.com/chris.co0/" className="hover:text-ofika-orange transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="https://www.linkedin.com/company/ofikacard/" className="hover:text-ofika-orange transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="https://wa.me/2250503681588?text=Bonjour%20Ofika,%20je%20vous%20contacte%20depuis%20votre%20site%20web%20(Contact)." className="hover:text-ofika-orange transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link href="https://www.tiktok.com/@ofika.ci" className="hover:text-ofika-orange transition-colors">
                  <Music2 className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Colonne 2: Nos Services */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Nos Services</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="https://orla-nou.vercel.app/" className="hover:text-white transition-colors">Orla_nou Automatication</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Menly - Menu Digital</Link>
                </li>
                <li>
                  <Link href="/get-started" className="hover:text-white transition-colors">Cartes de Visite NFC</Link>
                </li>

              </ul>
            </div>

            {/* Colonne 3: Partenaires & Écosystème */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Écosystème</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="https://www.bloop-ci.com/" className="hover:text-white transition-colors">Bloop Marketplace</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Programmes d'Affiliation</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Solutions Entreprises</Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4: Aide */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Aide & Support</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="mailto:krsidoine7@gmail.com?subject=[OFIKA-SITE]%20Support%20Client&body=Bonjour,%20je%20vous%20contacte%20depuis%20le%20site%20Ofika%20(Support)." className="hover:text-white transition-colors">Support Client (E-mail)</Link>
                </li>
                <li>
                  <Link href="https://wa.me/2250503681588?text=Bonjour%20Ofika,%20j'ai%20besoin%20d'une%20assistance%20via%20le%20site%20(Support)." className="hover:text-white transition-colors">Support WhatsApp / Msg</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-xs">© 2024 Ofika. Tous droits réservés. Digitalizing Africa.</span>
            <div className="flex gap-6 text-xs italic">
              Simple. Rapide. Professionnel.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}