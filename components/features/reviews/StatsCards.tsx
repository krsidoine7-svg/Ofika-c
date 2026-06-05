'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReviewLink } from '@/lib/hooks/useReviewLinks'

// ========================================
// TYPES
// ========================================

interface StatsCardsProps {
    links?: ReviewLink[]
    className?: string
}

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    trend?: number
    icon?: React.ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning'
}

// ========================================
// UTILS
// ========================================

function calculateGlobalStats(links?: ReviewLink[]) {
    if (!links || links.length === 0) {
        return {
            totalReviews: 0,
            avgRating: 0,
            positiveRate: 0,
            activeLinks: 0,
        }
    }

    const totalReviews = links.reduce((sum, link) =>
        sum + (link.stats?.total_reviews || 0), 0
    )

    const avgRating = links.reduce((sum, link) =>
        sum + (link.stats?.avg_rating || 0), 0
    ) / links.length

    const positiveRate = links.reduce((sum, link) =>
        sum + (link.stats?.positive_rate || 0), 0
    ) / links.length

    const activeLinks = links.filter(l => l.is_active).length

    return {
        totalReviews,
        avgRating: Number(avgRating.toFixed(2)),
        positiveRate: Number(positiveRate.toFixed(1)),
        activeLinks,
    }
}

// ========================================
// COMPONENTS
// ========================================

function StatCard({
    title,
    value,
    description,
    trend,
    icon,
    variant = 'default',
}: StatCardProps) {
    const variants = {
        default: 'border-gray-200 bg-white',
        primary: 'border-orange-200 bg-orange-50',
        success: 'border-green-200 bg-green-50',
        warning: 'border-yellow-200 bg-yellow-50',
    }

    const trendIcon = trend === undefined ? null : trend > 0 ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
    ) : trend < 0 ? (
        <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
        <Minus className="h-4 w-4 text-gray-400" />
    )

    return (
        <Card className={cn('border-2', variants[variant])}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                    <span>{title}</span>
                    {icon && (
                        <div className="text-gray-400">
                            {icon}
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900">
                            {value}
                        </p>
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                            {trendIcon}
                            <span className={cn(
                                'font-medium',
                                trend > 0 ? 'text-green-600' :
                                    trend < 0 ? 'text-red-600' :
                                        'text-gray-500'
                            )}>
                                {trend > 0 ? '+' : ''}{trend}%
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function StatsCards({ links, className }: StatsCardsProps) {
    const stats = calculateGlobalStats(links)

    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
            <StatCard
                title="Total des avis"
                value={stats.totalReviews}
                description="Tous liens confondus"
                icon={<span className="text-2xl">💬</span>}
            />

            <StatCard
                title="Note moyenne"
                value={`${stats.avgRating}/5`}
                description="Sur tous les avis"
                variant="primary"
                icon={<span className="text-2xl">⭐</span>}
            />

            <StatCard
                title="Taux positif"
                value={`${stats.positiveRate}%`}
                description="Avis 4-5 étoiles"
                variant="success"
                icon={<span className="text-2xl">📈</span>}
            />

            <StatCard
                title="Liens actifs"
                value={stats.activeLinks}
                description={`Sur ${links?.length || 0} liens`}
                icon={<span className="text-2xl">🔗</span>}
            />
        </div>
    )
}
