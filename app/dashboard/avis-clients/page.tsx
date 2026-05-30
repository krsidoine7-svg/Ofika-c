'use client'

import { useState } from 'react'
import { Star, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/core/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs'
import {
    StatsCards,
    CreateLinkDialog,
    ReviewsTable,
} from '@/components/features/reviews'
import { useReviewLinks, useCopyReviewLink, useDeleteReviewLink } from '@/lib/hooks/useReviewLinks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Copy, ExternalLink, MoreVertical, Settings, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/core/ui/dropdown-menu'

// ========================================
// COMPONENT
// ========================================

export default function AvisClientsPage() {
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('all')

    const { data: links, isLoading } = useReviewLinks()
    const { mutate: copyLink } = useCopyReviewLink()
    const { mutate: deleteLink } = useDeleteReviewLink()

    // État vide (aucun lien créé)
    if (!isLoading && (!links || links.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
                <div className="rounded-full bg-orange-100 p-6">
                    <Star className="w-16 h-16 text-orange-600" />
                </div>

                <div className="space-y-2 max-w-2xl">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Collectez des avis clients authentiques
                    </h2>
                    <p className="text-lg text-gray-600">
                        Créez un lien personnalisé et commencez à recevoir des retours de vos clients en moins de 2 minutes
                    </p>
                </div>

                <ul className="text-left space-y-3 bg-gray-50 rounded-lg p-6 max-w-md">
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">Formulaire simple et rapide pour vos clients</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">Dashboard de suivi en temps réel</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">Export CSV et partage automatique</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-gray-700">Statistiques détaillées par lien</span>
                    </li>
                </ul>

                <Button size="lg" onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-5 w-5" />
                    Créer mon premier lien
                </Button>

                <CreateLinkDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
            </div>
        )
    }

    // État avec données
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Avis Clients</h1>
                    <p className="text-gray-600 mt-1">
                        Gérez et analysez vos avis clients
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau lien
                </Button>
            </div>

            {/* Stats globales */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
            ) : (
                <StatsCards links={links} />
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">
                        Tous les avis ({links?.reduce((sum, link) => sum + (link.stats?.total_reviews || 0), 0) || 0})
                    </TabsTrigger>
                    <TabsTrigger value="links">
                        Mes liens ({links?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Tous les avis */}
                <TabsContent value="all" className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">Filtrer par lien :</span>
                            {selectedLinkId ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="default" className="text-base px-3 py-1">
                                        {links?.find(l => l.id === selectedLinkId)?.title}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedLinkId(null)}
                                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                                        title="Voir tous les avis"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Badge variant="secondary" className="text-base px-3 py-1">
                                    Tous les avis
                                </Badge>
                            )}
                        </div>
                    </div>

                    <ReviewsTable linkId={selectedLinkId!} />
                </TabsContent>

                {/* Tab: Mes liens */}
                <TabsContent value="links" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {links?.map((link) => (
                            <Card key={link.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{link.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Créé {formatDistanceToNow(new Date(link.created_at), {
                                                    addSuffix: true,
                                                    locale: fr
                                                })}
                                            </CardDescription>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => copyLink(link.public_url!)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copier le lien
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(link.public_url, '_blank')}>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Ouvrir
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => deleteLink(link.id)}
                                                    className="text-red-600"
                                                >
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 rounded p-2">
                                            <p className="text-gray-600 text-xs">Avis</p>
                                            <p className="font-bold text-lg">{link.stats?.total_reviews || 0}</p>
                                        </div>
                                        <div className="bg-orange-50 rounded p-2">
                                            <p className="text-orange-600 text-xs">Note moy.</p>
                                            <p className="font-bold text-lg">
                                                {link.stats?.avg_rating ? `${link.stats.avg_rating}/5` : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Statut */}
                                    <div className="flex items-center gap-2">
                                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                                            {link.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
                                        {link.stats && link.stats.total_reviews > 0 && (
                                            <Badge variant="outline" className="text-green-600">
                                                {link.stats.positive_rate}% positif
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setSelectedLinkId(link.id)
                                            setActiveTab('all')
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        Voir les avis ({link.stats?.total_reviews || 0})
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <CreateLinkDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </div>
    )
}
