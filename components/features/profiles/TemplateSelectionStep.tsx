'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'
import { LinkInBioSocialCreator } from '@/components/features/profiles/LinkInBioSocialCreator'
import { LinkInBioEmeraude } from '@/components/features/profiles/LinkInBioEmeraude'
import { LinkInBioCJCD } from '@/components/features/profiles/LinkInBioCJCD'
import { motion, AnimatePresence } from 'framer-motion'
import { ScaledSmartphonePreview } from '@/components/ui/scaled-smartphone-preview'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import {
  Palette,
  Sparkles,
  CheckCircle,
  Star,
  Crown,
  Zap,
  Users,
  TrendingUp,
  Award,
  Eye,
  FileText,
  LayoutGrid,
  Briefcase
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface TemplateSelectionStepProps {
  onNext: (selectedTemplate: string) => void
  onPrev: () => void
  formData: any
  isLoading?: boolean
}

// Fonction pour créer le profil d'aperçu à partir des données du formulaire
const createPreviewProfile = (formData: any, designChoice: string) => {
  return {
    id: 'preview',
    user_id: 'preview-user',
    profile_type: formData.profile_type || 'public' as const,
    name: formData.name || 'Votre Nom',
    bio: formData.bio || '',
    image_url: formData.image_url || null,
    custom_url: formData.custom_url || formData.username || 'votre-url',
    username: formData.username || formData.custom_url || 'votre-url',
    email: formData.email || null,
    phone: formData.phone || null,
    location: formData.location || null,
    whatsapp: formData.whatsapp || null,
    facebook: formData.facebook || null,
    instagram: formData.instagram || null,
    twitter: formData.twitter || null,
    youtube: formData.youtube || null,
    tiktok: formData.tiktok || null,
    website: formData.website || null,
    design_choice: designChoice,
    color_theme: 'default',
    is_active: true,
    social_links: formData.social_links || [],
    custom_links: formData.custom_links || [],
    is_public: formData.is_public !== false,
    display_reviews: formData.display_reviews || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: (formData.custom_links || []).map((link: any, index: number) => ({
      id: `preview-${index}`,
      profile_id: 'preview',
      title: link.title,
      url: link.url,
      position: index,
      click_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }
}

// Configuration des templates avec priorités
const templates = [
  {
    id: 'premium',
    name: 'Émeraude',
    description: 'Design sophistiqué inspiré des instituts haut de gamme',
    icon: Crown,
    color: 'teal',
    priority: 'Nouveau',
    priorityIcon: Star,
    priorityColor: 'bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-bold',
    features: ['Fond asymétrique', 'Cartes arrondies élégantes', 'Couleurs Sarcelle & Sable', 'Boutons flottants exclusifs'],
    stats: { users: 'Nouveau', satisfaction: '5.0/5', conversion: '+30%' },
    targetAudience: 'Instituts, Beauté & Premium'
  },
  {
    id: 'social_creator',
    name: 'Social Creator',
    description: 'Style Behance / Instagram pro avec stats, onglets et boutons d\'action',
    icon: Star,
    color: 'blue',
    priority: 'Nouveau',
    priorityIcon: Crown,
    priorityColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold',
    features: ['Badge vérifié', 'Cartes de statistiques (Posts, Abonnés, Abonnements)', 'Onglets interactifs (Publications, Galerie, Réseau, Prix)', 'Boutons Suivre & Message'],
    stats: { users: 'Nouveau', satisfaction: '5.0/5', conversion: '+25%' },
    targetAudience: 'Créateurs, Photographes, Artistes & Influenceurs'
  },
  {
    id: 'cjcd',
    name: 'Design CJCD Personnalisable',
    description: 'Design officiel CJCD (Jeunes Cadres Dynamiques)',
    icon: Crown,
    color: 'yellow',
    priority: 'Nouveau',
    priorityIcon: Crown,
    priorityColor: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white font-bold',
    features: ['Thème Noir/Or/Blanc', 'Bannière personnalisable', 'Affichage du Poste', 'Boutons arrondis'],
    stats: { users: 'Nouveau', satisfaction: '5.0/5', conversion: '+30%' },
    targetAudience: 'Jeunes Cadres Dynamiques'
  },
  {
    id: 'design1',
    name: 'Design Classique',
    description: 'Layout vertical épuré et professionnel',
    icon: Palette,
    color: 'blue',
    priority: 'Populaire',
    priorityIcon: Zap,
    priorityColor: 'bg-blue-100 text-blue-800',
    features: ['Layout vertical', 'Design épuré', 'Style professionnel', 'Facile à lire'],
    stats: { users: '65%', satisfaction: '4.8/5', conversion: '+12%' },
    targetAudience: 'Professionnels & Entreprises'
  },
  {
    id: 'design2',
    name: 'Design',
    description: 'Grille de cartes avec effets interactifs',
    icon: Star,
    color: 'purple',
    priority: 'Grille',
    priorityIcon: Zap,
    priorityColor: 'bg-purple-100 text-purple-800',
    features: ['Grille de cartes', 'Effets hover', 'Icônes colorées', 'Design interactif'],
    stats: { users: '25%', satisfaction: '4.6/5', conversion: '+8%' },
    targetAudience: 'Créatifs & Designers'
  },
  {
    id: 'design3',
    name: 'Design Créatif',
    description: 'Effets visuels et animations avancées',
    icon: Sparkles,
    color: 'pink',
    priority: 'Artistique',
    priorityIcon: Zap,
    priorityColor: 'bg-pink-100 text-pink-800',
    features: ['Fond dégradé animé', 'Glassmorphism', 'Animations avancées', 'Design unique'],
    stats: { users: '10%', satisfaction: '4.9/5', conversion: '+15%' },
    targetAudience: 'Artistes & Créatifs'
  },
  {
    id: 'design4',
    name: 'Design Nature',
    description: 'Style minimaliste avec couleurs naturelles',
    icon: Award,
    color: 'emerald',
    priority: 'Nouveau',
    priorityIcon: Zap,
    priorityColor: 'bg-emerald-100 text-emerald-800',
    features: ['Couleurs naturelles', 'Style minimaliste', 'Header coloré', 'Design moderne'],
    stats: { users: '5%', satisfaction: '4.7/5', conversion: '+10%' },
    targetAudience: 'Minimalistes & Écologiques'
  },
  {
    id: 'influencer',
    name: 'Design Influenceur',
    description: 'Optimisé pour créateurs de contenu et influenceurs',
    icon: Users,
    color: 'rose',
    priority: 'Tendance',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    features: ['Mise en avant réseaux sociaux', 'Grille photo/vidéo', 'Boutons d\'action visibles', 'Design accrocheur'],
    stats: { users: '15%', satisfaction: '4.8/5', conversion: '+18%' },
    targetAudience: 'Influenceurs & Créateurs'
  },
  {
    id: 'ecommerce',
    name: 'Design E-commerce',
    description: 'Parfait pour vendeurs en ligne et boutiques',
    icon: Crown,
    color: 'amber',
    priority: 'Business',
    priorityIcon: Award,
    priorityColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    features: ['Mise en avant produits', 'Boutons d\'achat', 'Catalogue visuel', 'Call-to-action optimisés'],
    stats: { users: '12%', satisfaction: '4.7/5', conversion: '+22%' },
    targetAudience: 'Vendeurs & E-commerçants'
  },
  {
    id: 'design7',
    name: 'Design Dark Elegant',
    description: 'Design sombre élégant avec fond dégradé',
    icon: Star,
    color: 'slate',
    priority: 'Premium',
    priorityIcon: Crown,
    priorityColor: 'bg-gradient-to-r from-slate-700 to-gray-900 text-white',
    features: ['Fond sombre élégant', 'Photo circulaire centrée', 'Boutons blancs minimalistes', 'Design haut de gamme'],
    stats: { users: '8%', satisfaction: '4.9/5', conversion: '+20%' },
    targetAudience: 'Créatifs & Photographes'
  },
  {
    id: 'freelance',
    name: 'Design Freelance',
    description: 'Optimisé pour freelances et solopreneurs africains',
    icon: Users,
    color: 'blue',
    priority: 'Professionnel',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-blue-500 to-orange-400 text-white',
    features: ['Palette chaleureuse', 'CTA orange puissant', 'Social proof intégré', 'Design confiance'],
    stats: { users: '18%', satisfaction: '4.8/5', conversion: '+16%' },
    targetAudience: 'Freelances & Solopreneurs'
  }
]

export function TemplateSelectionStep({
  onNext,
  onPrev,
  formData,
  isLoading = false
}: TemplateSelectionStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('design1')
  const previewProfile = createPreviewProfile(formData, selectedTemplate)

  const handleNext = () => { onNext(selectedTemplate) }
  const handleTemplateSelect = (templateId: string) => { setSelectedTemplate(templateId) }
  const getTemplateInfo = (templateId: string) => {
    return templates.find(t => t.id === templateId) || templates[0]
  }
  const selectedTemplateInfo = getTemplateInfo(selectedTemplate)

  const renderPreview = (designId: string) => {
    const profile = createPreviewProfile(formData, designId)

    switch (designId) {
      case 'design1': return <LinkInBioDesign1 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design2': return <LinkInBioDesign2 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design3': return <LinkInBioDesign3 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design4': return <LinkInBioDesign4 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'influencer': return <LinkInBioInfluencer profile={profile} showAddToContacts={true} isPreview={true} />
      case 'ecommerce': return <LinkInBioEcommerce profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design7': return <LinkInBioDesign7 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'freelance': return <LinkInBioFreelance profile={profile} showAddToContacts={true} isPreview={true} />
      case 'premium': return <LinkInBioEmeraude profile={profile} showAddToContacts={true} isPreview={true} />
      case 'cjcd': return <LinkInBioCJCD profile={profile} showAddToContacts={true} isPreview={true} />
      case 'social_creator': return <LinkInBioSocialCreator profile={profile} showAddToContacts={true} isPreview={true} />
      default: return null
    }
  }

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 flex-1">
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
                          <IconComponent className={`h-4 w-4 text-${template.color}-600`} />
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
                      <IconComponent className={`h-4 w-4 text-${template.color}-600`} />
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
        <div className="col-span-12 lg:col-span-5 hidden lg:flex flex-col items-center justify-start sticky top-4 self-start pt-4">
          <div className="flex flex-col items-center justify-start w-full">
            <h3 className="font-semibold text-center text-xs uppercase tracking-wider text-gray-400 mb-2 items-center flex justify-center gap-2 flex-shrink-0">
              <Eye className="w-3.5 h-3.5" />
              Aperçu en temps réel
            </h3>

            <div className="w-[300px] flex justify-center mt-4">
              <IPhone15Frame showColorPicker={true} scaleClass="scale-[0.60] sm:scale-[0.65] lg:scale-[0.70] xl:scale-[0.75] origin-top">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-full animate-in fade-in zoom-in duration-300 w-full h-full bg-white"
                  >
                    {renderPreview(selectedTemplate) ?? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center italic p-8 gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                          <Palette className="w-8 h-8 text-gray-200" />
                        </div>
                        <p>Aucun aperçu disponible pour ce template</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </IPhone15Frame>
            </div>

            {/* Légende */}
            <div className="mt-2 flex-shrink-0 flex flex-col items-center gap-1">
              <Badge className="bg-gray-100 text-gray-900 border-none px-3 py-0.5 text-[10px] font-bold">
                Design : {selectedTemplateInfo.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
