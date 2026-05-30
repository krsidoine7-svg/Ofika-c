import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs Milkshake | Le site web et la carte NFC des Influenceurs',
  description: 'Milkshake est dépassé. Ofika propose la création de votre lien bio premium et de votre carte de visite intelligente NFC gratuite pour élever votre réseau social et pro en physique.',
  openGraph: {
    title: 'Une vraie plateforme : Ofika vs Milkshake',
    description: 'Créez votre carte NFC interactive et centralisez vos contenus sociaux en 2 minutes.',
    type: 'website',
  }

}

export default function AlternativeMilkshakePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter">
            OFIKA<span className="text-orange-500">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/onboarding" className="text-sm font-medium hover:text-orange-400 transition-colors">
              Créer mon profil gratuit
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <section className="container mx-auto px-4 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Comparatif NFC Influenceurs
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Ofika, la meilleure alternative à <br className="hidden md:block" />
            <span className="text-neutral-500 line-through">Milkshake app</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Mettez à jour votre image de marque. Ne vous contentez pas d'un simple site web mobile créé sur Milkshake. Ajoutez une dimension physique inégalée avec la <strong className="text-white">technologie NFC Ofika</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Remplacer Milkshake <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
