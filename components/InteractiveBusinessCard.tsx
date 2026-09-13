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
    companyName: 'OFIKA GLOBAL',
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
    <div className="w-full max-w-full mx-auto px-2 sm:px-4 py-6 pb-20 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
        {/* Left Side: 3D Card Viewer */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-gradient-to-b from-slate-900/[0.03] to-slate-900/[0.08] p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <NFCCard3DViewer
              fullName={cardData.fullName || 'Alexandre Dupont'}
              jobTitle={cardData.jobTitle || 'Directeur Commercial'}
              company={cardData.companyName || 'OFIKA GLOBAL'}
              logoUrl={cardData.logo || undefined}
              backgroundColor={cardData.backgroundColor}
              cardDesign={cardDesign}
              autoRotateDefault={true}
              showControls={true}
            />
          </div>

          {/* Color & Material Selector */}
          <div className="w-full mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'black' }))}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                cardData.backgroundColor === 'black'
                  ? "border-orange-500 bg-orange-50 text-slate-900 ring-1 ring-orange-500"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              )}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#12141a] border border-white/20 inline-block" />
              <span>Noir Mat</span>
            </button>

            <button
              type="button"
              onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'white' }))}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                cardData.backgroundColor === 'white'
                  ? "border-orange-500 bg-orange-50 text-slate-900 ring-1 ring-orange-500"
                  : "border-slate-200 hover:border-slate-300 text-slate-600"
              )}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 inline-block" />
              <span>Blanc Pur</span>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-base">Essayez en temps réel</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="preview-name" className="text-xs font-bold text-slate-700">Nom & Prénom</Label>
                  <Input
                    id="preview-name"
                    value={cardData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Ex: Alexandre Dupont"
                    className="mt-1 text-sm rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-job" className="text-xs font-bold text-slate-700">Fonction / Titre</Label>
                  <Input
                    id="preview-job"
                    value={cardData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Ex: Directeur Général"
                    className="mt-1 text-sm rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-company" className="text-xs font-bold text-slate-700">Entreprise</Label>
                  <Input
                    id="preview-company"
                    value={cardData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ex: OFIKA TECHNOLOGIES"
                    className="mt-1 text-sm rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Logo</Label>
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
                      className="text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{cardData.logo ? 'Changer de logo' : 'Téléverser logo'}</span>
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

              <div className="pt-4 border-t border-slate-100">
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <span>Créer ma carte avec ces infos</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
