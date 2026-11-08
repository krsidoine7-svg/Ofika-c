'use client'

import { useState } from 'react'
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import {
  Sparkles,
  CheckCircle,
  Star,
  Crown,
  Eye,
  LayoutGrid,
  Briefcase,
  Moon,
  ShoppingBag,
  Leaf,
  type LucideIcon
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ProfileTemplateRenderer } from '@/components/features/profiles/ProfileTemplateRenderer'
import { TEMPLATES, resolveTemplateId, type TemplateId } from '@/lib/templates/registry'

interface TemplateSelectionStepProps {
  onNext: (selectedTemplate: string) => void
  onPrev: () => void
  formData: any
  selectedTemplate?: string
  onTemplateChange?: (templateId: string) => void
  isLoading?: boolean
}

// Profil d'aperçu construit à partir des données du formulaire
const createPreviewProfile = (formData: any, designChoice: string) => ({
  ...formData,
  id: formData?.id || 'preview',
  name: formData?.name || 'Votre Nom',
  custom_url: formData?.custom_url || formData?.username || 'votre-url',
  username: formData?.username || formData?.custom_url || 'votre-url',
  design_choice: designChoice,
  social_links: formData?.social_links || [],
  custom_links: formData?.custom_links || [],
  theme_settings: formData?.theme_settings || {},
})

// Icône et couleur de chaque template dans la liste
const TEMPLATE_ICONS: Record<TemplateId, { icon: LucideIcon; color: string }> = {
  editorial: { icon: Sparkles, color: 'text-stone-700' },
  carte: { icon: Crown, color: 'text-slate-800' },
  bento: { icon: LayoutGrid, color: 'text-lime-600' },
  noir_luxe: { icon: Moon, color: 'text-yellow-700' },
  immersif: { icon: Star, color: 'text-pink-600' },
  boutique: { icon: ShoppingBag, color: 'text-orange-600' },
  organique: { icon: Leaf, color: 'text-amber-700' },
  suisse: { icon: Briefcase, color: 'text-red-600' },
}

const templates = TEMPLATES.map((t) => ({ ...t, name: t.label, ...TEMPLATE_ICONS[t.id] }))

export function TemplateSelectionStep({
  onNext,
  onPrev,
  formData,
  selectedTemplate: initialTemplate,
  onTemplateChange,
  isLoading = false
}: TemplateSelectionStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    resolveTemplateId(initialTemplate || formData?.design_choice)
  )

  const handleNext = () => { onNext(selectedTemplate) }
  const handleTemplateSelect = (templateId: string) => { 
    setSelectedTemplate(templateId)
    onTemplateChange?.(templateId)
  }
  const getTemplateInfo = (templateId: string) => {
    return templates.find(t => t.id === templateId) || templates[0]
  }
  const selectedTemplateInfo = getTemplateInfo(selectedTemplate)

  const renderPreview = (designId: string) => {
    const profile = createPreviewProfile(formData, designId)
    return <ProfileTemplateRenderer profile={profile} designId={designId} isPreview />
  }

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full flex-1">
        {/* COLONNE SÉLECTION VERTICALE - GAUCHE */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <div className="flex-shrink-0">
            <h2 className="font-semibold text-base sm:text-lg mb-1">Choisissez un design</h2>
            <p className="text-xs text-gray-500 mb-3">Sélectionnez le design qui correspond le mieux à votre personnalité et voyez l'aperçu en temps réel.</p>
          </div>

          <div className="flex-1 pr-2 space-y-4 py-1">
            {/* --- Select déroulant MOBILE --- */}
            <div className="lg:hidden mb-2">
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un design..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <SelectItem value={template.id} key={template.id}>
                        <span className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${template.color}`} />
                          {template.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* --- Liste verticale DESKTOP --- */}
            <div className="hidden lg:grid grid-cols-2 gap-1.5 w-full pr-2">
              {templates.map(template => {
                const IconComponent = template.icon
                const isSelected = selectedTemplate === template.id
                return (
                  <Card
                    key={template.id}
                    className={`w-full border transition-all duration-200 px-2 shadow-none ${isSelected
                      ? 'ring-2 ring-gray-900 shadow-gray-100 border-gray-400'
                      : 'hover:shadow-gray-100 hover:shadow border-gray-200 cursor-pointer'
                      }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="flex-row gap-2 items-center py-2 px-2">
                      <IconComponent className={`h-4 w-4 ${template.color}`} />
                      <div className="flex-1 font-semibold text-gray-800 text-xs">{template.name}</div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-gray-900 ml-auto" />}
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            {/* Navigation buttons moved here */}
            <div className="flex justify-between pt-3 mt-3 border-t border-gray-100 flex-shrink-0 bg-white w-full pr-2">
              <Button variant="outline" onClick={onPrev} disabled={isLoading}>Précédent</Button>
              <Button onClick={handleNext} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{isLoading ? 'Création en cours...' : 'Créer ma page'}</Button>
            </div>

          </div>
        </div>

        {/* COLONNE APERÇU + DESCRIPTION - DROITE */}
        <div className="col-span-12 lg:col-span-5 hidden lg:flex flex-col items-center justify-start sticky top-2 self-start">
          <div className="flex flex-col items-center justify-center w-full max-w-[360px] -mt-8">
            <h3 className="font-semibold text-center text-xs uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-center gap-2 flex-shrink-0">
              <Eye className="w-3.5 h-3.5 text-orange-500" />
              Aperçu en temps réel
            </h3>

            {/* Spacer equivalent to the pill bar height in page.tsx for exact vertical alignment */}
            <div className="w-full mb-3 flex items-center justify-center py-1.5 px-3 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 mr-1.5" />
              <span>Design sélectionné : {selectedTemplateInfo.name}</span>
            </div>

            <IPhone15Frame showColorPicker={false} scaleClass="scale-[0.60] sm:scale-[0.65] lg:scale-[0.70] xl:scale-[0.75] origin-top">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTemplate}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full min-h-full relative flex flex-col animate-in fade-in zoom-in duration-300 bg-white"
                >
                  {renderPreview(selectedTemplate)}
                </motion.div>
              </AnimatePresence>
            </IPhone15Frame>

            {/* Légende */}
            <div className="mt-2 flex-shrink-0">
              <p className="text-[10px] text-gray-400 italic text-center max-w-[220px]">
                Aperçu interactif : modifiez le template pour voir le rendu en direct.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

