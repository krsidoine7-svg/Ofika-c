import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs DotMe | La solution Premium de lien en bio et carte intelligente',
  description: 'Changez de DotMe pour Ofika, l\'outil de création de lien bio et de carte NFC leader du marché pour les entrepreneurs créatifs.',
  openGraph: {
    title: 'Le choix Pro : Ofika vs DotMe',
    description: 'Une plateforme performante et esthétique pour gérer vos réseaux sociaux et vos contacts.',
    type: 'website',
  }
}

export default function AlternativeDotmePage() {
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
            <Sparkles className="w-4 h-4" /> Comparatif Lien en bio
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Pourquoi abandonner <span className="text-neutral-500 line-through">DotMe</span> pour <br className="hidden md:block" />
            <span className="text-orange-500">Ofika.ci</span> ?
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            La véritable alternative à DotMe : <strong className="text-white">Ofika.</strong> Contrôlez votre Link-in-Bio avec une interface sombre, pro, et une interactivité NFC fulgurante.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Adopter Ofika <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
