'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowRight, CreditCard, Check, Trash2 } from "lucide-react"
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
    fullName: '',
    jobTitle: '',
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
          <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden">
            <NFCCard3DViewer
              fullName={cardData.fullName || 'Votre Nom'}
              jobTitle={cardData.jobTitle || 'Votre Fonction'}
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
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                cardData.backgroundColor === 'black'
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
              )}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#12141a] border border-white/20 inline-block" />
              <span>Noir Mat</span>
            </button>

            <button
              type="button"
              onClick={() => setCardData(prev => ({ ...prev, backgroundColor: 'white' }))}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs",
                cardData.backgroundColor === 'white'
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
              )}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300 inline-block" />
              <span>Blanc Pur</span>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-neutral-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">Vos coordonnées</h3>
                    <p className="text-xs text-neutral-500">Mise à jour instantanée du rendu</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Interactif
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <Label htmlFor="preview-name" className="text-xs font-semibold text-neutral-700">Nom &amp; Prénom</Label>
                  <Input
                    id="preview-name"
                    value={cardData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Ex: Marie Konan"
                    className="mt-1 text-sm rounded-xl border-neutral-200 focus-visible:ring-neutral-900"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-job" className="text-xs font-semibold text-neutral-700">Fonction / Titre</Label>
                  <Input
                    id="preview-job"
                    value={cardData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Ex: Directrice Générale"
                    className="mt-1 text-sm rounded-xl border-neutral-200 focus-visible:ring-neutral-900"
                  />
                </div>

                <div>
                  <Label htmlFor="preview-company" className="text-xs font-semibold text-neutral-700">Entreprise</Label>
                  <Input
                    id="preview-company"
                    value={cardData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ex: Nom de l'entreprise"
                    className="mt-1 text-sm rounded-xl border-neutral-200 focus-visible:ring-neutral-900"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-700">Logo (optionnel)</Label>
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
                      className="text-xs rounded-xl flex items-center gap-1.5 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
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

              <div className="pt-4 border-t border-neutral-100">
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full h-12 rounded-xl bg-neutral-950 hover:bg-black text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span>Commander ma carte avec ces infos</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[11px] text-neutral-400 text-center mt-2">
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
