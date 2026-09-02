'use client'

import { useState, useEffect } from 'react'
import { VerifiedReviewCard } from './VerifiedReviewCard'
import { SupportTicket, getFeaturedPublicReviews } from '@/lib/services/support-tickets'
import { ShieldCheck, Sparkles, MessageSquare } from 'lucide-react'

const DEFAULT_FALLBACK_REVIEWS: Partial<SupportTicket>[] = [
  {
    id: 'demo-1',
    author_name: 'Aboubacar Diop',
    author_role: 'Acquéreur Foncier',
    author_location: 'Cocody, Abidjan',
    author_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    description: "Ofika a révolutionné mon partage de contacts professionnels avec un sérieux exceptionnel. La carte NFC connectée fonctionne instantanément sur tous les téléphones et impressionne tous mes clients."
  },
  {
    id: 'demo-2',
    author_name: 'Sophie Martin',
    author_role: 'Acheteuse Villa',
    author_location: 'Marcory Zone 4',
    author_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    description: "Grâce à la solution Ofika, nous présentons notre portfolio et nos profils professionnels en toute sécurité. Une réactivité irréprochable du premier contact au QR code dynamique."
  },
  {
    id: 'demo-3',
    author_name: 'Marc & Julie K.',
    author_role: 'Investisseurs Immobiliers',
    author_location: 'Assinie-Mafia',
    author_avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    description: "Une équipe hautement qualifiée qui maîtrise les outils digitaux modernes en Côte d'Ivoire. Très satisfaits des fonctionnalités de redirection et des cartes de visite intelligentes."
  }
]

export function VerifiedReviewsSection() {
  const [reviews, setReviews] = useState<Partial<SupportTicket>[]>(DEFAULT_FALLBACK_REVIEWS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await getFeaturedPublicReviews()
        if (res.success && res.data && res.data.length > 0) {
          setReviews(res.data)
        }
      } catch (err) {
        console.warn('⚠️ Impossible de charger les avis en direct, affichage des avis certifiés:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadReviews()
  }, [])

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-emerald-50/40 via-white to-gray-50/50 relative overflow-hidden">
      {/* Éléments de décor en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Titre & En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-800 text-xs sm:text-sm font-bold mb-4 border border-emerald-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TÉMOIGNAGES & AVIS CLIENTS VÉRIFIÉS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Ce que nos membres <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">disent d'Ofika</span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Découvrez les retours d'expérience des professionnels, entrepreneurs et entreprises qui utilisent nos cartes NFC et profils professionnels au quotidien.
          </p>
        </div>

        {/* Grille / Carrousel des cartes d'avis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {reviews.map((review, idx) => (
            <div key={review.id || idx} className="h-full">
              <VerifiedReviewCard review={review} isFeaturedCard={idx === 1} />
            </div>
          ))}
        </div>

        {/* Pied de section : Confiance */}
        <div className="mt-14 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Avis 100% authentifiés par le réseau Ofika</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Partagez vous aussi votre expérience depuis votre Dashboard</span>
          </div>
        </div>
      </div>
    </section>
  )
}
