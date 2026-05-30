import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs Linktree | La meilleure alternative pour les Créatifs',
  description: 'Pourquoi passer de Linktree à Ofika ? Découvrez la plateforme ultime avec Link in Bio dynamique et carte NFC physique. Conçue par et pour les créatifs.',
  openGraph: {
    title: 'Ofika vs Linktree : L\'Alternative Ultime',
    description: 'Une vraie carte NFC interactive, un design personnalisable, tout votre portfolio dans votre poche.',
    type: 'website',
  }
}

export default function AlternativeLinktreePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      {/* Navbar simplifiée */}
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
        {/* H1 Hero Section */}
        <section className="container mx-auto px-4 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Comparatif 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Pourquoi <span className="text-orange-500">Ofika</span> est la meilleure <br className="hidden md:block" />
            alternative à <span className="text-neutral-500 line-through">Linktree</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Linktree affiche vos liens. <strong className="text-white">Ofika vend votre talent.</strong> 
            Finissez-en avec les profils génériques. Offrez-vous la seule plateforme ivoirienne qui associe un <strong className="text-white">Lian-in-Bio premium</strong> à une véritable <strong className="text-white">Carte NFC de Pro</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding/public-page" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get My Free Ofika Card <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#comparatif" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-all"
            >
              Voir le comparatif
            </Link>
          </div>
        </section>

        {/* Comparatif SEO SEO SEO */}
        <section id="comparatif" className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Colonne Linktree (Désavantage) */}
            <div className="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800">
              <h3 className="text-2xl font-bold mb-6 text-neutral-400">Le vieux modèle</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Digital uniquement</strong>
                    Aucune présence physique lors de vos soirées networking.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Design limité</strong>
                    Une liste de boutons basique, difficile de se démarquer visuellement en tant que créatif.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-neutral-400 opacity-80">
                  <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <div>
                    <strong className="text-white block">Fonctionnalités cachées</strong>
                    Options intéressantes bloquées derrière un abonnement mensuel coûteux.
                  </div>
                </li>
              </ul>
            </div>

            {/* Colonne Ofika (Avantage) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />
              <h3 className="text-2xl font-bold mb-6 text-orange-400">L'approche Ofika</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Outil Hybride (Physique + Digital)</strong>
                    <span className="text-neutral-400">Partagez vos liens en ligne avec notre Link en bio stylisé, et en physique grâce à votre carte NFC Ofika.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Conçu pour le Portfolio</strong>
                    <span className="text-neutral-400">Intégrez vos vidéos YouTube, vos musiques Spotify, ou vos galeries visuelles directement dans votre bio.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-lg mb-1">Code QR Dynamique</strong>
                    <span className="text-neutral-400">Mettez à jour vos liens à tout moment, le QR code de votre carte reste toujours le même.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* Features visuelles */}
        <section className="container mx-auto px-4 mt-32 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Expérience Mobile</h4>
              <p className="text-neutral-400">Votre profil Ofika s'affiche comme une véritable application native sur le téléphone de vos contacts.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Partage Instantané</h4>
              <p className="text-neutral-400">Plus besoin d'épeler vos réseaux. Un simple passage de votre carte NFC Ofika et c'est partagé.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors group">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Design Créatif</h4>
              <p className="text-neutral-400">Démarquez-vous avec des thèmes sombres élégants, du glassmorphism et des animations premium.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
