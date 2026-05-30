import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs Lnk.Bio | Changez pour une vraie carte NFC',
  description: 'Ne vous contentez plus d\'un lien classique. L\'alternative Ofika à Lnk.Bio modernise votre Link-in-Bio et l\'associe à une carte de visite intelligente NFC gratuite pour les professionnels.',
  openGraph: {
    title: 'Grosse mise à niveau : Ofika vs Lnk.Bio',
    description: 'Une vraie carte NFC interactive, un design personnalisable, tout votre portfolio dans votre poche.',
    type: 'website',
  }
}

export default function AlternativeLnkbioPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter">
            OFIKA<span className="text-orange-500">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/onboarding" className="text-sm font-medium hover:text-orange-400 transition-colors">
              Créer mon profil
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <section className="container mx-auto px-4 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Comparatif NFC 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Pourquoi <span className="text-neutral-500 line-through">Lnk.Bio</span> ne suffit plus. <br className="hidden md:block" />
            <span className="text-orange-500">Ofika</span> est l'avenir du Networking.
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Lnk.Bio centralise vos liens. <strong className="text-white">Ofika centralise votre prestige.</strong> 
            Ne vous contentez plus d'une liste de boutons. Passez à la vitesse supérieure avec la seule plateforme qui fusionne le <strong className="text-white">digital (bio) et le physique (NFC)</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding/public-page" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get My Pro Ofika Card <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <section id="comparatif" className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800">
              <h3 className="text-2xl font-bold mb-6 text-neutral-400">Le problème avec Lnk.Bio</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Design trop strict</strong>
                    Des profils qui se ressemblent tous, cassant l'image de marque d'un artiste ou d'un créateur ambitieux.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Déconnecté du monde réel</strong>
                    Pas d'éco-système physique intelligent. Vous devez toujours partager votre QR Lnk.bio à la main ou chercher sur Instagram.
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />
              <h3 className="text-2xl font-bold mb-6 text-orange-400">La solution Ofika</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Technologie de Pointe (NFC)</strong>
                    <span className="text-neutral-400">Votre téléphone devient votre carte de visite. Le client approche son iPhone ou Android, et s'abonne à vous. Magique et immédiat.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">L'Esthétisme Avant Tout</strong>
                    <span className="text-neutral-400">En tant que créatif, votre interface doit impressionner. Ofika offre un rendu premium "Application native".</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
