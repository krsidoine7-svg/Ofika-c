'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, X, Clock, Image as ImageIcon, Video } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RatingStars } from './RatingStars'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Review } from '@/lib/hooks/useReviews'

// ========================================
// TYPES
// ========================================

interface ReviewCardProps {
    review: Review
    onApprove?: (id: string) => void
    onReject?: (id: string) => void
    onDelete?: (id: string) => void
    showActions?: boolean
    className?: string
}

// ========================================
// COMPONENT
// ========================================

export function ReviewCard({
    review,
    onApprove,
    onReject,
    onDelete,
    showActions = true,
    className,
}: ReviewCardProps) {
    const statusConfig = {
        pending: {
            label: 'En attente',
            variant: 'secondary' as const,
            color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        },
        approved: {
            label: 'Approuvé',
            variant: 'success' as const,
            color: 'text-green-700 bg-green-50 border-green-200',
        },
        rejected: {
            label: 'Rejeté',
            variant: 'destructive' as const,
            color: 'text-red-700 bg-red-50 border-red-200',
        },
    }

    const status = statusConfig[review.moderation_status]

    return (
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <RatingStars value={review.rating} readonly size="sm" />
                            <Badge className={status.color} variant="outline">
                                {status.label}
                            </Badge>
                            {review.is_verified && (
                                <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                                    <Check className="mr-1 h-3 w-3" />
                                    Vérifié
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {review.client_name && (
                                <span className="font-medium text-gray-700">
                                    {review.client_name}
                                </span>
                            )}
                            {review.client_email && (
                                <>
                                    <span>•</span>
                                    <span className="text-xs">{review.client_email}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {review.moderation_status === 'pending' && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onApprove?.(review.id)}
                                            className="text-green-600"
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Approuver
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onReject?.(review.id)}
                                            className="text-red-600"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Rejeter
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {review.moderation_status === 'approved' && (
                                    <DropdownMenuItem
                                        onClick={() => onReject?.(review.id)}
                                        className="text-yellow-600"
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Mettre en attente
                                    </DropdownMenuItem>
                                )}
                                {review.moderation_status === 'rejected' && (
                                    <DropdownMenuItem
                                        onClick={() => onApprove?.(review.id)}
                                        className="text-green-600"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approuver
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(review.id)}
                                    className="text-red-600"
                                >
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {review.comment && (
                <CardContent className="pb-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        "{review.comment}"
                    </p>
                </CardContent>
            )}

            {review.media_url && (
                <CardContent className="pb-3">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video max-w-sm">
                        {review.media_type === 'image' ? (
                            <img
                                src={review.media_url}
                                alt="Média client"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Video className="h-12 w-12 text-gray-400" />
                                <span className="ml-2 text-sm text-gray-500">Vidéo</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}

            <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>
                            {formatDistanceToNow(new Date(review.created_at), {
                                addSuffix: true,
                                locale: fr,
                            })}
                        </span>
                        {review.has_purchase && (
                            <Badge variant="outline" className="text-xs">
                                Achat vérifié
                            </Badge>
                        )}
                    </div>

                    {!review.is_public && (
                        <Badge variant="outline" className="text-xs">
                            Privé
                        </Badge>
                    )}
                </div>
            </CardFooter>

            {review.moderation_note && (
                <CardFooter className="pt-0">
                    <div className="w-full bg-gray-50 rounded-md p-2">
                        <p className="text-xs text-gray-600">
                            <strong>Note de modération :</strong> {review.moderation_note}
                        </p>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
