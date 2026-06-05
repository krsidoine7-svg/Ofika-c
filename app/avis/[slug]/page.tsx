import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicReviewForm } from '@/components/features/reviews'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'

// ========================================
// PAGE
// ========================================

export default async function PublicReviewPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // Récupérer le lien de collecte
    const { data: link, error } = await supabase
        .from('review_links')
        .select('*')
        .eq('slug', slug)
        .single()

    // Lien non trouvé
    if (error || !link) {
        notFound()
    }

    // Lien inactif
    if (!link.is_active) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
                    <div className="rounded-full bg-yellow-100 p-4 w-16 h-16 mx-auto flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Lien inactif
                    </h1>
                    <p className="text-gray-600">
                        Ce lien de collecte d'avis n'est plus actif. Veuillez contacter le propriétaire.
                    </p>
                </div>
            </div>
        )
    }

    // Formulaire actif
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="sm" showText />
                    </Link>
                    <span className="text-sm text-gray-500">
                        Collecte d'avis
                    </span>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Card principale */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        {/* En-tête */}
                        <div className="text-center mb-8 space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 mb-4">
                                <span className="text-3xl">⭐</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {link.title}
                            </h1>

                            <p className="text-lg text-gray-600 max-w-md mx-auto">
                                Votre avis compte énormément pour nous
                            </p>
                        </div>

                        {/* Séparateur */}
                        <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto mb-8" />

                        {/* Formulaire */}
                        <PublicReviewForm link={link} />
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Propulsé par{' '}
                            <Link
                                href="/"
                                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                Ofika
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

// ========================================
// METADATA
// ========================================

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: link } = await supabase
        .from('review_links')
        .select('title')
        .eq('slug', slug)
        .single()

    return {
        title: link?.title || 'Laisser un avis',
        description: `Partagez votre expérience et laissez un avis sur ${link?.title || 'ce service'}`,
    }
}
