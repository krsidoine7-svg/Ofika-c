'use client'

import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { ArrowLeft, CheckCircle, Globe, Layout, User, Link as LinkIcon } from 'lucide-react'
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'

interface PreviewStepProps {
    formData: any
    selectedDesign: string
    onNext: () => void
    onPrev: () => void
}

export function PreviewStep({ formData, selectedDesign, onNext, onPrev }: PreviewStepProps) {

    const previewProfile = {
        ...formData,
        id: 'preview',
        design_choice: selectedDesign,
        links: (formData.custom_links || []).map((l: any, i: number) => ({ ...l, id: `l-${i}` })),
        social_links: formData.social_links || []
    }

    const renderPreview = () => {
        switch (selectedDesign) {
            case 'design1': return <LinkInBioDesign1 profile={previewProfile} />
            case 'design2': return <LinkInBioDesign2 profile={previewProfile} />
            case 'design3': return <LinkInBioDesign3 profile={previewProfile} />
            case 'design4': return <LinkInBioDesign4 profile={previewProfile} />
            case 'influencer': return <LinkInBioInfluencer profile={previewProfile} />
            case 'ecommerce': return <LinkInBioEcommerce profile={previewProfile} />
            case 'design7': return <LinkInBioDesign7 profile={previewProfile} />
            case 'freelance': return <LinkInBioFreelance profile={previewProfile} />
            default: return <LinkInBioDesign1 profile={previewProfile} />
        }
    }

    return (
        <div className="space-y-6">


            <div className="grid lg:grid-cols-2 gap-8">
                {/* Visual Preview */}
                <div className="order-2 lg:order-1">
                    <Card className="overflow-hidden border-2 border-orange-100 shadow-xl">
                        <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 bg-white rounded text-[10px] py-1 px-3 border text-gray-400 truncate">
                                ofika.com/{formData.custom_url || formData.username || 'votre-lien'}
                            </div>
                        </div>
                        <div className="h-[500px] overflow-y-auto bg-white">
                            {renderPreview()}
                        </div>
                    </Card>
                </div>

                {/* Action Buttons and Progress */}
                <div className="order-1 lg:order-2 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 text-orange-800 font-bold mb-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                Prêt pour la publication
                            </div>
                            <p className="text-sm text-gray-600">
                                Votre page est configurée et prête à être partagée avec le monde entier.
                                Vous pourrez modifier son contenu et son design à tout moment.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onNext}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                Publier ma page maintenant
                                <CheckCircle className="w-6 h-6" />
                            </button>
                            
                            <button
                                onClick={onPrev}
                                className="w-full h-12 rounded-xl border-2 border-gray-100 font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-sm italic"
                            >
                                Revenir en arrière pour modifier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
