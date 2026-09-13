'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CardDesign, NFCCardDesignStepProps, COLOR_OPTIONS } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, RotateCcw, QrCode, Building, User, Briefcase, Sparkles, Check, Image as ImageIcon, Trash2 } from "lucide-react"
import { NFCCard3DViewer } from './NFCCard3DViewer'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function NFCCardDesignStepV2({
  formData,
  selectedDesign,
  selectedColor,
  onDesignChange,
  onColorChange,
  onDataChange,
  onNext,
  onPrev,
  isLoading
}: NFCCardDesignStepProps) {
  const [backgroundColor, setBackgroundColor] = useState<'black' | 'white'>('black')
  const [cardDesign, setCardDesign] = useState<'design1' | 'design2'>('design1')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const designOptions: Record<'design1' | 'design2', CardDesign> = useMemo(() => ({
    design1: {
      id: 'design1',
      name: 'Design 1 - Balance Pro',
      description: 'Composition moderne avec logo et QR code équilibrés.',
      preview: '/designs/design1-preview.jpg',
      layout: {
        logoPosition: 'top-left',
        textAlignment: 'center',
        qrPosition: 'bottom-right',
        cardStyle: 'clean'
      }
    },
    design2: {
      id: 'design2',
      name: 'Design 2 - Executive Signature',
      description: 'Recto prestige centré sur votre marque + Verso orienté QR.',
      preview: '/designs/design2-preview.jpg',
      layout: {
        logoPosition: 'top-center',
        textAlignment: 'center',
        qrPosition: 'bottom-center',
        cardStyle: 'minimal'
      }
    }
  }), [])

  // Synchronisation avec le design sélectionné
  useEffect(() => {
    if (!selectedDesign) {
      setCardDesign('design1')
      onDesignChange(designOptions.design1)
    } else {
      const normalizedId = selectedDesign.id === 'design2' ? 'design2' : 'design1'
      setCardDesign(normalizedId)
    }
  }, [selectedDesign?.id, onDesignChange, designOptions])

  // Synchronisation de la couleur
  useEffect(() => {
    if (!selectedColor) {
      const defaultColor = {
        id: 'black',
        name: 'Noir Carbone',
        primary: '#0B0C10',
        secondary: '#1F2833',
        textColor: 'white' as const,
        gradient: 'linear-gradient(135deg, #0B0C10 0%, #1F2833 100%)'
      }
      onColorChange(defaultColor)
    } else {
      const colorId = (selectedColor.id === 'white' ? 'white' : 'black') as 'black' | 'white'
      setBackgroundColor(colorId)
    }
  }, [selectedColor?.id, onColorChange])

  // Gestionnaire de changement de design
  const handleDesignSelection = (designKey: 'design1' | 'design2') => {
    setCardDesign(designKey)
    onDesignChange(designOptions[designKey])
  }

  // Gestionnaire de couleur (Uniquement Noir et Blanc)
  const handleColorSelection = (colorId: 'black' | 'white') => {
    setBackgroundColor(colorId)
    const colorObj = {
      id: colorId,
      name: colorId === 'black' ? 'Noir Carbone' : 'Blanc Arctique',
      primary: colorId === 'black' ? '#0B0C10' : '#FFFFFF',
      secondary: colorId === 'black' ? '#1F2833' : '#F3F4F6',
      textColor: (colorId === 'white' ? 'black' : 'white') as 'black' | 'white',
      gradient: colorId === 'black'
        ? 'linear-gradient(135deg, #0B0C10 0%, #1F2833 100%)'
        : 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)'
    }
    onColorChange(colorObj)
  }

  // Upload de logo direct
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse (max 5MB)')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (onDataChange) {
          onDataChange({ logoUrl: result, logoFile: file })
          toast.success('Logo mis à jour sur votre carte')
        }
      }
      reader.readAsDataURL(file)
    }
  }, [onDataChange])

  const handleRemoveLogo = () => {
    if (onDataChange) {
      onDataChange({ logoUrl: undefined, logoFile: undefined })
      toast.info('Logo par défaut Ofika réappliqué')
    }
  }

  // Construction de l'URL de test pour le QR code
  const qrDisplayUrl = formData.customUrl
    ? `https://ofika.ci/${formData.customUrl}`
    : `https://ofika.ci/${(formData.fullName || 'demo').toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header épuré */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personnalisation 3D Haute Définition</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Visualisez votre carte sous tous les angles
        </h2>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Admirez le rendu physique en 3D de votre carte NFC. Tournez-la pour inspecter le recto et le verso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Colonne Gauche : Carte 3D Interactive & Contrôles (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-gradient-to-b from-slate-900/[0.03] to-slate-900/[0.08] dark:from-slate-800/40 dark:to-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            {/* 3D NFC Viewer */}
            <NFCCard3DViewer
              fullName={formData.fullName || 'Votre Nom'}
              jobTitle={formData.jobTitle || 'Votre Titre / Fonction'}
              company={formData.company || 'Nom de votre Entreprise'}
              logoUrl={formData.logoUrl}
              backgroundColor={backgroundColor}
              cardDesign={cardDesign}
              qrValue={qrDisplayUrl}
              autoRotateDefault={true}
              showControls={true}
            />
          </div>

          {/* Palette de finitions : Noir Mat & Blanc Pur */}
          <div className="w-full mt-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">
                Finition & Couleur de la carte
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Noir Carbone */}
                <button
                  type="button"
                  onClick={() => handleColorSelection('black')}
                  className={cn(
                    "flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all text-center cursor-pointer",
                    backgroundColor === 'black'
                      ? "border-orange-500 bg-orange-50/40 shadow-sm ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-[#12141a] border border-white/20 shadow-md mb-2 flex items-center justify-center">
                    {backgroundColor === 'black' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Noir Mat</span>
                  <span className="text-[10px] text-slate-400">Carbon Luxury</span>
                </button>

                {/* Blanc Minéral */}
                <button
                  type="button"
                  onClick={() => handleColorSelection('white')}
                  className={cn(
                    "flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all text-center cursor-pointer",
                    backgroundColor === 'white'
                      ? "border-orange-500 bg-orange-50/40 shadow-sm ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md mb-2 flex items-center justify-center">
                    {backgroundColor === 'white' && <Check className="w-4 h-4 text-slate-900" />}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Blanc Pur</span>
                  <span className="text-[10px] text-slate-400">Arctic Frosted</span>
                </button>
              </div>
            </div>

            {/* Sélecteur de style de carte */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">
                Disposition graphique
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleDesignSelection('design1')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-left flex flex-col justify-between",
                    cardDesign === 'design1'
                      ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Design 1 : Balance Pro</span>
                    {cardDesign === 'design1' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Logo & nom alignés, QR code structuré avec détails complets.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDesignSelection('design2')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-left flex flex-col justify-between",
                    cardDesign === 'design2'
                      ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Design 2 : Executive</span>
                    {cardDesign === 'design2' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Face avant 100% épurée avec logo central, verso signature.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Données de la carte & Upload de Logo (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Logo & Branding Card */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  Logo de votre carte
                </span>
                {formData.logoUrl && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    Personnalisé
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center p-2 bg-slate-50 flex-shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center font-medium">Logo Ofika</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
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
                    className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 rounded-xl border-slate-300 hover:border-orange-400 hover:text-orange-600"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.logoUrl ? 'Changer de logo' : 'Téléverser votre logo'}</span>
                  </Button>

                  {formData.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="w-full text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer le logo personnalisé
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Formats acceptés : PNG transparent, SVG, JPG. Résolution recommandée : 500x500px.
              </p>
            </CardContent>
          </Card>

          {/* Synthèse des informations gravées */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                Informations visibles sur la carte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <User className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Titulaire
                  </span>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formData.fullName || <span className="text-slate-400 italic">Non renseigné</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Briefcase className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Fonction / Poste
                  </span>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formData.jobTitle || <span className="text-slate-400 italic">Non renseigné</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Organisation / Entreprise
                  </span>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {formData.company || <span className="text-slate-400 italic">Non renseigné</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <QrCode className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Destination NFC & QR Code
                  </span>
                  <p className="text-xs font-mono text-orange-600 truncate">
                    {qrDisplayUrl}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
