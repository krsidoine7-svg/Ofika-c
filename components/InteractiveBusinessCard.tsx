'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowRight, Sparkles, Check, Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { CARD_DESIGNS, COLOR_OPTIONS } from '@/lib/types/nfc-card-onboarding'
import { NFCCard3DViewer } from './features/nfc-onboarding/NFCCard3DViewer'
import { cn } from '@/lib/utils'

interface BusinessCardData {
  fullName: string
  jobTitle: string
  companyName: string
  logo: string | null
  backgroundColor: 'black' | 'white'
}

export default function InteractiveBusinessCard() {
  const router = useRouter()
  const [cardDesign, setCardDesign] = useState<'design1' | 'design2'>('design1')
  const [cardData, setCardData] = useState<BusinessCardData>({
    fullName: 'Alexandre Dupont',
    jobTitle: 'Directeur Commercial',
    companyName: '',
    logo: null,
    backgroundColor: 'black'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCardData(prev => ({
          ...prev,
          logo: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleStartOnboarding = () => {
    const onboardingData = {
      formData: {
        fullName: cardData.fullName || '',
        company: cardData.companyName || '',
        jobTitle: cardData.jobTitle || '',
        logoUrl: cardData.logo || undefined,
        bio: '',
        phone: '',
        email: '',
        consentEssential: true,
        consentDataProcessing: true
      },
      selectedDesign: CARD_DESIGNS.find(d => d.id === (cardDesign === 'design1' ? 'classic' : 'modern')) || CARD_DESIGNS[0],
      selectedColor: COLOR_OPTIONS.find(c => c.id === cardData.backgroundColor) || COLOR_OPTIONS[0],
      isFromPreview: true
    }

    localStorage.setItem('nfc_card_preview_data', JSON.stringify(onboardingData))
    router.push('/onboarding/nfc-card?from_preview=true')
  }

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 py-4 pb-12 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-5xl mx-auto">
        {/* Left Side: 3D Card Viewer */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm relative overflow-hidden">
            <NFCCard3DViewer
              fullName={cardData.fullName || 'Alexandre Dupont'}
              jobTitle={cardData.jobTitle || 'Directeur Commercial'}
              company={cardData.companyName || ''}
              logoUrl={cardData.logo || undefined}
              backgroundColor={cardData.backgroundColor}
              cardDesign={cardDesign}
              autoRotateDefault={false}
              showControls={true}
            />
          </div>

          {/* Color & Material Selector */}
          <div className="w-full mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'black' }))}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm",
                cardData.backgroundColor === 'black'
                  ? "border-orange-500 bg-orange-50/70 text-gray-900 ring-2 ring-orange-400/30"
                  : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-[#12141a] border border-white/20 inline-block shadow-xs" />
              <span>Noir Mat</span>
            </button>

            <button
              type="button"
              onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'white' }))}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm",
                cardData.backgroundColor === 'white'
                  ? "border-orange-500 bg-orange-50/70 text-gray-900 ring-2 ring-orange-400/30"
                  : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white border border-gray-300 inline-block shadow-xs" />
              <span>Blanc Pur</span>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-gray-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Vos coordonnées</h3>
                    <p className="text-xs text-gray-500">Mise à jour instantanée du rendu</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Interactif
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <Label htmlFor="preview-name" className="text-xs font-bold text-gray-700">Nom & Prénom</Label>
                  <Input
                    id="preview-name"
                    value={cardData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Ex: Alexandre Dupont"
                    className="mt-1 text-sm rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-job" className="text-xs font-bold text-gray-700">Fonction / Titre</Label>
                  <Input
                    id="preview-job"
                    value={cardData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Ex: Directeur Général"
                    className="mt-1 text-sm rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-company" className="text-xs font-bold text-gray-700">Entreprise</Label>
                  <Input
                    id="preview-company"
                    value={cardData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ex: Nom de l'entreprise"
                    className="mt-1 text-sm rounded-xl border-gray-200 focus-visible:ring-orange-500"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Logo (optionnel)</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs rounded-xl flex items-center gap-1.5 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{cardData.logo ? 'Changer de logo' : 'Téléverser un logo'}</span>
                    </Button>

                    {cardData.logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCardData(prev => ({ ...prev, logo: null }))}
                        className="text-xs text-red-500 hover:text-red-700 h-8"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Commander ma carte avec ces infos</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Vos informations seront automatiquement pré-remplies lors de votre commande
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
