'use client'

import { useState, useEffect } from 'react'
import { EmojiPicker } from '@/components/features/contacts/EmojiPicker'
import { PushNotificationManager } from '@/components/features/notifications/PushNotificationManager'
import { RGPDConsentModal } from '@/components/features/consent/RGPDConsentModal'
import { useAuthContext } from '@/lib/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { validateAndSanitizeContact } from '@/lib/validation/contact-schemas'

export default function ExampleIntegrationPage() {
    const { user } = useAuthContext()
    const [showRGPDModal, setShowRGPDModal] = useState(false)
    const [hasConsent, setHasConsent] = useState(false)
    const [contacts, setContacts] = useState<any[]>([])
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    })
    const supabase = createClient()

    useEffect(() => {
        if (user) {
            checkRGPDConsent()
        }
    }, [user])

    const checkRGPDConsent = async () => {
        if (!user) return

        const { data } = await supabase
            .from('user_consents')
            .select('*')
            .eq('user_id', user.id)
            .eq('consent_type', 'data_storage')
            .eq('consent_given', true)
            .single()

        if (data) {
            setHasConsent(true)
            loadContacts()
        } else {
            setShowRGPDModal(true)
        }
    }

    const loadContacts = async () => {
        if (!user) return

        const { data } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) {
            setContacts(data)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!hasConsent) {
            toast.error('Vous devez accepter le consentement RGPD')
            setShowRGPDModal(true)
            return
        }

        try {
            const validated = validateAndSanitizeContact({
                ...formData,
                emojis: selectedEmojis
            })

            const { data, error } = await supabase
                .from('contacts')
                .insert({
                    ...validated,
                    user_id: user?.id,
                    emojis: selectedEmojis,
                    emoji_tags: selectedEmojis
                })
                .select()
                .single()

            if (error) throw error

            await supabase.rpc('log_contact_activity', {
                p_contact_id: data.id,
                p_activity_type: 'add',
                p_metadata: { source: 'web_form' }
            })

            toast.success('✅ Contact créé avec succès !')
            setFormData({ name: '', email: '', phone: '', company: '' })
            setSelectedEmojis([])
            loadContacts()
        } catch (error: any) {
            console.error('Error:', error)
            toast.error(error.message || 'Erreur lors de la création')
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">🔐 Authentification Requise</h1>
                    <p className="text-gray-600 mb-6">Connectez-vous pour accéder aux fonctionnalités Ofika</p>
                    <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Se connecter
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {showRGPDModal && (
                <RGPDConsentModal
                    userId={user.id}
                    onConsentGiven={() => {
                        setHasConsent(true)
                        setShowRGPDModal(false)
                        loadContacts()
                    }}
                />
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">📇 Démo - 5 Fonctionnalités Ofika</h1>
                            <p className="text-gray-600 mt-2">Émotions, RGPD, Push Notifications, Validation, Sécurité</p>
                        </div>
                        <PushNotificationManager />
                    </div>
                </div>

                {/* Formulaire */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">➕ Créer un Contact</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nom complet *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="jean@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="+225 01 02 03 04 05"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Société</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ofika SaaS"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <EmojiPicker
                                selectedEmojis={selectedEmojis}
                                onEmojiToggle={(emoji) => {
                                    setSelectedEmojis(prev =>
                                        prev.includes(emoji) ? prev.filter(e => e !== emoji) : [...prev, emoji]
                                    )
                                }}
                                maxEmojis={5}
                            />
                            {selectedEmojis.length > 0 && (
                                <div className="flex gap-1">
                                    {selectedEmojis.map(emoji => (
                                        <span key={emoji} className="text-2xl">{emoji}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                        >
                            💾 Enregistrer le Contact
                        </button>
                    </form>
                </div>

                {/* Liste des contacts */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">👥 Vos Contacts ({contacts.length})</h2>
                    <div className="space-y-2">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div>
                                    <h3 className="font-medium">{contact.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {contact.email || contact.phone || 'Pas de coordonnées'}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {contact.emojis?.map((emoji: string, i: number) => (
                                        <span key={i} className="text-xl">{emoji}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Aucun contact pour le moment. Créez-en un ci-dessus ! ☝️
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer d'info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">✨ Fonctionnalités Activées</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                        <li>✅ Émotions/Emojis (40 emojis, max 5 par contact)</li>
                        <li>✅ Modal RGPD (consentement explicite requis)</li>
                        <li>✅ Notifications Push Web (bouton en haut à droite)</li>
                        <li>✅ Validation Anti-XSS (Zod + sanitization)</li>
                        <li>✅ Sécurité RLS (Row-Level Security Supabase)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
