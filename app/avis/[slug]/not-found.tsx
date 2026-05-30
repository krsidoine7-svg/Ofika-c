import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Page introuvable',
    description: 'Le lien que vous recherchez n\'existe pas ou a été supprimé',
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
                <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                    Lien introuvable
                </h1>

                <p className="text-gray-600">
                    Ce lien de collecte d'avis n'existe pas ou a été supprimé.
                </p>

                <div className="pt-4">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Retour à l'accueil
                    </a>
                </div>
            </div>
        </div>
    )
}
