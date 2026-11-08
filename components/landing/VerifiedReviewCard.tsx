'use client'

import { Star, CheckCircle2, Quote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SupportTicket } from '@/lib/services/support-tickets'

interface VerifiedReviewCardProps {
  review: Partial<SupportTicket> & {
    author_name?: string
    author_role?: string
    author_location?: string
    author_avatar_url?: string
    rating?: number
    description?: string
  }
  isFeaturedCard?: boolean
}

export function VerifiedReviewCard({ review, isFeaturedCard = false }: VerifiedReviewCardProps) {
  const rating = review.rating || 5
  const name = review.author_name || 'Client Ofika'
  const role = review.author_role || 'Utilisateur Vérifié'
  const location = review.author_location || 'Abidjan, CI'
  const avatarUrl = review.author_avatar_url
  const content = review.description || review.subject || ''

  return (
    <div className={`
      relative bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-300
      ${isFeaturedCard 
        ? 'border-2 border-orange-500/80 shadow-2xl shadow-orange-500/10 ring-4 ring-orange-400/10' 
        : 'border border-gray-100 shadow-xl shadow-gray-900/5 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10'
      }
    `}>
      {/* Filigrane discret de guillemet aux couleurs Ofika */}
      <Quote className="w-12 h-12 text-orange-100/60 absolute top-4 right-4 pointer-events-none stroke-1" />

      <div>
        {/* En-tête : Étoiles et Badge Pilule "Client Vérifié" */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-100'
                }`}
              />
            ))}
          </div>

          <div className="bg-orange-50 text-orange-700 border border-orange-200/80 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Client Vérifié</span>
          </div>
        </div>

        {/* Corps de l'Avis */}
        <p className="text-gray-700 italic leading-relaxed text-sm sm:text-base my-2 relative z-10">
          "{content}"
        </p>
      </div>

      <div>
        {/* Séparateur horizontal discret */}
        <div className="w-full border-t border-gray-100 my-5" />

        {/* Pied de Carte : Auteur + Badge incrusté */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <Avatar className="w-11 h-11 border-2 border-orange-100 shadow-sm">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-orange-100 text-orange-800 font-bold text-sm">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Petit badge orange d'approbation au coin inférieur droit de l'avatar */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center border border-white shadow-sm">
              <CheckCircle2 className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">
              {name}
            </h4>
            <p className="text-xs text-orange-800/80 font-medium truncate">
              {role} {location ? `• ${location}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
