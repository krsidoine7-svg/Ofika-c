'use client'

import { useState } from 'react'
import { Star, Plus, Loader2, QrCode, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    StatsCards,
    CreateLinkDialog,
    ReviewsTable,
} from '@/components/features/reviews'
import { useReviewLinks, useCopyReviewLink, useDeleteReviewLink, useUpdateReviewLink } from '@/lib/hooks/useReviewLinks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Copy, ExternalLink, MoreVertical, Settings, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'

// ========================================
// COMPONENT
// ========================================

export default function AvisClientsPage() {
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('all')
    const [showQrLinkId, setShowQrLinkId] = useState<string | null>(null)
    const [deleteConfirmLinkId, setDeleteConfirmLinkId] = useState<string | null>(null)

    const { data: links, isLoading } = useReviewLinks()
    const { mutate: copyLink } = useCopyReviewLink()
    const { mutate: deleteLink } = useDeleteReviewLink()
    const { mutate: updateLink } = useUpdateReviewLink()

    // État vide (aucun lien créé)
    if (!isLoading && (!links || links.length === 0)) {
        return (
            <div className="p-4 sm:p-6 md:p-8 pt-6 font-sans max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Retour au tableau de bord</span>
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[55vh] text-center space-y-6 px-4">
                    <div className="rounded-2xl bg-orange-50 border border-orange-200/80 p-5 shadow-xs">
                        <Star className="w-12 h-12 text-orange-500 fill-orange-500" />
                    </div>

                    <div className="space-y-2 max-w-2xl">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            Collectez des avis clients authentiques
                        </h2>
                        <p className="text-sm sm:text-base text-slate-500">
                            Créez un lien personnalisé et commencez à recevoir des retours 5 étoiles de vos clients en moins de 2 minutes.
                        </p>
                    </div>

                    <ul className="text-left space-y-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-md text-xs sm:text-sm">
                        <li className="flex items-center gap-2.5 text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                            <span>Formulaire simple et rapide pour vos clients</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                            <span>Affichage direct sur votre profil public Link-in-Bio</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                            <span>Modération facile (approuver ou masquer un avis)</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                            <span>Export CSV et QR Code pour comptoir / vitrine</span>
                        </li>
                    </ul>

                    <Button size="lg" onClick={() => setShowCreateDialog(true)} className="gap-2 h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs">
                        <Plus className="h-4 w-4" />
                        Créer mon premier lien de collecte
                    </Button>

                    <CreateLinkDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
                </div>
            </div>
        )
    }

    // État avec données
    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8 pt-6 font-sans max-w-7xl mx-auto">
            {/* Fil d'Ariane & Bouton retour */}
            <div className="flex items-center gap-2 mb-1">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour au tableau de bord</span>
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Avis & Témoignages Clients</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Collectez, modérez et affichez les avis 5 étoiles de vos clients sur vos profils.
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs px-4">
                    <Plus className="h-4 w-4" />
                    Nouveau lien de collecte
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
                                                <DropdownMenuItem onClick={() => setShowQrLinkId(link.id)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    QR Code
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLink({ id: link.id, input: { is_active: !link.is_active } })}>
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    {link.is_active ? 'Désactiver' : 'Activer'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteConfirmLinkId(link.id)}
                                                    className="text-red-600 font-semibold"
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

            <Dialog open={showQrLinkId !== null} onOpenChange={(open) => !open && setShowQrLinkId(null)}>
                <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>QR Code de collecte d'avis</DialogTitle>
                        <DialogDescription>
                            Flashez ce code pour laisser un avis sur le lien de collecte.
                        </DialogDescription>
                    </DialogHeader>
                    {showQrLinkId && (() => {
                        const link = links?.find(l => l.id === showQrLinkId)
                        if (!link) return null
                        return (
                            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                                <div className="bg-white p-4 rounded-xl border shadow-sm">
                                    <QRCodeSVG
                                        id={`qr-review-${link.id}`}
                                        value={link.public_url!}
                                        size={200}
                                        includeMargin
                                        level="H"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-700 text-center break-all max-w-full">
                                    {link.public_url}
                                </p>
                                <div className="flex gap-2 w-full">
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            import('@/lib/utils/download-qr').then(m => {
                                                m.downloadSVGAsFile(`qr-review-${link.id}`, `qr-avis-${link.slug}`, 'png')
                                            })
                                        }}
                                    >
                                        Télécharger PNG
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            import('@/lib/utils/download-qr').then(m => {
                                                m.downloadSVGAsFile(`qr-review-${link.id}`, `qr-avis-${link.slug}`, 'svg')
                                            })
                                        }}
                                    >
                                        Télécharger SVG
                                    </Button>
                                </div>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmLinkId !== null} onOpenChange={(open) => !open && setDeleteConfirmLinkId(null)}>
                <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Confirmer l'archivage</DialogTitle>
                        <DialogDescription>
                            Cette action archive le lien. Les données restent accessibles pour vos futurs audits ou restaurations.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteConfirmLinkId && (() => {
                        const link = links?.find(l => l.id === deleteConfirmLinkId)
                        if (!link) return null
                        const totalReviews = link.stats?.total_reviews || 0
                        return (
                            <div className="space-y-6 py-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 space-y-2">
                                    <p className="font-semibold">⚠️ Cartographie d'impact UI/UX :</p>
                                    <p>
                                        Vous allez archiver le lien de collecte : <span className="font-bold">"{link.title}"</span>.
                                    </p>
                                    <p>
                                        Ce lien est rattaché à <span className="font-bold">{totalReviews}</span> avis client(s).
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            deleteLink({ id: link.id, deleteReviews: false })
                                            setDeleteConfirmLinkId(null)
                                        }}
                                    >
                                        Archiver uniquement le lien (conserver les {totalReviews} avis)
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            deleteLink({ id: link.id, deleteReviews: true })
                                            setDeleteConfirmLinkId(null)
                                        }}
                                    >
                                        Archiver le lien ET tous les {totalReviews} avis associés
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeleteConfirmLinkId(null)}
                                        className="text-gray-500 hover:text-gray-800"
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}
