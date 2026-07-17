'use client'

import { useEffect, useState } from 'react'
import { PublicReviewCard, PublicReview } from './PublicReviewCard'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublicReviewsSectionProps {
    profileId: string
    className?: string
}

export function PublicReviewsSection({ profileId, className }: PublicReviewsSectionProps) {
    const [reviews, setReviews] = useState<PublicReview[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profileId === 'preview') {
            setReviews([
                {
                    id: 'mock-1',
                    client_name: 'Sophie Koné',
                    rating: 5,
                    comment: 'Excellent service ! La carte NFC fonctionne à merveille et le profil est très professionnel.',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'mock-2',
                    client_name: 'Marc Kouadio',
                    rating: 5,
                    comment: 'Très satisfait de mon achat. Le design Bento est magnifique.',
                    created_at: new Date().toISOString()
                }
            ])
            setLoading(false)
            return
        }

        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/public/profiles/${profileId}/reviews`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setReviews(data.data || [])
            } catch (e) {
                console.error("Failed to fetch reviews:", e)
            } finally {
                setLoading(false)
            }
        }
        if (profileId) fetchReviews()
    }, [profileId])

    if (loading) return null // Or skeleton? User asked "ça s'affiche...". Better no flash if empty.
    if (reviews.length === 0) return null

    return (
        <div className={cn("w-full py-8", className)}>
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2 text-inherit">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Avis Clients
                </h3>
                <p className="text-sm opacity-80 mt-1">Ce qu'ils pensent de nous</p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative w-full">
                <div className="flex overflow-x-auto gap-4 pb-6 px-4 snap-x cursor-grab active:cursor-grabbing scrollbar-hide -mx-4 sm:mx-0 sm:px-0">
                    {reviews.map(review => (
                        <PublicReviewCard key={review.id} review={review} />
                    ))}
                    {/* Padding element for end of scroll */}
                    <div className="w-2 flex-shrink-0" />
                </div>
            </div>
        </div>
    )
}
