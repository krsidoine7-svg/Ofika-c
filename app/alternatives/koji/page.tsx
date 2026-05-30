import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ofika vs Koji | L\'alternative NFC à la plateforme de lien',
  description: 'Avec la fermeture ou l\'évolution de Koji, trouvez votre nouvelle maison. Ofika vous permet de centraliser vos liens et d\'utiliser des cartes NFC pour un réseau 100% professionnel.',
  openGraph: {
    title: 'Migrer depuis Koji vers Ofika',
    description: 'Une plateforme stable, centrée sur le networking avec la technologie NFC gratuite.',
    type: 'website',
  }

}

export default function AlternativeKojiPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tighter">
            OFIKA<span className="text-orange-500">.</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/onboarding" className="text-sm font-medium hover:text-orange-400 transition-colors">
              Transférer mon profil
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <section className="container mx-auto px-4 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Migration Koji vers Ofika
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            La meilleure alternative à <br className="hidden md:block" />
            <span className="text-neutral-500 line-through">Koji</span> en 2026
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            La plateforme Koji change, mais votre réseau ne doit pas s'arrêter. Transférez facilement vos liens vers Ofika, et bénéficiez en plus du <strong className="text-white">partage instantané NFC</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Rejoindre Ofika <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
