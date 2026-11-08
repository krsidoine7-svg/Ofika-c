'use client'

import { useState, useEffect } from 'react'
import { VerifiedReviewCard } from './VerifiedReviewCard'
import { SupportTicket, getFeaturedPublicReviews } from '@/lib/services/support-tickets'
import { ShieldCheck, Sparkles, MessageSquare } from 'lucide-react'

export function VerifiedReviewsSection() {
  const [reviews, setReviews] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadReviews() {
      try {
        const res = await getFeaturedPublicReviews()
        if (isMounted) {
          if (res.success && res.data && res.data.length > 0) {
            setReviews(res.data)
          } else {
            setReviews([])
          }
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors du chargement des avis publics:', err)
        if (isMounted) setReviews([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  // S'il n'y a pas d'avis réels en base de données ou pendant le chargement, la section est masquée
  if (isLoading || !reviews || reviews.length === 0) {
    return null
  }

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-orange-50/25 via-white to-gray-50/30 relative overflow-hidden">
      {/* Éléments de décor chaleureux aux couleurs de la marque Ofika */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Titre & En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-xs sm:text-sm font-bold mb-4 border border-orange-200/80 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>TÉMOIGNAGES & AVIS CLIENTS VÉRIFIÉS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Ce que nos membres{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              disent d'Ofika
            </span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Découvrez les retours d'expérience des professionnels, entrepreneurs et entreprises qui utilisent nos cartes NFC et profils professionnels au quotidien.
          </p>
        </div>

        {/* Grille des cartes d'avis réels */}
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
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Avis 100% authentifiés par le réseau Ofika</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <span>Partagez vous aussi votre expérience depuis votre Dashboard</span>
          </div>
        </div>
      </div>
    </section>
  )
}
