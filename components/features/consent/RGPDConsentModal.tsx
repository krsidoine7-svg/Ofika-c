'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface RGPDConsentModalProps {
    userId: string
    onConsentGiven: () => void
}

export function RGPDConsentModal({ userId, onConsentGiven }: RGPDConsentModalProps) {
    const [consents, setConsents] = useState({
        data_storage: false,
        push_notifications: false,
        analytics: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async () => {
        if (!consents.data_storage) {
            toast.error('Le consentement de stockage des données est obligatoire')
            return
        }

        setIsLoading(true)

        try {
            // User-Agent uniquement (pas d'IP pour éviter problème CSP)
            const userAgent = navigator.userAgent

            // Sauvegarder chaque consentement
            const consentRecords = Object.entries(consents).map(([type, given]) => ({
                user_id: userId,
                consent_type: type,
                consent_given: given,
                consent_version: '1.0',
                ip_address: null, // L'IP sera enregistrée côté serveur si nécessaire
                user_agent: userAgent
            }))

            const { error } = await supabase
                .from('user_consents')
                .upsert(consentRecords, { onConflict: 'user_id,consent_type' })

            if (error) throw error

            toast.success('✅ Consentements enregistrés')
            onConsentGiven()
        } catch (error: any) {
            console.error('Error saving consents:', error)
            toast.error('Erreur lors de l\'enregistrement')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🔒 Consentement RGPD
                    </h2>
                    <p className="text-gray-600">
                        Conformément au RGPD et aux lois ivoiriennes sur la protection des données personnelles,
                        nous avons besoin de votre consentement explicite.
                    </p>
                </div>

                {/* Consentements */}
                <div className="space-y-4 mb-6">
                    {/* Stockage des données (obligatoire) */}
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consents.data_storage}
                                onChange={(e) => setConsents({ ...consents, data_storage: e.target.checked })}
                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">
                                    Stockage et traitement des données <span className="text-red-600">*</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    J'accepte que mes données personnelles (nom, email, téléphone, contacts) soient
                                    stockées et traitées par Ofika pour fournir le service de gestion de contacts.
                                    <strong className="text-blue-800"> Ce consentement est obligatoire.</strong>
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Notifications push (optionnel) */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consents.push_notifications}
                                onChange={(e) => setConsents({ ...consents, push_notifications: e.target.checked })}
                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">
                                    Notifications push <span className="text-gray-500">(optionnel)</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    J'accepte de recevoir des notifications push pour les rappels de contacts,
                                    messages importants et mises à jour du service.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Analytics (optionnel) */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consents.analytics}
                                onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">
                                    Analytiques et amélioration <span className="text-gray-500">(optionnel)</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    J'accepte que mes données d'utilisation soient collectées de manière anonyme
                                    pour améliorer le service Ofika.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Info RGPD */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">📋 Vos droits RGPD</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Droit d'accès à vos données personnelles</li>
                        <li>• Droit de rectification et de suppression</li>
                        <li>• Droit d'opposition au traitement</li>
                        <li>• Droit à la portabilité des données</li>
                        <li>• Vous pouvez modifier vos consentements à tout moment dans les paramètres</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                        Données hébergées en UE (Supabase). Conforme RGPD 🇪🇺 et loi ivoirienne n°2013-450 🇨🇮
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !consents.data_storage}
                        className={`
              flex-1 py-3 px-6 rounded-lg font-medium transition-colors
              ${consents.data_storage
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
              ${isLoading ? 'opacity-50' : ''}
            `}
                    >
                        {isLoading ? '⏳ Enregistrement...' : '✅ Accepter et Continuer'}
                    </button>
                </div>

                {!consents.data_storage && (
                    <p className="text-center text-sm text-red-600 mt-3">
                        ⚠️ Le consentement de stockage est obligatoire pour utiliser Ofika
                    </p>
                )}
            </div>
        </div>
    )
}
