import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Video } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RatingStars } from './RatingStars'
import { cn } from '@/lib/utils'

export interface PublicReview {
    id: string
    rating: number
    comment?: string
    client_name?: string
    created_at: string
    media_url?: string
    media_type?: 'image' | 'video'
}

interface PublicReviewCardProps {
    review: PublicReview
    className?: string
}

export function PublicReviewCard({ review, className }: PublicReviewCardProps) {
    return (
        <Card className={cn('flex-shrink-0 w-[280px] sm:w-[320px] snap-center bg-white border border-gray-100 shadow-sm', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <RatingStars value={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                    </span>
                </div>
                {review.client_name && (
                    <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                        {review.client_name}
                    </p>
                )}
            </CardHeader>
            <CardContent className="pb-4 text-sm text-gray-600">
                {review.comment && (
                    <p className="line-clamp-4 italic">"{review.comment}"</p>
                )}
                {review.media_url && (
                    <div className="mt-3 relative rounded-md overflow-hidden bg-gray-50 aspect-video w-full border border-gray-100">
                        {review.media_type === 'image' ? (
                            <img src={review.media_url} alt="Avis client" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Video className="h-8 w-8 text-gray-300" />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
