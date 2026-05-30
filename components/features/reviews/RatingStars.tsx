'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ========================================
// TYPES
// ========================================

interface RatingStarsProps {
    value: number
    onChange?: (value: number) => void
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

// ========================================
// COMPONENT
// ========================================

export function RatingStars({
    value,
    onChange,
    readonly = false,
    size = 'md',
    showLabel = false,
    className,
}: RatingStarsProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    }

    const labels: Record<number, string> = {
        1: 'Décevant 😞',
        2: 'Moyen 😐',
        3: 'Bien 🙂',
        4: 'Très bien 😊',
        5: 'Excellent ! 🤩',
    }

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating)
        }
    }

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= value
                    const isHoverable = !readonly

                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleClick(star)}
                            disabled={readonly}
                            className={cn(
                                'transition-all duration-200',
                                isHoverable && 'cursor-pointer hover:scale-110',
                                readonly && 'cursor-default'
                            )}
                            aria-label={`Note ${star} étoile${star > 1 ? 's' : ''}`}
                        >
                            <Star
                                className={cn(
                                    sizes[size],
                                    'transition-colors duration-200',
                                    isFilled
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200',
                                    isHoverable && 'hover:fill-yellow-300 hover:text-yellow-300'
                                )}
                            />
                        </button>
                    )
                })}
            </div>

            {showLabel && value > 0 && (
                <p className="text-sm font-medium text-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    {labels[value]}
                </p>
            )}
        </div>
    )
}

/**
 * Variante compacte pour affichage readonly
 */
export function RatingStarsCompact({
    value,
    count,
    className,
}: {
    value: number
    count?: number
    className?: string
}) {
    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            'h-4 w-4',
                            star <= value
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                        )}
                    />
                ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
                {value.toFixed(1)}
            </span>
            {count !== undefined && (
                <span className="text-sm text-gray-500">
                    ({count})
                </span>
            )}
        </div>
    )
}
