'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'
import { trackProfileView, trackQRScan } from '@/lib/services/profile-analytics'
import { PublicProfile } from '@/lib/types/public-profile'

interface ProfileClientProps {
    initialProfile: PublicProfile | null
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
    const searchParams = useSearchParams()
    const [profile, setProfile] = useState<PublicProfile | null>(initialProfile)
    const [loading, setLoading] = useState(!initialProfile)
    const [error, setError] = useState<string | null>(initialProfile ? null : 'Profil non trouvé')

    // Synchronisation avec initialProfile (chargé côté serveur)
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile)
            setLoading(false)
            setError(null)
        } else {
            setError('Profil non trouvé')
            setLoading(false)
        }
    }, [initialProfile])

    // Tracker la vue du profil
    useEffect(() => {
        if (profile?.id) {
            // Enregistrer la vue du profil
            trackProfileView(profile.id, {
                referrer: typeof document !== 'undefined' ? document.referrer : undefined
            } as any).catch(err => console.error('Error tracking profile view:', err))

            // Si la source est un QR code ou un scan NFC, enregistrer le scan
            const isQR = searchParams.get('source') === 'qr' || searchParams.get('src') === 'qr' || searchParams.get('utm_source') === 'qr'
            if (isQR) {
                trackQRScan(profile.id).catch(err => console.error('Error tracking QR scan:', err))
            }
        }
    }, [profile?.id, searchParams])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <img
                    src="/assets/logos/logo-slogan.svg"
                    alt="Ofika"
                    className="w-48"
                />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil non trouvé</h2>
                    <p className="text-gray-600">
                        {error || 'Ce profil n\'existe pas ou n\'est pas accessible'}
                    </p>
                </div>
            </div>
        )
    }

    // Gérer le profil suspendu
    if (!profile.is_active) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3 border-2 border-red-100 shadow-sm">
                            <img src="/assets/logos/logo-orange.svg" alt="Ofika" className="w-12 h-12 grayscale opacity-50" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-2 rounded-xl shadow-lg animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">Profil Suspendu</h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {profile.suspension_reason || "Ce compte a été suspendu pour non-respect des conditions d'utilisation d'Ofika."}
                        </p>
                    </div>
                    <div className="pt-4">
                        <a href="https://wa.me/2250503681588" className="inline-flex items-center gap-2 text-orange-600 font-bold text-sm hover:underline">
                            Contacter le support Ofika
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // Sélection du template avec injection des données unifiées
    const renderTemplate = () => {
        const templateProps = { 
            profile, 
            showAddToContacts: true 
        }
        
        switch (profile.design_choice) {
            case 'design-modern':
            case 'design1':
                return <LinkInBioDesign1 {...templateProps as any} />
            case 'design-glass':
            case 'design2':
                return <LinkInBioDesign2 {...templateProps as any} />
            case 'design-neo':
            case 'design3':
                return <LinkInBioDesign3 {...templateProps as any} />
            case 'design-minimal':
            case 'design4':
                return <LinkInBioDesign4 {...templateProps as any} />
            case 'design-bento':
            case 'design7':
                return <LinkInBioDesign7 {...templateProps as any} />
            case 'design-influencer':
            case 'influencer':
                return <LinkInBioInfluencer {...templateProps as any} />
            case 'design-ecommerce':
            case 'ecommerce':
                return <LinkInBioEcommerce {...templateProps as any} />
            case 'design-freelance':
            case 'freelance':
                return <LinkInBioFreelance {...templateProps as any} />
            default:
                return <LinkInBioDesign1 {...templateProps as any} />
        }
    }

    return (
        <div className="ofika-profile-container selection:bg-orange-100">
            {renderTemplate()}
        </div>
    )
}
