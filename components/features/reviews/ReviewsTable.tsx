'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/core/ui/input'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/core/ui/select'
import { ReviewCard } from './ReviewCard'
import { ExportButton } from './ExportButton'
import { useReviews, useModerateReview, useDeleteReview } from '@/lib/hooks/useReviews'
import type { ReviewFilters } from '@/lib/hooks/useReviews'

// ========================================
// TYPES
// ========================================

interface ReviewsTableProps {
    linkId: string
    className?: string
}

// ========================================
// COMPONENT
// ========================================

export function ReviewsTable({ linkId, className }: ReviewsTableProps) {
    const [filters, setFilters] = useState<ReviewFilters>({
        limit: 20,
        offset: 0,
    })

    const [searchInput, setSearchInput] = useState('')

    const { data, isLoading, error } = useReviews(linkId, filters)
    const { mutate: moderate } = useModerateReview(linkId)
    const { mutate: deleteReview } = useDeleteReview(linkId)

    const handleSearch = () => {
        setFilters({ ...filters, search: searchInput, offset: 0 })
    }

    const handleClearSearch = () => {
        setSearchInput('')
        setFilters({ ...filters, search: undefined, offset: 0 })
    }

    const handleRatingFilter = (value: string) => {
        const rating = value === 'all' ? undefined : parseInt(value)
        setFilters({ ...filters, rating, offset: 0 })
    }

    const handleStatusFilter = (value: string) => {
        const status = value === 'all' ? undefined : value as 'pending' | 'approved' | 'rejected'
        setFilters({ ...filters, status, offset: 0 })
    }

    const handleApprove = (reviewId: string) => {
        moderate({
            reviewId,
            input: { moderation_status: 'approved' },
        })
    }

    const handleReject = (reviewId: string) => {
        moderate({
            reviewId,
            input: { moderation_status: 'rejected' },
        })
    }

    const handleDelete = (reviewId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
            deleteReview(reviewId)
        }
    }

    const activeFiltersCount =
        (filters.rating ? 1 : 0) +
        (filters.status ? 1 : 0) +
        (filters.search ? 1 : 0)

    return (
        <div className={className}>
            {/* Barre de filtres */}
            <div className="bg-white rounded-lg border p-4 space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher par nom, email, commentaire..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                            {filters.search && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        <Button onClick={handleSearch} variant="secondary">
                            Rechercher
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    {/* Filtre rating */}
                    <Select
                        value={filters.rating?.toString() || 'all'}
                        onValueChange={handleRatingFilter}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Note" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les notes</SelectItem>
                            <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                            <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                            <SelectItem value="2">⭐⭐ (2)</SelectItem>
                            <SelectItem value="1">⭐ (1)</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filtre statut */}
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="approved">Approuvés</SelectItem>
                            <SelectItem value="rejected">Rejetés</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Badge filtres actifs */}
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary">
                            {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                        </Badge>
                    )}

                    <div className="ml-auto">
                        <ExportButton linkId={linkId} filters={filters} />
                    </div>
                </div>
            </div>

            {/* Résultats */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-gray-600">Chargement des avis...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">
                        Erreur de chargement : {(error as Error).message}
                    </p>
                </div>
            )}

            {data && (
                <>
                    {/* Compteur */}
                    <div className="mb-4 text-sm text-gray-600">
                        {data.pagination.total} avis trouvé{data.pagination.total > 1 ? 's' : ''}
                    </div>

                    {/* Liste des avis */}
                    {data.data.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                            <p className="text-gray-600">
                                Aucun avis ne correspond à vos filtres
                            </p>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setFilters({ limit: 20, offset: 0 })
                                        setSearchInput('')
                                    }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.data.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {data.pagination.total > filters.limit! && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={filters.offset === 0}
                                onClick={() => setFilters({
                                    ...filters,
                                    offset: Math.max(0, (filters.offset || 0) - (filters.limit || 20)),
                                })}
                            >
                                Précédent
                            </Button>

                            <span className="text-sm text-gray-600 text-center">
                                {filters.offset! + 1} - {Math.min(filters.offset! + filters.limit!, data.pagination.total)} sur {data.pagination.total}
                            </span>

                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={!data.pagination.has_more}
                                onClick={() => setFilters({
                                    ...filters,
                                    offset: (filters.offset || 0) + (filters.limit || 20),
                                })}
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
