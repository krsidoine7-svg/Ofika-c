import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs Beacons | La meilleure plateforme NFC pour les Créateurs',
  description: 'Vous cherchez une alternative à Beacons ? Découvrez Ofika : la solution combinant un Link-in-Bio premium avec une carte NFC physique pour les professionnels créatifs.',
  openGraph: {
    title: 'Ofika vs Beacons : L\'Alternative Ultime',
    description: 'Une vraie carte NFC interactive, un design personnalisable, tout votre portfolio dans votre poche.',
    type: 'website',
  }
}

export default function AlternativeBeaconsPage() {
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
            <Sparkles className="w-4 h-4" /> Comparatif 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Ofika : l'alternative haut de gamme à <br className="hidden md:block" />
            <span className="text-neutral-500 line-through">Beacons</span> pour créateurs
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Beacons vous aide à vendre des e-books. <strong className="text-white">Ofika vous aide à bâtir un empire.</strong> 
            Nous avons épuré l'expérience pour vous laisser l'essentiel : un design qui impressionne vos clients pro et une <strong className="text-white">Carte NFC physique</strong> pour vos soirées networking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding/public-page" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get Started with Ofika <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#comparatif" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-all"
            >
              Pourquoi changer de Beacons ?
            </Link>
          </div>
        </section>

        <section id="comparatif" className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800">
              <h3 className="text-2xl font-bold mb-6 text-neutral-400">Beacons.ai</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Orienté Boutique</strong>
                    Pensé principalement pour vendre des e-books ou des services, moins pour le networking professionnel B2B.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Surcharge d'outils inutiles</strong>
                    Outils marketing complexes à configurer alors que vous souhaitez simplement présenter votre identité.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">100% Web</strong>
                    Pas d'intégration native ni de Carte NFC connectée physique pour se démarquer en face-à-face.
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Ofika (Pour Créatifs Pros)</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Impact NFC Instantané</strong>
                    <span className="text-neutral-400">Lors d'un événement créatif ou d'une expo, un simple contact de votre carte distribue votre book ou profil.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Épure et Focus</strong>
                    <span className="text-neutral-400">Pas de modules complexes. Uniquement ce dont les réalisateurs, designers et indépendants ont besoin : afficher leur travail avec classe.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Flexibilité totale</strong>
                    <span className="text-neutral-400">Modifiez ce qu'affiche votre code QR Ofika en un seul clic sur votre tableau de bord.</span>
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
